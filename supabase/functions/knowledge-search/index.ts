import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      query, 
      similarity_threshold = 0.7, 
      match_count = 10,
      category = null,
      document_type = null,
      search_type = 'chunks' // 'chunks' or 'documents'
    } = await req.json();

    if (!query) {
      throw new Error('Query is required for knowledge search');
    }

    console.log('Searching knowledge base for:', query);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let searchResults;

    if (search_type === 'documents') {
      // Search full documents
      const { data, error } = await supabase.rpc('search_knowledge_documents', {
        query_embedding: queryEmbedding,
        similarity_threshold,
        match_count
      });

      if (error) {
        throw new Error(`Knowledge search error: ${error.message}`);
      }

      searchResults = data;
    } else {
      // Search chunks
      const { data, error } = await supabase.rpc('search_knowledge', {
        query_embedding: queryEmbedding,
        similarity_threshold,
        match_count,
        filter_category: category,
        filter_type: document_type
      });

      if (error) {
        throw new Error(`Knowledge search error: ${error.message}`);
      }

      searchResults = data;
    }

    console.log(`Found ${searchResults?.length || 0} relevant knowledge items`);

    return new Response(JSON.stringify({ 
      results: searchResults || [],
      query,
      search_type,
      filters: { category, document_type },
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in knowledge-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      results: [],
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});