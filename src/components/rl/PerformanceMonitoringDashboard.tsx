import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgentMetric {
  id: string;
  agent_id: string;
  metric_type: string;
  metric_value: number;
  metadata: any;
  timestamp: string;
}

interface TrainingSession {
  id: string;
  session_name: string;
  agent_ids: string[];
  environment_id: string;
  status: string;
  start_time: string;
  end_time?: string;
  total_episodes: number;
  total_rewards: number;
  convergence_achieved: boolean;
}

interface FeedbackData {
  id: string;
  agent_id: string;
  feedback_type: string;
  feedback_value: any;
  timestamp: string;
}

interface DashboardProps {
  sessionId?: string;
  agentIds?: string[];
  refreshInterval?: number;
}

export function PerformanceMonitoringDashboard({ 
  sessionId, 
  agentIds = [], 
  refreshInterval = 5000 
}: DashboardProps) {
  const [metrics, setMetrics] = useState<AgentMetric[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const { toast } = useToast();

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      const timeRange = getTimeRangeFilter(selectedTimeRange);
      
      // Fetch metrics
      let metricsQuery = supabase
        .from('rl_agent_metrics')
        .select('*')
        .gte('timestamp', timeRange)
        .order('timestamp', { ascending: false });
      
      if (agentIds.length > 0) {
        metricsQuery = metricsQuery.in('agent_id', agentIds);
      }
      if (sessionId) {
        metricsQuery = metricsQuery.eq('session_id', sessionId);
      }

      // Fetch training sessions
      let sessionsQuery = supabase
        .from('rl_training_sessions')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(10);

      // Fetch feedback
      let feedbackQuery = supabase
        .from('rl_feedback')
        .select('*')
        .gte('timestamp', timeRange)
        .order('timestamp', { ascending: false });
      
      if (agentIds.length > 0) {
        feedbackQuery = feedbackQuery.in('agent_id', agentIds);
      }

      const [metricsResult, sessionsResult, feedbackResult] = await Promise.all([
        metricsQuery,
        sessionsQuery,
        feedbackQuery
      ]);

      if (metricsResult.error) throw metricsResult.error;
      if (sessionsResult.error) throw sessionsResult.error;
      if (feedbackResult.error) throw feedbackResult.error;

      setMetrics(metricsResult.data || []);
      setTrainingSessions(sessionsResult.data || []);
      setFeedback(feedbackResult.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    fetchData();

    // Subscribe to real-time updates
    const metricsChannel = supabase
      .channel('metrics-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'rl_agent_metrics'
      }, () => {
        fetchData();
      })
      .subscribe();

    const sessionsChannel = supabase
      .channel('sessions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rl_training_sessions'
      }, () => {
        fetchData();
      })
      .subscribe();

    const feedbackChannel = supabase
      .channel('feedback-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'rl_feedback'
      }, () => {
        fetchData();
      })
      .subscribe();

    // Auto-refresh interval
    const interval = setInterval(fetchData, refreshInterval);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(feedbackChannel);
    };
  }, [sessionId, agentIds, selectedTimeRange, refreshInterval]);

  // Process data for visualizations
  const processedData = useMemo(() => {
    // Group metrics by agent and type
    const agentMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.agent_id]) {
        acc[metric.agent_id] = {};
      }
      if (!acc[metric.agent_id][metric.metric_type]) {
        acc[metric.agent_id][metric.metric_type] = [];
      }
      acc[metric.agent_id][metric.metric_type].push(metric);
      return acc;
    }, {} as Record<string, Record<string, AgentMetric[]>>);

    // Create time series data for charts
    const timeSeriesData = metrics
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(metric => ({
        timestamp: new Date(metric.timestamp).toLocaleTimeString(),
        value: metric.metric_value,
        type: metric.metric_type,
        agent: metric.agent_id
      }));

    // Calculate agent performance summaries
    const agentSummaries = Object.entries(agentMetrics).map(([agentId, metricTypes]) => {
      const latestMetrics = Object.entries(metricTypes).reduce((acc, [type, metrics]) => {
        acc[type] = metrics[0]?.metric_value || 0;
        return acc;
      }, {} as Record<string, number>);

      return {
        agentId,
        latestReward: latestMetrics.reward || 0,
        accuracy: latestMetrics.accuracy || 0,
        efficiency: latestMetrics.efficiency || 0,
        convergence: latestMetrics.convergence || 0,
        explorationRate: latestMetrics.exploration_rate || 0,
        episodeCompletion: latestMetrics.episode_completion || 0
      };
    });

    // Process feedback analytics
    const feedbackStats = feedback.reduce((acc, item) => {
      acc[item.feedback_type] = (acc[item.feedback_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      agentMetrics,
      timeSeriesData,
      agentSummaries,
      feedbackStats
    };
  }, [metrics, feedback]);

  const getTimeRangeFilter = (range: string) => {
    const now = new Date();
    switch (range) {
      case '15m':
        return new Date(now.getTime() - 15 * 60 * 1000).toISOString();
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '6h':
        return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">RL Performance Monitor</h1>
          <p className="text-muted-foreground">Real-time agent performance and training metrics</p>
        </div>
        <div className="flex gap-2">
          {['15m', '1h', '6h', '24h'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Training Sessions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Training Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingSessions.map((session) => (
              <Card key={session.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold truncate">{session.session_name}</h3>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Episodes:</span>
                      <span className="font-medium">{session.total_episodes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Rewards:</span>
                      <span className="font-medium">{session.total_rewards.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Convergence:</span>
                      <span className="flex items-center gap-1">
                        {session.convergence_achieved ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        {session.convergence_achieved ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="agents">Agent Details</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                    <p className="text-2xl font-bold">{processedData.agentSummaries.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Accuracy</p>
                    <p className="text-2xl font-bold">
                      {(processedData.agentSummaries.reduce((sum, agent) => sum + agent.accuracy, 0) / 
                        Math.max(1, processedData.agentSummaries.length)).toFixed(1)}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Reward</p>
                    <p className="text-2xl font-bold">
                      {(processedData.agentSummaries.reduce((sum, agent) => sum + agent.latestReward, 0) / 
                        Math.max(1, processedData.agentSummaries.length)).toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Feedback Items</p>
                    <p className="text-2xl font-bold">{feedback.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Real-time agent performance metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {processedData.agentSummaries.map((agent) => (
              <Card key={agent.agentId}>
                <CardHeader>
                  <CardTitle className="text-lg">Agent {agent.agentId}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>{agent.accuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={agent.accuracy} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Efficiency</span>
                      <span>{agent.efficiency.toFixed(1)}%</span>
                    </div>
                    <Progress value={agent.efficiency} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Convergence</span>
                      <span>{agent.convergence.toFixed(1)}%</span>
                    </div>
                    <Progress value={agent.convergence} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Latest Reward</p>
                      <p className="font-semibold">{agent.latestReward.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Exploration Rate</p>
                      <p className="font-semibold">{(agent.explorationRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Object.entries(processedData.feedbackStats).map(([type, count]) => ({
                        name: type.replace('_', ' '),
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(processedData.feedbackStats).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {feedback.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <div>
                        <Badge variant="outline">{item.feedback_type}</Badge>
                        <p className="text-sm text-muted-foreground">Agent {item.agent_id}</p>
                      </div>
                      <p className="text-xs">{new Date(item.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}