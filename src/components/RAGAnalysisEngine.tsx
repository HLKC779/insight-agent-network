import { Component, Feature, UsageExampleData, AnalysisResult, ComponentRelationship, ArchitectureValidation, MemorySystem, ReasoningFramework } from './types/AnalysisTypes';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeResult {
  id: string;
  document_id: string;
  title: string;
  content: string;
  document_type: string;
  category: string;
  tags: string[];
  similarity: number;
  confidence_score: number;
}

export class RAGAnalysisEngine {
  private static async searchKnowledgeBase(query: string, category?: string): Promise<KnowledgeResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-search', {
        body: {
          query,
          similarity_threshold: 0.6,
          match_count: 8,
          category,
          search_type: 'chunks'
        }
      });

      if (error) {
        console.error('Knowledge search error:', error);
        return [];
      }

      return data?.results || [];
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  private static extractKeyTerms(description: string): string[] {
    const terms = description.toLowerCase()
      .split(/[^\w\s-]/)
      .filter(term => term.length > 3)
      .slice(0, 10);
    return [...new Set(terms)];
  }

  private static categorizeDescription(description: string): string[] {
    const categories: { [key: string]: string[] } = {
      'neural_networks': ['neural', 'network', 'transformer', 'attention', 'embedding', 'layer', 'neuron'],
      'distributed_systems': ['distributed', 'microservice', 'service', 'cluster', 'node', 'consensus', 'replication'],
      'machine_learning': ['learning', 'training', 'model', 'algorithm', 'prediction', 'classification'],
      'memory_architecture': ['memory', 'cache', 'storage', 'buffer', 'persistence', 'recall'],
      'reasoning': ['reasoning', 'logic', 'inference', 'decision', 'knowledge', 'rule']
    };

    const lowerDesc = description.toLowerCase();
    const matchedCategories: string[] = [];

    for (const [category, keywords] of Object.entries(categories)) {
      const matches = keywords.filter(keyword => lowerDesc.includes(keyword));
      if (matches.length >= 2) {
        matchedCategories.push(category);
      }
    }

    return matchedCategories.length > 0 ? matchedCategories : ['general'];
  }

  static async enhancedAnalyzeSystemDescription(description: string): Promise<AnalysisResult> {
    // Get baseline analysis from the original engine
    const { EnhancedAnalysisEngine } = await import('./EnhancedAnalysisEngine');
    const baselineAnalysis = EnhancedAnalysisEngine.analyzeSystemDescription(description);

    // Extract key terms and determine relevant categories
    const keyTerms = this.extractKeyTerms(description);
    const relevantCategories = this.categorizeDescription(description);

    console.log('RAG Analysis - Key terms:', keyTerms);
    console.log('RAG Analysis - Categories:', relevantCategories);

    // Search knowledge base for relevant information
    const knowledgeResults: KnowledgeResult[] = [];
    
    // Search with full description
    const generalResults = await this.searchKnowledgeBase(description);
    knowledgeResults.push(...generalResults);

    // Search by categories
    for (const category of relevantCategories) {
      const categoryResults = await this.searchKnowledgeBase(description, category);
      knowledgeResults.push(...categoryResults);
    }

    // Remove duplicates and sort by similarity
    const uniqueResults = Array.from(
      new Map(knowledgeResults.map(item => [item.id, item])).values()
    ).sort((a, b) => b.similarity - a.similarity).slice(0, 6);

    console.log(`RAG Analysis - Found ${uniqueResults.length} relevant knowledge items`);

    // Enhance components with knowledge-based insights
    const enhancedComponents = this.enhanceComponentsWithKnowledge(
      baselineAnalysis.components,
      uniqueResults
    );

    // Enhance features with knowledge-based recommendations
    const enhancedFeatures = this.enhanceFeaturesWithKnowledge(
      baselineAnalysis.features,
      uniqueResults
    );

    // Enhance architecture validation with knowledge-based recommendations
    const enhancedValidation = this.enhanceValidationWithKnowledge(
      baselineAnalysis.validation,
      uniqueResults
    );

    // Enhance memory analysis with knowledge-based insights
    const enhancedMemoryAnalysis = this.enhanceMemoryAnalysisWithKnowledge(
      baselineAnalysis.memoryAnalysis,
      uniqueResults
    );

    // Enhance reasoning analysis with knowledge-based insights
    const enhancedReasoningAnalysis = this.enhanceReasoningAnalysisWithKnowledge(
      baselineAnalysis.reasoningAnalysis,
      uniqueResults
    );

    return {
      ...baselineAnalysis,
      components: enhancedComponents,
      features: enhancedFeatures,
      validation: enhancedValidation,
      memoryAnalysis: enhancedMemoryAnalysis,
      reasoningAnalysis: enhancedReasoningAnalysis,
      knowledgeContext: {
        sources: uniqueResults.map(r => ({
          title: r.title,
          category: r.category,
          similarity: r.similarity,
          confidence: r.confidence_score
        })),
        enhancementCount: uniqueResults.length
      }
    };
  }

  private static enhanceComponentsWithKnowledge(
    components: Component[],
    knowledgeResults: KnowledgeResult[]
  ): Component[] {
    return components.map(component => {
      // Find relevant knowledge for this component
      const relevantKnowledge = knowledgeResults.filter(k => 
        k.category.includes(component.name.toLowerCase()) ||
        k.tags.some(tag => component.name.toLowerCase().includes(tag)) ||
        k.content.toLowerCase().includes(component.name.toLowerCase())
      );

      if (relevantKnowledge.length === 0) return component;

      // Extract additional insights from knowledge
      const knowledgeInsights = relevantKnowledge
        .map(k => k.content)
        .join(' ')
        .toLowerCase();

      // Enhance benefits with knowledge-based recommendations
      const additionalBenefits = [];
      if (knowledgeInsights.includes('scalab')) {
        additionalBenefits.push('Enhanced scalability through proven patterns');
      }
      if (knowledgeInsights.includes('resilience') || knowledgeInsights.includes('fault')) {
        additionalBenefits.push('Improved fault tolerance and resilience');
      }
      if (knowledgeInsights.includes('performance')) {
        additionalBenefits.push('Optimized performance characteristics');
      }

      // Enhance integration description with knowledge
      const knowledgeBasedIntegration = relevantKnowledge.length > 0
        ? `${component.integration} Enhanced with industry best practices for ${relevantKnowledge[0].category.replace('_', ' ')}.`
        : component.integration;

      return {
        ...component,
        benefits: [...component.benefits, ...additionalBenefits],
        integration: knowledgeBasedIntegration,
        confidence: Math.min(100, component.confidence + (relevantKnowledge.length * 5)),
        knowledgeEnhanced: true
      };
    });
  }

  private static enhanceFeaturesWithKnowledge(
    features: Feature[],
    knowledgeResults: KnowledgeResult[]
  ): Feature[] {
    const enhancedFeatures = [...features];

    // Add knowledge-based features
    const knowledgeCategories = [...new Set(knowledgeResults.map(k => k.category))];
    
    for (const category of knowledgeCategories) {
      const categoryKnowledge = knowledgeResults.filter(k => k.category === category);
      if (categoryKnowledge.length >= 2) {
        const categoryName = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        enhancedFeatures.push({
          name: `${categoryName} Best Practices`,
          description: `Incorporates proven patterns and best practices from ${categoryName} domain, ensuring robust and scalable implementation.`
        });
      }
    }

    return enhancedFeatures;
  }

  private static enhanceValidationWithKnowledge(
    validation: ArchitectureValidation,
    knowledgeResults: KnowledgeResult[]
  ): ArchitectureValidation {
    const knowledgeBasedRecommendations = [];
    
    // Extract recommendations from knowledge base
    for (const knowledge of knowledgeResults) {
      if (knowledge.content.includes('best practice') || knowledge.content.includes('recommendation')) {
        const sentences = knowledge.content.split('.').filter(s => 
          s.toLowerCase().includes('implement') || 
          s.toLowerCase().includes('use') ||
          s.toLowerCase().includes('consider')
        );
        knowledgeBasedRecommendations.push(...sentences.slice(0, 2));
      }
    }

    // Enhance score based on knowledge alignment
    const knowledgeAlignmentBonus = Math.min(15, knowledgeResults.length * 2);
    const enhancedScore = Math.min(100, validation.score + knowledgeAlignmentBonus);

    return {
      ...validation,
      score: enhancedScore,
      recommendations: [
        ...validation.recommendations,
        ...knowledgeBasedRecommendations.slice(0, 3)
      ],
      strengths: [
        ...validation.strengths,
        knowledgeResults.length > 3 ? 'Strong alignment with industry best practices' : ''
      ].filter(Boolean)
    };
  }

  private static enhanceMemoryAnalysisWithKnowledge(
    memoryAnalysis: MemorySystem,
    knowledgeResults: KnowledgeResult[]
  ): MemorySystem {
    const memoryKnowledge = knowledgeResults.filter(k => 
      k.category === 'memory_architecture' || 
      k.tags.includes('memory') ||
      k.content.toLowerCase().includes('memory')
    );

    if (memoryKnowledge.length === 0) return memoryAnalysis;

    // Extract memory insights from knowledge
    const memoryInsights = memoryKnowledge.map(k => k.content).join(' ').toLowerCase();
    
    const enhancedRecommendations = [...memoryAnalysis.recommendations];
    
    if (memoryInsights.includes('working memory') && !memoryAnalysis.types.includes('working')) {
      enhancedRecommendations.push('Consider implementing working memory for temporary processing based on neural architecture patterns');
    }
    
    if (memoryInsights.includes('attention') && memoryAnalysis.types.length > 0) {
      enhancedRecommendations.push('Leverage attention mechanisms for selective memory access and retrieval');
    }

    return {
      ...memoryAnalysis,
      recommendations: enhancedRecommendations,
      architecture: memoryKnowledge.length > 1 ? 'knowledge-enhanced' : memoryAnalysis.architecture
    };
  }

  private static enhanceReasoningAnalysisWithKnowledge(
    reasoningAnalysis: ReasoningFramework,
    knowledgeResults: KnowledgeResult[]
  ): ReasoningFramework {
    const reasoningKnowledge = knowledgeResults.filter(k => 
      k.category === 'reasoning' || 
      k.tags.includes('reasoning') ||
      k.content.toLowerCase().includes('reasoning')
    );

    if (reasoningKnowledge.length === 0) return reasoningAnalysis;

    // Extract reasoning capabilities from knowledge
    const reasoningInsights = reasoningKnowledge.map(k => k.content).join(' ').toLowerCase();
    
    const additionalCapabilities = [];
    if (reasoningInsights.includes('strategic') && !reasoningAnalysis.capabilities.includes('strategic planning')) {
      additionalCapabilities.push('strategic planning');
    }
    
    if (reasoningInsights.includes('causal') && !reasoningAnalysis.capabilities.includes('causal reasoning')) {
      additionalCapabilities.push('causal reasoning');
    }

    return {
      ...reasoningAnalysis,
      capabilities: [...reasoningAnalysis.capabilities, ...additionalCapabilities],
      complexity: reasoningKnowledge.length > 2 ? 'high' : reasoningAnalysis.complexity
    };
  }
}