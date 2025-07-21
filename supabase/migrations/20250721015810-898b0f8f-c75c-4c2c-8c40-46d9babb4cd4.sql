-- Fix dangerous RLS policies for knowledge_documents table
-- Remove the overly permissive anonymous access policy
DROP POLICY IF EXISTS "Users can delete their own knowledge documents" ON public.knowledge_documents;
DROP POLICY IF EXISTS "Users can update their own knowledge documents" ON public.knowledge_documents;

-- Create secure RLS policies that require authentication
CREATE POLICY "Authenticated users can delete their own knowledge documents" 
ON public.knowledge_documents 
FOR DELETE 
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update their own knowledge documents" 
ON public.knowledge_documents 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Fix the knowledge_chunks RLS policies to remove anonymous access
DROP POLICY IF EXISTS "Users can delete knowledge chunks for their documents" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Users can update knowledge chunks for their documents" ON public.knowledge_chunks;

CREATE POLICY "Authenticated users can delete knowledge chunks for their documents" 
ON public.knowledge_chunks 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM knowledge_documents kd 
    WHERE kd.id = knowledge_chunks.document_id 
    AND kd.created_by = auth.uid()
  )
);

CREATE POLICY "Authenticated users can update knowledge chunks for their documents" 
ON public.knowledge_chunks 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM knowledge_documents kd 
    WHERE kd.id = knowledge_chunks.document_id 
    AND kd.created_by = auth.uid()
  )
);

-- Fix database function security by setting proper search_path
CREATE OR REPLACE FUNCTION public.search_knowledge(
  query_embedding vector(1536), 
  similarity_threshold float DEFAULT 0.7, 
  match_count int DEFAULT 10, 
  filter_category text DEFAULT NULL, 
  filter_type text DEFAULT NULL
) 
RETURNS TABLE(
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.search_knowledge_documents(
  query_embedding vector(1536), 
  similarity_threshold float DEFAULT 0.7, 
  match_count int DEFAULT 5
) 
RETURNS TABLE(
  id uuid, 
  title text, 
  content text, 
  document_type text, 
  category text, 
  tags text[], 
  similarity float, 
  metadata jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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