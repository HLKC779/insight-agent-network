-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_documents table for storing architectural patterns and documents
CREATE TABLE public.knowledge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'pattern', -- 'pattern', 'best_practice', 'case_study', 'guide'
  category TEXT NOT NULL DEFAULT 'general', -- 'neural_networks', 'distributed_systems', 'memory_architecture', etc.
  tags TEXT[] DEFAULT '{}',
  source_url TEXT,
  author TEXT,
  difficulty_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  confidence_score FLOAT DEFAULT 1.0,
  embedding vector(1536), -- OpenAI text-embedding-ada-002 dimensions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Create knowledge_chunks table for storing document chunks with embeddings
CREATE TABLE public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vector similarity search function
CREATE OR REPLACE FUNCTION public.search_knowledge(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_category text DEFAULT NULL,
  filter_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  title text,
  content text,
  document_type text,
  category text,
  tags text[],
  confidence_score float,
  similarity float,
  metadata jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kc.id,
    kc.document_id,
    kd.title,
    kc.content,
    kd.document_type,
    kd.category,
    kd.tags,
    kd.confidence_score,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kc.metadata
  FROM knowledge_chunks kc
  JOIN knowledge_documents kd ON kc.document_id = kd.id
  WHERE 
    kd.is_active = true
    AND (filter_category IS NULL OR kd.category = filter_category)
    AND (filter_type IS NULL OR kd.document_type = filter_type)
    AND (kc.embedding <=> query_embedding) < (1 - similarity_threshold)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create search function for documents (not chunks)
CREATE OR REPLACE FUNCTION public.search_knowledge_documents(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  document_type text,
  category text,
  tags text[],
  similarity float,
  metadata jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kd.id,
    kd.title,
    kd.content,
    kd.document_type,
    kd.category,
    kd.tags,
    1 - (kd.embedding <=> query_embedding) AS similarity,
    kd.metadata
  FROM knowledge_documents kd
  WHERE 
    kd.is_active = true
    AND kd.embedding IS NOT NULL
    AND (kd.embedding <=> query_embedding) < (1 - similarity_threshold)
  ORDER BY kd.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create indexes for better performance
CREATE INDEX idx_knowledge_chunks_embedding ON public.knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_documents_embedding ON public.knowledge_documents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_documents_category ON public.knowledge_documents(category);
CREATE INDEX idx_knowledge_documents_type ON public.knowledge_documents(document_type);
CREATE INDEX idx_knowledge_documents_active ON public.knowledge_documents(is_active);
CREATE INDEX idx_knowledge_chunks_document_id ON public.knowledge_chunks(document_id);

-- Enable RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for knowledge_documents
CREATE POLICY "Knowledge documents are viewable by everyone" 
ON public.knowledge_documents 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create knowledge documents" 
ON public.knowledge_documents 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own knowledge documents" 
ON public.knowledge_documents 
FOR UPDATE 
USING (auth.uid() = created_by OR auth.uid() IS NULL);

CREATE POLICY "Users can delete their own knowledge documents" 
ON public.knowledge_documents 
FOR DELETE 
USING (auth.uid() = created_by OR auth.uid() IS NULL);

-- Create RLS policies for knowledge_chunks
CREATE POLICY "Knowledge chunks are viewable by everyone" 
ON public.knowledge_chunks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM knowledge_documents kd 
    WHERE kd.id = knowledge_chunks.document_id 
    AND kd.is_active = true
  )
);

CREATE POLICY "Authenticated users can create knowledge chunks" 
ON public.knowledge_chunks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update knowledge chunks for their documents" 
ON public.knowledge_chunks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM knowledge_documents kd 
    WHERE kd.id = knowledge_chunks.document_id 
    AND (kd.created_by = auth.uid() OR auth.uid() IS NULL)
  )
);

CREATE POLICY "Users can delete knowledge chunks for their documents" 
ON public.knowledge_chunks 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM knowledge_documents kd 
    WHERE kd.id = knowledge_chunks.document_id 
    AND (kd.created_by = auth.uid() OR auth.uid() IS NULL)
  )
);

-- Create trigger for updating updated_at
CREATE TRIGGER update_knowledge_documents_updated_at
  BEFORE UPDATE ON public.knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();