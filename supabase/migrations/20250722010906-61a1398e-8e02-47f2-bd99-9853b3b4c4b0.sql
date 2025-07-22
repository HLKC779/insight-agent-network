-- Create table for feedback collection
CREATE TABLE public.rl_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  user_id UUID,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('user_rating', 'task_completion', 'system_metric', 'user_interaction', 'error_report')),
  feedback_value JSONB NOT NULL,
  context JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for agent performance metrics
CREATE TABLE public.rl_agent_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  session_id UUID,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('reward', 'accuracy', 'efficiency', 'convergence', 'exploration_rate', 'episode_completion')),
  metric_value DOUBLE PRECISION NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for training sessions
CREATE TABLE public.rl_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL,
  agent_ids TEXT[] NOT NULL,
  environment_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_episodes INTEGER DEFAULT 0,
  total_rewards DOUBLE PRECISION DEFAULT 0,
  convergence_achieved BOOLEAN DEFAULT false,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for system interactions
CREATE TABLE public.rl_system_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id UUID,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('button_click', 'input_submission', 'navigation', 'error_encounter', 'task_completion', 'preference_change')),
  target_element TEXT,
  interaction_data JSONB NOT NULL,
  system_state JSONB,
  outcome JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rl_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rl_agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rl_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rl_system_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rl_feedback
CREATE POLICY "Users can view all feedback" ON public.rl_feedback FOR SELECT USING (true);
CREATE POLICY "Users can create feedback" ON public.rl_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update feedback" ON public.rl_feedback FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for rl_agent_metrics
CREATE POLICY "Users can view all metrics" ON public.rl_agent_metrics FOR SELECT USING (true);
CREATE POLICY "Users can create metrics" ON public.rl_agent_metrics FOR INSERT WITH CHECK (true);

-- RLS Policies for rl_training_sessions
CREATE POLICY "Users can view all training sessions" ON public.rl_training_sessions FOR SELECT USING (true);
CREATE POLICY "Users can create training sessions" ON public.rl_training_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update training sessions" ON public.rl_training_sessions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for rl_system_interactions
CREATE POLICY "Users can view their own interactions" ON public.rl_system_interactions FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can create interactions" ON public.rl_system_interactions FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_rl_feedback_agent_id ON public.rl_feedback(agent_id);
CREATE INDEX idx_rl_feedback_session_id ON public.rl_feedback(session_id);
CREATE INDEX idx_rl_feedback_timestamp ON public.rl_feedback(timestamp);
CREATE INDEX idx_rl_agent_metrics_agent_id ON public.rl_agent_metrics(agent_id);
CREATE INDEX idx_rl_agent_metrics_timestamp ON public.rl_agent_metrics(timestamp);
CREATE INDEX idx_rl_training_sessions_status ON public.rl_training_sessions(status);
CREATE INDEX idx_rl_system_interactions_user_id ON public.rl_system_interactions(user_id);
CREATE INDEX idx_rl_system_interactions_timestamp ON public.rl_system_interactions(timestamp);

-- Create function to update updated_at timestamp
CREATE TRIGGER update_rl_training_sessions_updated_at
  BEFORE UPDATE ON public.rl_training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for monitoring dashboard
ALTER TABLE public.rl_agent_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.rl_feedback REPLICA IDENTITY FULL;
ALTER TABLE public.rl_training_sessions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rl_agent_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rl_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rl_training_sessions;