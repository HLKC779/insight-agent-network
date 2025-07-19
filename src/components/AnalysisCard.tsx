import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface AnalysisCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: "neural" | "cognitive" | "analysis" | "default";
  className?: string;
}

export function AnalysisCard({ 
  title, 
  description, 
  children, 
  icon: Icon, 
  variant = "default",
  className = "" 
}: AnalysisCardProps) {
  const variantStyles = {
    neural: "border-neural/20 bg-gradient-to-br from-neural/5 to-background shadow-neural",
    cognitive: "border-cognitive/20 bg-gradient-to-br from-cognitive/5 to-background shadow-glow",
    analysis: "border-analysis/20 bg-gradient-to-br from-analysis/5 to-background",
    default: ""
  };

  const iconColors = {
    neural: "text-neural",
    cognitive: "text-cognitive", 
    analysis: "text-analysis",
    default: "text-foreground"
  };

  return (
    <Card className={`${variantStyles[variant]} ${className} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {Icon && <Icon className={`h-6 w-6 ${iconColors[variant]}`} />}
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {variant !== "default" && (
            <Badge variant="outline" className={`${iconColors[variant]} border-current`}>
              {variant}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}