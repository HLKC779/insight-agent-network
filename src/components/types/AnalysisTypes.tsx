export interface Component {
  name: string;
  keyPhrases: string[];
  purpose: string;
  subcomponents: string[];
  integration: string;
  benefits: string[];
  confidence?: number;
  relationships?: ComponentRelationship[];
}

export interface Feature {
  name: string;
  description: string;
}

export interface UsageComponent {
  name: string;
  usage: string;
}

export interface UsageExampleData {
  scenario: string;
  components: UsageComponent[];
  outcomes: string[];
}

export interface ComponentRelationship {
  source: string;
  target: string;
  type: string;
  strength: number;
  description: string;
}

export interface ArchitectureValidation {
  score: number;
  issues: string[];
  recommendations: string[];
  strengths: string[];
}

export interface MemorySystem {
  types: string[];
  architecture: 'hierarchical' | 'flat' | 'distributed';
  persistence: 'persistent' | 'volatile' | 'hybrid';
  capacity: 'fixed' | 'dynamic' | 'unlimited';
  recommendations: string[];
}

export interface ReasoningFramework {
  types: string[];
  complexity: 'low' | 'medium' | 'high';
  explainability: 'low' | 'medium' | 'high';
  capabilities: string[];
}

export interface AnalysisResult {
  components: Component[];
  features: Feature[];
  example: UsageExampleData;
  relationships?: ComponentRelationship[];
  validation?: ArchitectureValidation;
  memoryAnalysis?: MemorySystem;
  reasoningAnalysis?: ReasoningFramework;
}