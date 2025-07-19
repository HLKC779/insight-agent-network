import { useState } from "react";
import { SystemInput } from "@/components/SystemInput";
import { ComponentAnalysis } from "@/components/ComponentAnalysis";
import { KeyFeatures } from "@/components/KeyFeatures";
import { UsageExample } from "@/components/UsageExample";
import { EnhancedAnalysisEngine } from "@/components/EnhancedAnalysisEngine";
import { AnalysisResult } from "@/components/types/AnalysisTypes";
import { RelationshipMapping } from "@/components/RelationshipMapping";
import { ArchitectureValidation } from "@/components/ArchitectureValidation";
import { MemorySystemAnalysis } from "@/components/MemorySystemAnalysis";
import { ReasoningFrameworkAnalysis } from "@/components/ReasoningFrameworkAnalysis";
import { useToast } from "@/hooks/use-toast";
import { Brain, Cpu, Zap } from "lucide-react";

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (description: string) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = EnhancedAnalysisEngine.analyzeSystemDescription(description);
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "AI system analysis has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the system description.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-neural">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cognitive bg-clip-text text-transparent">
                AI Systems Architecture Analyzer
              </h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive analysis and breakdown of AI agent systems
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Input Section */}
          <SystemInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg border border-neural/20 bg-gradient-to-br from-neural/5 to-background">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-8 w-8 text-neural" />
                    <div>
                      <p className="text-2xl font-bold">{analysisResult.components.length}</p>
                      <p className="text-sm text-muted-foreground">Components Analyzed</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg border border-cognitive/20 bg-gradient-to-br from-cognitive/5 to-background">
                  <div className="flex items-center gap-3">
                    <Zap className="h-8 w-8 text-cognitive" />
                    <div>
                      <p className="text-2xl font-bold">{analysisResult.features.length}</p>
                      <p className="text-sm text-muted-foreground">Key Features</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg border border-analysis/20 bg-gradient-to-br from-analysis/5 to-background">
                  <div className="flex items-center gap-3">
                    <Brain className="h-8 w-8 text-analysis" />
                    <div>
                      <p className="text-2xl font-bold">{analysisResult.example.components.length}</p>
                      <p className="text-sm text-muted-foreground">Usage Components</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Sections */}
              <ComponentAnalysis components={analysisResult.components} />
              
              {/* Enhanced Analysis Views */}
              {analysisResult.relationships && analysisResult.relationships.length > 0 && (
                <RelationshipMapping 
                  relationships={analysisResult.relationships}
                  components={analysisResult.components.map(c => c.name)}
                />
              )}
              
              {analysisResult.validation && (
                <ArchitectureValidation validation={analysisResult.validation} />
              )}
              
              {analysisResult.memoryAnalysis && (
                <MemorySystemAnalysis memorySystem={analysisResult.memoryAnalysis} />
              )}
              
              {analysisResult.reasoningAnalysis && (
                <ReasoningFrameworkAnalysis reasoningFramework={analysisResult.reasoningAnalysis} />
              )}
              
              <KeyFeatures features={analysisResult.features} />
              <UsageExample example={analysisResult.example} />
            </div>
          )}

          {/* Footer */}
          <footer className="text-center pt-12 pb-6">
            <p className="text-sm text-muted-foreground">
              AI Systems Architecture Analyzer • Built with advanced analysis algorithms
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
