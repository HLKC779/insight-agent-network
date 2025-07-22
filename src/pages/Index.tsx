import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SystemInput } from "@/components/SystemInput";
import { ComponentAnalysis } from "@/components/ComponentAnalysis";
import { RelationshipMapping } from "@/components/RelationshipMapping";
import { ArchitectureValidation } from "@/components/ArchitectureValidation";
import { MemorySystemAnalysis } from "@/components/MemorySystemAnalysis";
import { ReasoningFrameworkAnalysis } from "@/components/ReasoningFrameworkAnalysis";
import { KeyFeatures } from "@/components/KeyFeatures";
import { UsageExample } from "@/components/UsageExample";
import { MultiTaskChatbot } from "@/components/multiagent/MultiTaskChatbot";
import { AgentOrchestrator } from "@/components/multiagent/AgentOrchestrator";
import { EnhancedAnalysisEngine } from "@/components/EnhancedAnalysisEngine";
import { SystemDashboard } from "@/components/SystemDashboard";
import { HelpCenter } from "@/components/HelpCenter";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Navigation } from "@/components/Navigation";
import { KnowledgeManager } from "@/components/KnowledgeManager";
import { PromptLibrary } from "@/components/PromptLibrary";
import { RAGAnalysisEngine } from "@/components/RAGAnalysisEngine";
import { AnalysisResult } from "@/components/types/AnalysisTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/components/auth/AuthProvider";
import { Activity, Bot, Zap, Brain, Cpu, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Index() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [orchestrator] = useState(() => new AgentOrchestrator());
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [activeView, setActiveView] = useState('analysis');

  useEffect(() => {
    const handleTaskCompleted = (event: CustomEvent) => {
      toast({
        title: "Task Completed",
        description: `Task ${event.detail.id} has been completed successfully.`,
      });
      setActiveTaskCount(prev => Math.max(0, prev - 1));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('taskCompleted', handleTaskCompleted as EventListener);
      return () => window.removeEventListener('taskCompleted', handleTaskCompleted as EventListener);
    }
  }, []);

  const handleTaskCreated = (taskId: string) => {
    setActiveTaskCount(prev => prev + 1);
    toast({
      title: "Task Created",
      description: `New task ${taskId} has been assigned to an agent.`,
    });
  };

  const handleAnalyze = async (description: string) => {
    console.log("Starting analysis with description:", description);
    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Calling RAG analysis engine...");
      // Use RAG-enhanced analysis engine
      const result = await RAGAnalysisEngine.enhancedAnalyzeSystemDescription(description);
      console.log("Analysis result:", result);
      
      setAnalysisResult(result);
      console.log("Analysis result set in state");
      
      toast({
        title: "Analysis Complete",
        description: "AI system analysis has been generated successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the system description.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewChange = (view: string) => {
    if (view === 'about') {
      navigate('/about');
    } else {
      setActiveView(view);
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <SystemDashboard 
            orchestrator={orchestrator}
            activeTaskCount={activeTaskCount}
          />
        );
      case 'help':
        return <HelpCenter />;
      case 'settings':
        return <SettingsPanel />;
      case 'knowledge':
        return <KnowledgeManager />;
      case 'prompts':
        return (
          <PromptLibrary 
            onPromptSelect={(prompt) => {
              console.log('Selected prompt:', prompt);
              toast({
                title: "Prompt Selected",
                description: "Prompt has been loaded and ready to use",
              });
            }}
          />
        );
      default:
        return (
          <div className="space-y-8">
            {/* Multi-Task Chatbot */}
            <MultiTaskChatbot 
              orchestrator={orchestrator}
              onTaskCreated={handleTaskCreated}
            />

            {/* System Input */}
            <SystemInput 
              onAnalyze={handleAnalyze} 
              isLoading={isAnalyzing}
            />

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
                        <p className="text-2xl font-bold">{analysisResult.validation?.score || 0}</p>
                        <p className="text-sm text-muted-foreground">Architecture Score</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Sections */}
                <ComponentAnalysis components={analysisResult.components} />
                
                <div className="grid md:grid-cols-2 gap-6">
                  {analysisResult.relationships && (
                    <RelationshipMapping 
                      relationships={analysisResult.relationships}
                      components={analysisResult.components.map(c => c.name)}
                    />
                  )}
                  {analysisResult.validation && (
                    <ArchitectureValidation validation={analysisResult.validation} />
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {analysisResult.memoryAnalysis && (
                    <MemorySystemAnalysis memorySystem={analysisResult.memoryAnalysis} />
                  )}
                  {analysisResult.reasoningAnalysis && (
                    <ReasoningFrameworkAnalysis reasoningFramework={analysisResult.reasoningAnalysis} />
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <KeyFeatures features={analysisResult.features} />
                  <UsageExample example={analysisResult.example} />
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
      {/* Navigation Sidebar */}
      <Navigation 
        activeView={activeView}
        onViewChange={handleViewChange}
        activeTaskCount={activeTaskCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-cognitive">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cognitive bg-clip-text text-transparent">
                    AI Systems Architecture Platform
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Advanced multi-agent analysis and development environment
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleViewChange('dashboard')}
                >
                  <Activity className="h-3 w-3 text-green-500" />
                  <span className="text-xs">
                    {orchestrator.getAgents().filter(a => a.status === 'idle').length} Agents Available
                  </span>
                </Badge>
                
                {activeTaskCount > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Zap className="h-3 w-3 animate-pulse" />
                    <span className="text-xs">{activeTaskCount} Active Tasks</span>
                  </Badge>
                )}
                
                <ThemeToggle />
                
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 overflow-auto">
          {renderMainContent()}
        </main>

        {/* Footer */}
        <footer className="border-t bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>AI Systems Architecture Platform • Advanced Analysis & Development Environment</p>
              <p className="mt-1">© 2024 Cuong Lam Kim Huynh • Built with React, TypeScript, and Tailwind CSS</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}