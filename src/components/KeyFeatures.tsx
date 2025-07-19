import { AnalysisCard } from "./AnalysisCard";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star } from "lucide-react";

interface Feature {
  name: string;
  description: string;
}

interface KeyFeaturesProps {
  features: Feature[];
}

export function KeyFeatures({ features }: KeyFeaturesProps) {
  return (
    <AnalysisCard
      title="Key Features"
      description="Core capabilities that make this system unique and powerful"
      icon={Sparkles}
      variant="cognitive"
    >
      <div className="grid gap-4">
        {features.map((feature, index) => (
          <div key={index} className="group p-4 rounded-lg border border-border/50 hover:border-cognitive/30 transition-all duration-300 hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Star className="h-4 w-4 text-cognitive group-hover:text-cognitive/80 transition-colors" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground group-hover:text-cognitive transition-colors">
                    {feature.name}
                  </h3>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    #{index + 1}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnalysisCard>
  );
}