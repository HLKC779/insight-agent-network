import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackData {
  sessionId: string;
  agentId: string;
  feedbackType: 'user_rating' | 'task_completion' | 'system_metric' | 'user_interaction' | 'error_report';
  feedbackValue: any;
  context?: any;
  userId?: string;
}

interface SystemInteraction {
  interactionType: 'button_click' | 'input_submission' | 'navigation' | 'error_encounter' | 'task_completion' | 'preference_change';
  targetElement?: string;
  interactionData: any;
  systemState?: any;
  outcome?: any;
  sessionId?: string;
  userId?: string;
}

export class FeedbackCollector {
  private sessionId: string;
  private userId?: string;
  private pendingFeedback: FeedbackData[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 5000; // 5 seconds
  private isOnline: boolean = navigator.onLine;

  constructor(sessionId: string, userId?: string) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.setupEventListeners();
    this.startBatchProcessor();
  }

  // Core Feedback Collection Methods
  public async collectUserRating(
    agentId: string,
    rating: number,
    comment?: string,
    context?: any
  ): Promise<void> {
    await this.addFeedback({
      sessionId: this.sessionId,
      agentId,
      feedbackType: 'user_rating',
      feedbackValue: { rating, comment },
      context,
      userId: this.userId
    });
  }

  public async collectTaskCompletion(
    agentId: string,
    taskId: string,
    success: boolean,
    metrics?: any,
    context?: any
  ): Promise<void> {
    await this.addFeedback({
      sessionId: this.sessionId,
      agentId,
      feedbackType: 'task_completion',
      feedbackValue: { taskId, success, metrics },
      context,
      userId: this.userId
    });
  }

  public async collectSystemMetric(
    agentId: string,
    metricName: string,
    metricValue: number,
    metadata?: any
  ): Promise<void> {
    await this.addFeedback({
      sessionId: this.sessionId,
      agentId,
      feedbackType: 'system_metric',
      feedbackValue: { metricName, metricValue, metadata },
      userId: this.userId
    });
  }

  public async collectUserInteraction(
    agentId: string,
    interactionType: string,
    interactionData: any,
    outcome?: any
  ): Promise<void> {
    await this.addFeedback({
      sessionId: this.sessionId,
      agentId,
      feedbackType: 'user_interaction',
      feedbackValue: { interactionType, interactionData, outcome },
      userId: this.userId
    });
  }

  public async collectErrorReport(
    agentId: string,
    errorType: string,
    errorMessage: string,
    stackTrace?: string,
    context?: any
  ): Promise<void> {
    await this.addFeedback({
      sessionId: this.sessionId,
      agentId,
      feedbackType: 'error_report',
      feedbackValue: { errorType, errorMessage, stackTrace },
      context,
      userId: this.userId
    });
  }

  // System Interaction Tracking
  public async trackSystemInteraction(interaction: SystemInteraction): Promise<void> {
    const { error } = await supabase
      .from('rl_system_interactions')
      .insert({
        user_id: interaction.userId || this.userId,
        session_id: interaction.sessionId || this.sessionId,
        interaction_type: interaction.interactionType,
        target_element: interaction.targetElement,
        interaction_data: interaction.interactionData,
        system_state: interaction.systemState,
        outcome: interaction.outcome
      });

    if (error) {
      console.error('Failed to track system interaction:', error);
    }
  }

  // Agent Performance Metrics
  public async recordAgentMetric(
    agentId: string,
    metricType: 'reward' | 'accuracy' | 'efficiency' | 'convergence' | 'exploration_rate' | 'episode_completion',
    metricValue: number,
    metadata?: any,
    sessionId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('rl_agent_metrics')
      .insert({
        agent_id: agentId,
        session_id: sessionId || this.sessionId,
        metric_type: metricType,
        metric_value: metricValue,
        metadata: metadata || {}
      });

    if (error) {
      console.error('Failed to record agent metric:', error);
    }
  }

  // Batch Processing
  private async addFeedback(feedback: FeedbackData): Promise<void> {
    this.pendingFeedback.push(feedback);
    
    if (this.pendingFeedback.length >= this.batchSize) {
      await this.flushFeedback();
    }
  }

  private async flushFeedback(): Promise<void> {
    if (this.pendingFeedback.length === 0 || !this.isOnline) {
      return;
    }

    const batch = [...this.pendingFeedback];
    this.pendingFeedback = [];

    try {
      const { error } = await supabase
        .from('rl_feedback')
        .insert(batch.map(feedback => ({
          session_id: feedback.sessionId,
          agent_id: feedback.agentId,
          user_id: feedback.userId,
          feedback_type: feedback.feedbackType,
          feedback_value: feedback.feedbackValue,
          context: feedback.context || {}
        })));

      if (error) {
        console.error('Failed to flush feedback batch:', error);
        // Re-add failed items to pending queue
        this.pendingFeedback.unshift(...batch);
      }
    } catch (error) {
      console.error('Network error while flushing feedback:', error);
      // Re-add failed items to pending queue
      this.pendingFeedback.unshift(...batch);
    }
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      this.flushFeedback();
    }, this.flushInterval);
  }

  private setupEventListeners(): void {
    // Network status monitoring
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushFeedback(); // Flush pending feedback when back online
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page unload - flush remaining feedback
    window.addEventListener('beforeunload', () => {
      if (this.pendingFeedback.length > 0) {
        // Synchronous call for page unload
        navigator.sendBeacon('/api/feedback', JSON.stringify(this.pendingFeedback));
      }
    });
  }

  // Utility Methods
  public getPendingFeedbackCount(): number {
    return this.pendingFeedback.length;
  }

  public async forceFeedbackFlush(): Promise<void> {
    await this.flushFeedback();
  }

  public updateSession(newSessionId: string, newUserId?: string): void {
    this.sessionId = newSessionId;
    this.userId = newUserId;
  }

  public async getSessionFeedback(sessionId?: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('rl_feedback')
      .select('*')
      .eq('session_id', sessionId || this.sessionId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Failed to fetch session feedback:', error);
      return [];
    }

    return data || [];
  }

  public async getFeedbackAnalytics(agentId?: string): Promise<any> {
    let query = supabase
      .from('rl_feedback')
      .select('feedback_type, feedback_value, timestamp');

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Failed to fetch feedback analytics:', error);
      return null;
    }

    // Process analytics
    const analytics = {
      totalFeedback: data?.length || 0,
      feedbackByType: {} as Record<string, number>,
      averageRating: 0,
      completionRate: 0,
      errorCount: 0
    };

    data?.forEach(item => {
      analytics.feedbackByType[item.feedback_type] = 
        (analytics.feedbackByType[item.feedback_type] || 0) + 1;

      if (item.feedback_type === 'user_rating' && 
          typeof item.feedback_value === 'object' && 
          item.feedback_value && 
          'rating' in item.feedback_value) {
        analytics.averageRating += Number(item.feedback_value.rating);
      }

      if (item.feedback_type === 'error_report') {
        analytics.errorCount++;
      }
    });

    const ratingCount = analytics.feedbackByType['user_rating'] || 0;
    if (ratingCount > 0) {
      analytics.averageRating /= ratingCount;
    }

    const completionCount = analytics.feedbackByType['task_completion'] || 0;
    analytics.completionRate = analytics.totalFeedback > 0 ? 
      (completionCount / analytics.totalFeedback) * 100 : 0;

    return analytics;
  }
}

// React Hook for easy integration
export function useFeedbackCollector(sessionId: string, userId?: string) {
  const [collector, setCollector] = useState<FeedbackCollector | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const newCollector = new FeedbackCollector(sessionId, userId);
    setCollector(newCollector);

    return () => {
      newCollector.forceFeedbackFlush();
    };
  }, [sessionId, userId]);

  const collectRating = useCallback(async (
    agentId: string,
    rating: number,
    comment?: string
  ) => {
    if (!collector) return;
    
    try {
      await collector.collectUserRating(agentId, rating, comment);
      toast({
        title: "Feedback Recorded",
        description: "Thank you for your rating!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record feedback",
        variant: "destructive"
      });
    }
  }, [collector, toast]);

  const trackInteraction = useCallback(async (
    interactionType: SystemInteraction['interactionType'],
    targetElement: string,
    data: any
  ) => {
    if (!collector) return;
    
    await collector.trackSystemInteraction({
      interactionType,
      targetElement,
      interactionData: data,
      systemState: {
        currentPage: window.location.pathname,
        timestamp: new Date().toISOString()
      }
    });
  }, [collector]);

  const recordMetric = useCallback(async (
    agentId: string,
    metricType: Parameters<FeedbackCollector['recordAgentMetric']>[1],
    value: number,
    metadata?: any
  ) => {
    if (!collector) return;
    
    await collector.recordAgentMetric(agentId, metricType, value, metadata);
  }, [collector]);

  return {
    collector,
    collectRating,
    trackInteraction,
    recordMetric,
    pendingCount: collector?.getPendingFeedbackCount() || 0
  };
}