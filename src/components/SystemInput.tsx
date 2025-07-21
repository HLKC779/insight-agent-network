import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Upload, Sparkles, AlertTriangle } from "lucide-react";
import { sanitizeInput, validateSystemDescription } from "@/lib/security";
import { toast } from "@/hooks/use-toast";

interface SystemInputProps {
  onAnalyze: (description: string) => void;
  isLoading?: boolean;
}

export function SystemInput({ onAnalyze, isLoading = false }: SystemInputProps) {
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    // Sanitize input in real-time
    const sanitized = sanitizeInput(value, 50000);
    setDescription(sanitized);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleAnalyze = () => {
    const trimmed = description.trim();
    
    if (!trimmed) {
      setValidationError("Please enter a system description");
      return;
    }

    // Validate input safety
    if (!validateSystemDescription(trimmed)) {
      setValidationError("Invalid characters detected. Please use only standard text characters.");
      toast({
        title: "Invalid Input",
        description: "Please ensure your input contains only safe characters.",
        variant: "destructive",
      });
      return;
    }

    // Final sanitization before analysis
    const sanitized = sanitizeInput(trimmed);
    onAnalyze(sanitized);
  };

  const sampleSystem = `The Adaptive Intelligence Network (AIN) is a cutting-edge AI agent system designed for versatility and scalability across diverse applications. Its architecture comprises the following key components:

1. Modular Neural Engine (MNE): The core of AIN, utilizing a combination of transformer-based models and graph neural networks. It enables efficient processing of both structured and unstructured data, allowing for complex reasoning and pattern recognition across multiple domains.

2. Dynamic Knowledge Integration System (DKIS): A flexible, self-organizing knowledge base that combines ontological structures with neural embeddings. It continuously updates and reorganizes information, facilitating rapid knowledge retrieval and inference.

3. Multi-modal Perception Framework (MPF): Processes inputs from various sources including text, speech, images, and sensor data. Employs advanced fusion techniques to create a unified representation of the environment, enabling contextual understanding across modalities.

[... additional components ...]`;

  const handleLoadSample = () => {
    setDescription(sampleSystem);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-glow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl font-semibold">AI System Description</CardTitle>
            <CardDescription>
              Paste your AI agent system description below for comprehensive analysis
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Badge variant="outline" className="text-xs text-primary border-primary/30">
            Component Analysis
          </Badge>
          <Badge variant="outline" className="text-xs text-cognitive border-cognitive/30">
            Feature Extraction
          </Badge>
          <Badge variant="outline" className="text-xs text-analysis border-analysis/30">
            Usage Examples
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Enter your AI system description here..."
            value={description}
            onChange={(e) => handleInputChange(e.target.value)}
            className="min-h-[200px] resize-none border-border/50 focus:border-primary/50"
          />
          {validationError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {validationError}
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleAnalyze}
            disabled={!description.trim() || isLoading}
            className="flex-1 bg-gradient-cognitive text-white hover:opacity-90 shadow-glow"
          >
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze System
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleLoadSample}
            className="border-primary/30 hover:bg-primary/5"
          >
            <Upload className="h-4 w-4 mr-2" />
            Load Sample
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Provide detailed component descriptions for best results</p>
          <p>• Include technical specifications and architectural details</p>
          <p>• System will extract key phrases and generate structured analysis</p>
        </div>
      </CardContent>
    </Card>
  );
}