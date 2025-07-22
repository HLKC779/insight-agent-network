import { 
  Reward, 
  RewardSource, 
  RewardBreakdown, 
  RewardFunction,
  AgentAction,
  AgentState 
} from '../types/RLAgentTypes';

export class RewardCalculator {
  private rewardFunction: RewardFunction;
  private rewardHistory: Reward[] = [];

  constructor(rewardFunction: RewardFunction) {
    this.rewardFunction = rewardFunction;
  }

  public calculateReward(
    action: AgentAction,
    currentState: AgentState,
    nextState: AgentState,
    taskOutcome?: any,
    userFeedback?: number
  ): Reward {
    const breakdown: RewardBreakdown = {
      taskCompletion: 0,
      userSatisfaction: 0,
      efficiency: 0,
      accuracy: 0,
      penalty: 0
    };

    // Base reward calculation
    breakdown.taskCompletion = this.calculateTaskCompletionReward(action, taskOutcome);
    breakdown.userSatisfaction = this.calculateUserSatisfactionReward(userFeedback);
    breakdown.efficiency = this.calculateEfficiencyReward(action, currentState, nextState);
    breakdown.accuracy = this.calculateAccuracyReward(taskOutcome);
    breakdown.penalty = this.calculatePenalties(action, currentState, nextState);

    // Apply reward function weights
    const weightedReward = 
      breakdown.taskCompletion * this.rewardFunction.weights.task_completion +
      breakdown.userSatisfaction * this.rewardFunction.weights.user_feedback +
      breakdown.efficiency * this.rewardFunction.weights.efficiency_gain +
      breakdown.accuracy * this.rewardFunction.weights.performance_metric -
      breakdown.penalty;

    // Apply bonuses and additional penalties
    const finalReward = this.applyBonusesAndPenalties(
      weightedReward,
      action,
      currentState,
      nextState,
      breakdown
    );

    const reward: Reward = {
      value: finalReward,
      source: this.determinePrimarySource(breakdown),
      timestamp: new Date(),
      breakdown,
      context: {
        taskId: currentState.context.taskType,
        metrics: {
          efficiency: breakdown.efficiency,
          accuracy: breakdown.accuracy,
          completion: breakdown.taskCompletion
        }
      }
    };

    this.rewardHistory.push(reward);
    return reward;
  }

  private calculateTaskCompletionReward(action: AgentAction, outcome?: any): number {
    if (!outcome) return 0;

    // Reward based on task success
    if (outcome.success === true) {
      return 1.0;
    } else if (outcome.partial === true) {
      return 0.5;
    } else if (outcome.failure === true) {
      return -0.5;
    }

    return 0;
  }

  private calculateUserSatisfactionReward(userFeedback?: number): number {
    if (userFeedback === undefined) return 0;
    
    // Normalize user feedback (assuming 1-5 scale) to -1 to 1 range
    return (userFeedback - 3) / 2;
  }

  private calculateEfficiencyReward(
    action: AgentAction,
    currentState: AgentState,
    nextState: AgentState
  ): number {
    // Reward based on resource efficiency
    const currentLoad = currentState.context.systemLoad || 0;
    const nextLoad = nextState.context.systemLoad || 0;
    
    // Positive reward for reducing system load
    const loadImprovement = currentLoad - nextLoad;
    let efficiencyReward = loadImprovement * 0.1;

    // Consider action cost
    const actionCost = action.cost || 0;
    efficiencyReward -= actionCost * 0.05;

    // Time-based efficiency (prefer faster actions)
    const actionTime = nextState.timestamp.getTime() - currentState.timestamp.getTime();
    const timeEfficiency = Math.max(0, 1 - (actionTime / 10000)); // 10 second baseline
    efficiencyReward += timeEfficiency * 0.2;

    return Math.max(-1, Math.min(1, efficiencyReward));
  }

  private calculateAccuracyReward(outcome?: any): number {
    if (!outcome || !outcome.accuracy) return 0;
    
    // Reward based on accuracy metrics
    const accuracy = outcome.accuracy;
    
    if (accuracy >= 0.9) return 1.0;
    if (accuracy >= 0.8) return 0.7;
    if (accuracy >= 0.7) return 0.4;
    if (accuracy >= 0.6) return 0.1;
    
    return -0.2; // Penalty for low accuracy
  }

  private calculatePenalties(
    action: AgentAction,
    currentState: AgentState,
    nextState: AgentState
  ): number {
    let penalty = 0;

    // Error penalty
    if (nextState.features.hasError) {
      penalty += 0.5;
    }

    // Resource exhaustion penalty
    if (nextState.context.systemLoad && nextState.context.systemLoad > 0.9) {
      penalty += 0.3;
    }

    // Repetitive action penalty (discourage loops)
    const recentActions = currentState.context.previousActions || [];
    const actionRepeats = recentActions.filter(a => a === action.id).length;
    if (actionRepeats > 2) {
      penalty += actionRepeats * 0.1;
    }

    return penalty;
  }

  private applyBonusesAndPenalties(
    baseReward: number,
    action: AgentAction,
    currentState: AgentState,
    nextState: AgentState,
    breakdown: RewardBreakdown
  ): number {
    let finalReward = baseReward;

    // Apply configured bonuses
    for (const bonus of this.rewardFunction.bonuses) {
      if (this.evaluateCondition(bonus.condition, action, currentState, nextState, breakdown)) {
        finalReward *= bonus.multiplier;
      }
    }

    // Apply configured penalties
    for (const penalty of this.rewardFunction.penalties) {
      if (this.evaluateCondition(penalty.condition, action, currentState, nextState, breakdown)) {
        finalReward -= penalty.reduction;
      }
    }

    // Clamp reward to reasonable bounds
    return Math.max(-5, Math.min(5, finalReward));
  }

  private evaluateCondition(
    condition: string,
    action: AgentAction,
    currentState: AgentState,
    nextState: AgentState,
    breakdown: RewardBreakdown
  ): boolean {
    // Simple condition evaluation (can be extended with more complex logic)
    try {
      // Replace placeholders with actual values
      let evaluatedCondition = condition
        .replace(/\baccuracy\b/g, breakdown.accuracy.toString())
        .replace(/\befficiency\b/g, breakdown.efficiency.toString())
        .replace(/\btaskCompletion\b/g, breakdown.taskCompletion.toString())
        .replace(/\buserSatisfaction\b/g, breakdown.userSatisfaction.toString())
        .replace(/\bactionCost\b/g, (action.cost || 0).toString())
        .replace(/\bsystemLoad\b/g, (nextState.context.systemLoad || 0).toString());

      // Basic mathematical expression evaluation
      return this.safeEvaluate(evaluatedCondition);
    } catch (error) {
      console.warn('Failed to evaluate condition:', condition, error);
      return false;
    }
  }

  private safeEvaluate(expression: string): boolean {
    // Whitelist of allowed characters and operators
    const allowedPattern = /^[0-9+\-*/.()>\s<>=&|!]+$/;
    
    if (!allowedPattern.test(expression)) {
      return false;
    }

    try {
      // Use Function constructor for safer evaluation than eval
      const result = new Function('return ' + expression)();
      return Boolean(result);
    } catch {
      return false;
    }
  }

  private determinePrimarySource(breakdown: RewardBreakdown): RewardSource {
    const sources = [
      { value: Math.abs(breakdown.taskCompletion), source: 'task_completion' as RewardSource },
      { value: Math.abs(breakdown.userSatisfaction), source: 'user_feedback' as RewardSource },
      { value: Math.abs(breakdown.efficiency), source: 'efficiency_gain' as RewardSource },
      { value: Math.abs(breakdown.accuracy), source: 'performance_metric' as RewardSource },
    ];

    const primarySource = sources.reduce((max, current) => 
      current.value > max.value ? current : max
    );

    return primarySource.source;
  }

  // Utility methods for reward analysis
  public getRewardHistory(): Reward[] {
    return [...this.rewardHistory];
  }

  public getAverageReward(timeWindow?: number): number {
    let relevantRewards = this.rewardHistory;
    
    if (timeWindow) {
      const cutoffTime = new Date(Date.now() - timeWindow);
      relevantRewards = this.rewardHistory.filter(r => r.timestamp >= cutoffTime);
    }

    if (relevantRewards.length === 0) return 0;
    
    return relevantRewards.reduce((sum, r) => sum + r.value, 0) / relevantRewards.length;
  }

  public getRewardsBySource(source: RewardSource): Reward[] {
    return this.rewardHistory.filter(r => r.source === source);
  }

  public getRewardTrend(windowSize: number = 10): number[] {
    if (this.rewardHistory.length < windowSize) {
      return this.rewardHistory.map(r => r.value);
    }

    const recent = this.rewardHistory.slice(-windowSize);
    return recent.map(r => r.value);
  }

  public analyzeRewardDistribution(): {
    positive: number;
    negative: number;
    neutral: number;
    variance: number;
  } {
    const values = this.rewardHistory.map(r => r.value);
    const positive = values.filter(v => v > 0.1).length;
    const negative = values.filter(v => v < -0.1).length;
    const neutral = values.length - positive - negative;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;

    return { positive, negative, neutral, variance };
  }

  public updateRewardFunction(newRewardFunction: RewardFunction): void {
    this.rewardFunction = newRewardFunction;
  }

  public exportData(): any {
    return {
      rewardFunction: this.rewardFunction,
      rewardHistory: this.rewardHistory,
      analytics: this.analyzeRewardDistribution()
    };
  }
}