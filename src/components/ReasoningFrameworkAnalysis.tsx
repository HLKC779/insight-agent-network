import { AnalysisCard } from './AnalysisCard';
import { ReasoningFramework } from './types/AnalysisTypes';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, Lightbulb, CheckCircle } from 'lucide-react';

interface ReasoningFrameworkAnalysisProps {
  reasoningFramework: ReasoningFramework;
}

export function ReasoningFrameworkAnalysis({ reasoningFramework }: ReasoningFrameworkAnalysisProps) {
  const reasoningTypeDescriptions = {
    deductive: 'Logical reasoning from general principles to specific conclusions',
    inductive: 'Pattern-based reasoning from specific observations to general principles',
    abductive: 'Hypothesis generation and best explanation reasoning',
    causal: 'Understanding and reasoning about cause-and-effect relationships',
    analogical: 'Reasoning by drawing parallels between similar situations',
    temporal: 'Time-aware reasoning considering sequence and duration'
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-red-600 bg-red-100 border-red-200';
    }
  };

  const getExplainabilityColor = (explainability: string) => {
    switch (explainability) {
      case 'high': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'medium': return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getComplexityScore = (complexity: string) => {
    switch (complexity) {
      case 'high': return 85;
      case 'medium': return 60;
      default: return 35;
    }
  };

  const getExplainabilityScore = (explainability: string) => {
    switch (explainability) {
      case 'high': return 90;
      case 'medium': return 65;
      default: return 40;
    }
  };

  const complexityScore = getComplexityScore(reasoningFramework.complexity);
  const explainabilityScore = getExplainabilityScore(reasoningFramework.explainability);

  return (
    <AnalysisCard
      title="Reasoning Framework Analysis"
      description="Analysis of cognitive reasoning capabilities and logical processing"
      icon={Brain}
      variant="analysis"
    >
      <div className="space-y-6">
        {/* Reasoning Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-analysis" />
              <span className="font-semibold">Complexity</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{complexityScore}%</div>
              <Progress value={complexityScore} className="h-2" />
              <Badge className={getComplexityColor(reasoningFramework.complexity)}>
                {reasoningFramework.complexity} complexity
              </Badge>
            </div>
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="h-5 w-5 text-analysis" />
              <span className="font-semibold">Explainability</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{explainabilityScore}%</div>
              <Progress value={explainabilityScore} className="h-2" />
              <Badge className={getExplainabilityColor(reasoningFramework.explainability)}>
                {reasoningFramework.explainability} explainability
              </Badge>
            </div>
          </div>
        </div>

        {/* Reasoning Types */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Reasoning Types Detected
          </h4>
          
          {reasoningFramework.types.length > 0 ? (
            <div className="grid gap-3">
              {reasoningFramework.types.map((type, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {type} Reasoning
                    </Badge>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reasoningTypeDescriptions[type] || 'Specialized reasoning approach for domain-specific problem solving'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No specific reasoning types detected</p>
              <p className="text-sm">Basic logical processing capabilities assumed</p>
            </div>
          )}
        </div>

        {/* Capabilities */}
        {reasoningFramework.capabilities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Cognitive Capabilities
            </h4>
            
            <div className="grid md:grid-cols-2 gap-2">
              {reasoningFramework.capabilities.map((capability, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm capitalize">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Framework Assessment */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="font-semibold">Framework Assessment</h4>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-3 border rounded-lg">
              <div className="text-lg font-bold text-primary">{reasoningFramework.types.length}</div>
              <div className="text-xs text-muted-foreground">Reasoning Types</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-lg font-bold text-primary">{reasoningFramework.capabilities.length}</div>
              <div className="text-xs text-muted-foreground">Capabilities</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-lg font-bold text-primary">{Math.round((complexityScore + explainabilityScore) / 2)}</div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
            </div>
          </div>
        </div>
      </div>
    </AnalysisCard>
  );
}