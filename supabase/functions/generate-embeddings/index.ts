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
    const { text, documentId, chunkIndex = 0 } = await req.json();

    if (!text) {
      throw new Error('Text is required for embedding generation');
    }

    console.log('Generating embeddings for text:', text.substring(0, 100) + '...');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Generate embedding using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log('Embedding generated successfully, dimension:', embedding.length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If documentId is provided, update the document's embedding
    if (documentId) {
      console.log('Updating document embedding for ID:', documentId);
      
      const { error: updateError } = await supabase
        .from('knowledge_documents')
        .update({ embedding })
        .eq('id', documentId);

      if (updateError) {
        throw new Error(`Failed to update document embedding: ${updateError.message}`);
      }

      // Also create/update chunk if this is a chunked document
      if (chunkIndex !== undefined) {
        const { error: chunkError } = await supabase
          .from('knowledge_chunks')
          .upsert({
            document_id: documentId,
            content: text,
            chunk_index: chunkIndex,
            embedding: embedding
          });

        if (chunkError) {
          console.error('Failed to upsert chunk:', chunkError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      embedding,
      dimension: embedding.length,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});