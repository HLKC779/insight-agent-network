import { AnalysisCard } from './AnalysisCard';
import { ArchitectureValidation as ValidationData } from './types/AnalysisTypes';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Lightbulb, Shield } from 'lucide-react';

interface ArchitectureValidationProps {
  validation: ValidationData;
}

export function ArchitectureValidation({ validation }: ArchitectureValidationProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <AnalysisCard
      title="Architecture Validation"
      description="Comprehensive analysis of system architecture quality and recommendations"
      icon={Shield}
      variant="analysis"
    >
      <div className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className={`text-4xl font-bold ${getScoreColor(validation.score)}`}>
              {validation.score}
            </div>
            <div className="text-lg text-muted-foreground">/100</div>
          </div>
          <div className="space-y-2">
            <Progress value={validation.score} className="h-3" />
            <Badge variant="outline" className={getScoreColor(validation.score)}>
              {getScoreLabel(validation.score)}
            </Badge>
          </div>
        </div>

        {/* Strengths */}
        {validation.strengths.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              Architecture Strengths
            </h4>
            <div className="space-y-2">
              {validation.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {validation.issues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Identified Issues
            </h4>
            <div className="space-y-2">
              {validation.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-amber-800">{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {validation.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-blue-700">
              <Lightbulb className="h-4 w-4" />
              Improvement Recommendations
            </h4>
            <div className="space-y-2">
              {validation.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Architecture Quality Assessment</span>
            <span className={`font-medium ${getScoreColor(validation.score)}`}>
              {getScoreLabel(validation.score)}
            </span>
          </div>
        </div>
      </div>
    </AnalysisCard>
  );
}