import { useEffect, useRef } from 'react';
import { ComponentRelationship } from './types/AnalysisTypes';
import { AnalysisCard } from './AnalysisCard';
import { Badge } from '@/components/ui/badge';
import { Network, ArrowRight, Zap } from 'lucide-react';

interface RelationshipMappingProps {
  relationships: ComponentRelationship[];
  components: string[];
}

export function RelationshipMapping({ relationships, components }: RelationshipMappingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || relationships.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = 400 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const width = canvas.offsetWidth;
    const height = 400;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create node positions in a circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    
    const nodePositions: { [key: string]: { x: number; y: number } } = {};
    components.forEach((component, index) => {
      const angle = (index / components.length) * 2 * Math.PI - Math.PI / 2;
      nodePositions[component] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Draw relationships (edges)
    relationships.forEach(rel => {
      const source = nodePositions[rel.source];
      const target = nodePositions[rel.target];
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        
        // Color based on relationship strength
        const alpha = rel.strength;
        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.lineWidth = 2 + rel.strength * 2;
        ctx.stroke();
        
        // Draw arrow
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowLength = 10;
        const arrowAngle = 0.3;
        
        const arrowX = target.x - 20 * Math.cos(angle);
        const arrowY = target.y - 20 * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle - arrowAngle),
          arrowY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle + arrowAngle),
          arrowY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
      }
    });

    // Draw nodes
    Object.entries(nodePositions).forEach(([component, pos]) => {
      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Component name
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      const words = component.split(' ');
      words.forEach((word, index) => {
        ctx.fillText(word, pos.x, pos.y + 25 + (index * 12));
      });
    });
  }, [relationships, components]);

  const getRelationshipColor = (strength: number) => {
    if (strength >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (strength >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 0.8) return 'Strong';
    if (strength >= 0.6) return 'Medium';
    return 'Weak';
  };

  return (
    <AnalysisCard
      title="Component Relationships"
      description="Visual mapping of component interactions and dependencies"
      icon={Network}
      variant="cognitive"
    >
      <div className="space-y-6">
        {/* Relationship Graph */}
        <div className="border rounded-lg p-4 bg-gradient-to-br from-background to-muted/20">
          <canvas
            ref={canvasRef}
            className="w-full h-96 rounded"
            style={{ width: '100%', height: '400px' }}
          />
        </div>

        {/* Relationship Details */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Relationship Details
          </h4>
          
          <div className="grid gap-3">
            {relationships.map((rel, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">{rel.source}</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">{rel.target}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {rel.type.replace(/_/g, ' ')}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRelationshipColor(rel.strength)}`}
                  >
                    {getStrengthLabel(rel.strength)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {relationships.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Network className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No component relationships detected</p>
              <p className="text-sm">Relationships will be identified as the analysis improves</p>
            </div>
          )}
        </div>
      </div>
    </AnalysisCard>
  );
}