import { AnalysisCard } from "./AnalysisCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Component } from "./types/AnalysisTypes";
import { Brain, Zap, Shield, Eye, Activity } from "lucide-react";

interface ComponentAnalysisProps {
  components: Component[];
}

export function ComponentAnalysis({ components }: ComponentAnalysisProps) {
  const getIcon = (index: number) => {
    const icons = [Brain, Zap, Shield, Eye];
    return icons[index % icons.length];
  };

  const getVariant = (index: number) => {
    const variants = ["neural", "cognitive", "analysis"] as const;
    return variants[index % variants.length];
  };

  return (
    <AnalysisCard
      title="Component Analysis"
      description="Detailed breakdown of system components and their relationships"
      icon={Brain}
      variant="neural"
    >
      <div className="space-y-6">
        {components.map((component, index) => {
          const ComponentIcon = getIcon(index);
          const variant = getVariant(index);
          
          return (
            <div key={component.name} className="space-y-4">
              <div className="flex items-center gap-3">
                <ComponentIcon className={`h-5 w-5 text-${variant}`} />
                <h3 className="text-lg font-semibold">{component.name}</h3>
                {component.confidence && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(component.confidence)}% confidence
                  </Badge>
                )}
              </div>
              
              <div className="ml-8 space-y-4">
                {/* Key Phrases */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Phrases</h4>
                  <div className="flex flex-wrap gap-2">
                    {component.keyPhrases.map((phrase, phraseIndex) => (
                      <Badge key={phraseIndex} variant="secondary" className="text-xs">
                        "{phrase}"
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Purpose</h4>
                    <p className="text-sm leading-relaxed">{component.purpose}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Integration</h4>
                    <p className="text-sm leading-relaxed">{component.integration}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Subcomponents</h4>
                  <div className="flex flex-wrap gap-2">
                    {component.subcomponents.map((sub, subIndex) => (
                      <Badge key={subIndex} variant="outline" className="text-xs">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Benefits</h4>
                  <ul className="space-y-1">
                    {component.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Component Relationships */}
                {component.relationships && component.relationships.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Component Relationships</h4>
                    <div className="flex flex-wrap gap-2">
                      {component.relationships.slice(0, 3).map((rel, relIndex) => (
                        <Badge key={relIndex} variant="outline" className="text-xs flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {rel.type.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {index < components.length - 1 && (
                <Separator className="my-6" />
              )}
            </div>
          );
        })}
      </div>
    </AnalysisCard>
  );
}