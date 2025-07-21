import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  BarChart3,
  Users,
  Download
} from "lucide-react";
import { AgentOrchestrator } from "./multiagent/AgentOrchestrator";

interface SystemDashboardProps {
  orchestrator: AgentOrchestrator;
  activeTaskCount: number;
}

interface SystemMetrics {
  uptime: string;
  totalAnalyses: number;
  successRate: number;
  avgResponseTime: number;
  peakLoadTime: string;
}

export function SystemDashboard({ orchestrator, activeTaskCount }: SystemDashboardProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: "2h 34m",
    totalAnalyses: 47,
    successRate: 94.7,
    avgResponseTime: 1.2,
    peakLoadTime: "14:30 UTC"
  });

  const agents = orchestrator.getAgents();
  const completedTasks = orchestrator.getCompletedTasks();
  const queuedTasks = orchestrator.getTaskQueue();

  const systemHealth = agents.filter(a => a.status === 'idle').length / agents.length * 100;
  const overallPerformance = agents.reduce((acc, agent) => acc + agent.performance.successRate, 0) / agents.length;

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time metrics updates
      setMetrics(prev => ({
        ...prev,
        totalAnalyses: prev.totalAnalyses + Math.floor(Math.random() * 2),
        avgResponseTime: Math.round((prev.avgResponseTime + (Math.random() * 0.5 - 0.25)) * 10) / 10
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      metrics,
      agents: agents.map(agent => ({
        name: agent.name,
        status: agent.status,
        performance: agent.performance
      })),
      systemHealth: Math.round(systemHealth),
      overallPerformance: Math.round(overallPerformance)
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-system-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">System Dashboard</CardTitle>
                <CardDescription>Real-time monitoring and performance metrics</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={exportReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{metrics.totalAnalyses}</div>
              <div className="text-sm text-muted-foreground">Total Analyses</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-cognitive">{metrics.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-analysis">{metrics.avgResponseTime}s</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-neural">{metrics.uptime}</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-cognitive" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Health</span>
                <span className="font-medium">{Math.round(systemHealth)}%</span>
              </div>
              <Progress value={systemHealth} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance Score</span>
                <span className="font-medium">{Math.round(overallPerformance)}%</span>
              </div>
              <Progress value={overallPerformance} className="h-2" />
            </div>

            <div className="flex items-center gap-2 text-sm">
              {systemHealth > 80 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span>
                {systemHealth > 80 ? 'All systems operational' : 'Some agents may need attention'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-neural" />
              Agent Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agents.map((agent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'idle' ? 'bg-green-500' :
                      agent.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {agent.performance.tasksCompleted} tasks
                    </Badge>
                    <Badge variant={agent.status === 'idle' ? 'default' : 'secondary'} className="text-xs">
                      {agent.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-analysis" />
              Task Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-yellow-500">{activeTaskCount}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-500">{queuedTasks.length}</div>
                <div className="text-xs text-muted-foreground">Queued</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-500">{completedTasks.length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Recent Activity</div>
              <div className="space-y-1">
                {completedTasks.slice(-3).map((task, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">
                      {task.type.replace('_', ' ')} completed
                    </span>
                    <span className="text-muted-foreground ml-auto">
                      {new Date(task.completedAt || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Response Time</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-sm font-medium">Improving</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Accuracy Rate</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-sm font-medium">Stable</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Resource Usage</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  <span className="text-sm font-medium">Optimized</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Peak usage: {metrics.peakLoadTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}