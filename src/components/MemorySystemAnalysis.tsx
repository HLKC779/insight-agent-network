import { AnalysisCard } from './AnalysisCard';
import { MemorySystem } from './types/AnalysisTypes';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Brain, Clock, Zap } from 'lucide-react';

interface MemorySystemAnalysisProps {
  memorySystem: MemorySystem;
}

export function MemorySystemAnalysis({ memorySystem }: MemorySystemAnalysisProps) {
  const memoryTypeDescriptions = {
    working: 'Temporary storage for active processing and immediate tasks',
    episodic: 'Storage of personal experiences and events with temporal context',
    semantic: 'Long-term storage of facts, concepts, and general knowledge',
    procedural: 'Storage of skills, procedures, and learned behaviors'
  };

  const architectureDescriptions = {
    hierarchical: 'Multi-level memory organization with clear priority and access patterns',
    flat: 'Single-level memory with uniform access across all stored information',
    distributed: 'Memory spread across multiple nodes with coordinated access'
  };

  const persistenceDescriptions = {
    persistent: 'Data survives system restarts and maintains long-term retention',
    volatile: 'Data exists only during active session and is lost on restart',
    hybrid: 'Combination of persistent and volatile memory strategies'
  };

  const getArchitectureColor = (arch: string) => {
    switch (arch) {
      case 'hierarchical': return 'text-green-600 bg-green-100 border-green-200';
      case 'distributed': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPersistenceColor = (persistence: string) => {
    switch (persistence) {
      case 'persistent': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'hybrid': return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      default: return 'text-orange-600 bg-orange-100 border-orange-200';
    }
  };

  const getComplexityScore = () => {
    let score = 0;
    score += memorySystem.types.length * 20; // 20 points per memory type
    if (memorySystem.architecture === 'hierarchical') score += 20;
    if (memorySystem.architecture === 'distributed') score += 30;
    if (memorySystem.persistence === 'persistent') score += 20;
    if (memorySystem.persistence === 'hybrid') score += 30;
    return Math.min(score, 100);
  };

  const complexityScore = getComplexityScore();

  return (
    <AnalysisCard
      title="Memory System Analysis"
      description="Detailed analysis of memory architecture and capabilities"
      icon={Database}
      variant="cognitive"
    >
      <div className="space-y-6">
        {/* Memory Complexity Score */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-6 w-6 text-cognitive" />
            <div className="text-2xl font-bold">{complexityScore}</div>
            <div className="text-sm text-muted-foreground">/100 Complexity</div>
          </div>
          <Progress value={complexityScore} className="h-2" />
        </div>

        {/* Memory Types */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Memory Types Detected
          </h4>
          
          {memorySystem.types.length > 0 ? (
            <div className="grid gap-3">
              {memorySystem.types.map((type, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {type} Memory
                    </Badge>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {memoryTypeDescriptions[type] || 'Specialized memory type for domain-specific storage'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No specific memory types detected</p>
            </div>
          )}
        </div>

        {/* Architecture & Persistence */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Architecture Pattern</h4>
            <div className="p-3 border rounded-lg">
              <Badge className={`mb-2 ${getArchitectureColor(memorySystem.architecture)}`}>
                {memorySystem.architecture}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {architectureDescriptions[memorySystem.architecture]}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Persistence Strategy</h4>
            <div className="p-3 border rounded-lg">
              <Badge className={`mb-2 ${getPersistenceColor(memorySystem.persistence)}`}>
                {memorySystem.persistence}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {persistenceDescriptions[memorySystem.persistence]}
              </p>
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Capacity Management
          </h4>
          <div className="p-3 border rounded-lg">
            <Badge variant="outline" className="mb-2 capitalize">
              {memorySystem.capacity} Capacity
            </Badge>
            <p className="text-sm text-muted-foreground">
              {memorySystem.capacity === 'dynamic' 
                ? 'Memory capacity adapts based on usage patterns and available resources'
                : memorySystem.capacity === 'fixed'
                ? 'Memory operates with predetermined capacity limits'
                : 'Memory capacity scales without practical limitations'
              }
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {memorySystem.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-700">Recommendations</h4>
            <div className="space-y-2">
              {memorySystem.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Database className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AnalysisCard>
  );
}