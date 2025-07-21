import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Architectural patterns and knowledge base content
const knowledgeDocuments = [
  {
    title: "Microservices Architecture Pattern",
    content: `Microservices architecture is a design approach where applications are built as a collection of loosely coupled services. Each service is independently deployable and scalable.

Key characteristics:
- Service autonomy: Each service owns its data and business logic
- Decentralized governance: Teams can choose their own technology stacks
- Failure isolation: Failures in one service don't cascade to others
- Independent deployment: Services can be deployed independently

Best practices:
- Use API gateways for external communication
- Implement circuit breakers for resilience
- Use event-driven communication between services
- Implement distributed tracing for observability
- Design for eventual consistency

Common challenges:
- Network latency and reliability
- Data consistency across services
- Service discovery and load balancing
- Monitoring and debugging distributed systems`,
    document_type: "pattern",
    category: "distributed_systems",
    tags: ["microservices", "distributed", "scalability", "architecture"],
    difficulty_level: "intermediate",
    confidence_score: 0.95
  },
  {
    title: "Neural Network Memory Architecture",
    content: `Neural network memory architectures provide mechanisms for storing and retrieving information during learning and inference.

Types of memory systems:
- Working memory: Temporary storage for current computations
- Long-term memory: Persistent storage of learned patterns
- Episodic memory: Storage of specific experiences and episodes
- Semantic memory: Storage of factual knowledge and concepts

Architecture patterns:
- Memory-augmented networks: External memory matrix with read/write heads
- Neural Turing Machines: Differentiable memory access mechanisms
- Transformer memory: Self-attention mechanisms for memory access
- Recurrent memory: Hidden state persistence across time steps

Implementation considerations:
- Memory capacity and scalability
- Read/write mechanisms and addressing
- Memory decay and forgetting strategies
- Interference and memory consolidation`,
    document_type: "pattern",
    category: "neural_networks",
    tags: ["memory", "neural networks", "attention", "learning"],
    difficulty_level: "advanced",
    confidence_score: 0.92
  },
  {
    title: "Event-Driven Architecture Best Practices",
    content: `Event-driven architecture (EDA) is a design paradigm where system components communicate through events.

Core principles:
- Event producers and consumers are decoupled
- Events are immutable facts about what happened
- Systems react to events asynchronously
- Event stores provide audit trails and replay capabilities

Event patterns:
- Event notification: Simple event messages
- Event-carried state transfer: Events contain full state
- Event sourcing: Events as the source of truth
- CQRS: Command Query Responsibility Segregation

Implementation strategies:
- Use message brokers for reliable delivery
- Implement event schemas and versioning
- Design for idempotency and exactly-once processing
- Monitor event flow and processing latency
- Handle event ordering and out-of-order delivery`,
    document_type: "best_practice",
    category: "distributed_systems",
    tags: ["events", "messaging", "asynchronous", "decoupling"],
    difficulty_level: "intermediate",
    confidence_score: 0.88
  },
  {
    title: "Attention Mechanisms in AI Systems",
    content: `Attention mechanisms allow neural networks to focus on relevant parts of input sequences, dramatically improving performance in tasks like translation and image recognition.

Types of attention:
- Self-attention: Relating different positions within a sequence
- Cross-attention: Relating sequences from different modalities
- Multi-head attention: Multiple attention mechanisms in parallel
- Scaled dot-product attention: Efficient computation method

Architectural implementations:
- Transformer models: Pure attention-based architectures
- Attention in RNNs: Augmenting recurrent networks
- Visual attention: Focusing on image regions
- Memory attention: Accessing external memory systems

Design considerations:
- Computational complexity (quadratic in sequence length)
- Position encoding for sequence information
- Attention dropout for regularization
- Causal masking for autoregressive models`,
    document_type: "guide",
    category: "neural_networks",
    tags: ["attention", "transformer", "sequence", "focus"],
    difficulty_level: "advanced",
    confidence_score: 0.94
  },
  {
    title: "Distributed System Consensus Algorithms",
    content: `Consensus algorithms enable distributed systems to agree on a single value despite failures and network partitions.

Popular algorithms:
- Raft: Leader-based consensus with strong consistency
- PBFT: Byzantine fault tolerance for adversarial environments
- Proof of Work: Blockchain consensus mechanism
- Proof of Stake: Energy-efficient blockchain consensus

Key properties:
- Safety: Never returning incorrect results
- Liveness: Eventually making progress
- Fault tolerance: Working despite node failures
- Network partition tolerance: Handling split networks

Implementation patterns:
- Leader election and log replication
- Quorum-based decision making
- State machine replication
- Conflict detection and resolution
- Recovery and catch-up mechanisms`,
    document_type: "pattern",
    category: "distributed_systems",
    tags: ["consensus", "distributed", "fault tolerance", "replication"],
    difficulty_level: "advanced",
    confidence_score: 0.91
  },
  {
    title: "Reinforcement Learning Architecture",
    content: `Reinforcement learning systems learn optimal behaviors through interaction with environments, using rewards and penalties to guide learning.

Core components:
- Agent: The learning system making decisions
- Environment: The world the agent interacts with
- State space: All possible situations the agent can be in
- Action space: All possible actions the agent can take
- Reward function: Feedback mechanism for learning

Architectural patterns:
- Value-based methods: Learning state or action values
- Policy-based methods: Learning action probabilities directly
- Actor-critic methods: Combining value and policy learning
- Model-based methods: Learning environment dynamics

Implementation considerations:
- Exploration vs exploitation balance
- Function approximation for large state spaces
- Experience replay and memory management
- Multi-agent coordination and competition
- Transfer learning across environments`,
    document_type: "pattern",
    category: "machine_learning",
    tags: ["reinforcement learning", "agent", "environment", "policy"],
    difficulty_level: "advanced",
    confidence_score: 0.89
  }
];

async function chunkText(text: string, maxChunkSize: number = 1000): Promise<string[]> {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence.trim();
    } else {
      currentChunk += (currentChunk.length > 0 ? '. ' : '') + sentence.trim();
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function generateEmbedding(text: string, openAIApiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
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

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { force = false } = await req.json();

    console.log('Starting knowledge base seeding...');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if knowledge base is already seeded
    if (!force) {
      const { count } = await supabase
        .from('knowledge_documents')
        .select('*', { count: 'exact', head: true });

      if (count && count > 0) {
        return new Response(JSON.stringify({ 
          message: 'Knowledge base already exists. Use force=true to reseed.',
          documents_count: count,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let processedDocuments = 0;
    let totalChunks = 0;

    for (const doc of knowledgeDocuments) {
      console.log(`Processing document: ${doc.title}`);

      // Generate embedding for the full document
      const documentEmbedding = await generateEmbedding(doc.content, openAIApiKey);

      // Insert the document
      const { data: documentData, error: docError } = await supabase
        .from('knowledge_documents')
        .insert({
          title: doc.title,
          content: doc.content,
          document_type: doc.document_type,
          category: doc.category,
          tags: doc.tags,
          difficulty_level: doc.difficulty_level,
          confidence_score: doc.confidence_score,
          embedding: documentEmbedding,
          created_by: null // System-created documents
        })
        .select()
        .single();

      if (docError) {
        console.error('Error inserting document:', docError);
        continue;
      }

      // Chunk the document content
      const chunks = await chunkText(doc.content, 800);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkEmbedding = await generateEmbedding(chunks[i], openAIApiKey);
        
        const { error: chunkError } = await supabase
          .from('knowledge_chunks')
          .insert({
            document_id: documentData.id,
            content: chunks[i],
            chunk_index: i,
            embedding: chunkEmbedding
          });

        if (chunkError) {
          console.error('Error inserting chunk:', chunkError);
        } else {
          totalChunks++;
        }
      }

      processedDocuments++;
      console.log(`Processed ${doc.title} with ${chunks.length} chunks`);
    }

    console.log(`Knowledge base seeding completed: ${processedDocuments} documents, ${totalChunks} chunks`);

    return new Response(JSON.stringify({ 
      message: 'Knowledge base seeded successfully',
      documents_processed: processedDocuments,
      chunks_created: totalChunks,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seed-knowledge-base function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});