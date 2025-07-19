import { AnalysisCard } from "./AnalysisCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, Target, CheckCircle } from "lucide-react";

interface UsageComponent {
  name: string;
  usage: string;
}

interface UsageExampleData {
  scenario: string;
  components: UsageComponent[];
  outcomes: string[];
}

interface UsageExampleProps {
  example: UsageExampleData;
}

export function UsageExample({ example }: UsageExampleProps) {
  return (
    <AnalysisCard
      title="Usage Example"
      description="Real-world scenario demonstrating practical application"
      icon={PlayCircle}
      variant="analysis"
    >
      <div className="space-y-6">
        {/* Scenario */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-analysis" />
            <h3 className="text-lg font-semibold">Scenario</h3>
          </div>
          <div className="ml-7 p-4 bg-analysis/5 border border-analysis/20 rounded-lg">
            <p className="leading-relaxed">{example.scenario}</p>
          </div>
        </div>

        <Separator />

        {/* Components Used */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Components Used</h3>
          <div className="space-y-3">
            {example.components.map((component, index) => (
              <div key={index} className="flex gap-3">
                <Badge variant="outline" className="text-xs shrink-0 mt-1">
                  {index + 1}
                </Badge>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{component.name}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {component.usage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Expected Outcomes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-analysis" />
            <h3 className="text-lg font-semibold">Expected Outcomes</h3>
          </div>
          <div className="space-y-2">
            {example.outcomes.map((outcome, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1.5">
                  <div className="h-2 w-2 rounded-full bg-analysis"></div>
                </div>
                <p className="text-sm leading-relaxed">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnalysisCard>
  );
}