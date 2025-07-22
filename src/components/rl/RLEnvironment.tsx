import {
  RLAgent,
  RLEnvironment as IRLEnvironment,
  Experience,
  AgentState,
  AgentAction,
  Reward,
  LearningEvent,
  TrainingSession,
  EnvironmentParameters
} from '../types/RLAgentTypes';
import { RewardCalculator } from './RewardCalculator';

export class RLEnvironment implements IRLEnvironment {
  id: string;
  name: string;
  agents: RLAgent[] = [];
  sharedRewards: boolean;
  competitiveMode: boolean;
  environmentParams: EnvironmentParameters;

  private rewardCalculator: RewardCalculator;
  private currentSession?: TrainingSession;
  private environmentState: Map<string, any> = new Map();
  private stepCount: number = 0;
  private episodeActive: boolean = false;

  constructor(
    id: string,
    name: string,
    environmentParams: EnvironmentParameters,
    options: {
      sharedRewards?: boolean;
      competitiveMode?: boolean;
    } = {}
  ) {
    this.id = id;
    this.name = name;
    this.environmentParams = environmentParams;
    this.sharedRewards = options.sharedRewards || false;
    this.competitiveMode = options.competitiveMode || false;
    
    this.rewardCalculator = new RewardCalculator(environmentParams.rewardFunction);
  }

  // Agent Management
  public addAgent(agent: RLAgent): void {
    if (!this.agents.find(a => a.id === agent.id)) {
      this.agents.push(agent);
      console.log(`Agent ${agent.name} added to environment ${this.name}`);
    }
  }

  public removeAgent(agentId: string): boolean {
    const index = this.agents.findIndex(a => a.id === agentId);
    if (index !== -1) {
      this.agents.splice(index, 1);
      console.log(`Agent ${agentId} removed from environment ${this.name}`);
      return true;
    }
    return false;
  }

  // Training Session Management
  public startTrainingSession(): TrainingSession {
    this.currentSession = {
      id: `session-${Date.now()}`,
      agentId: 'multi-agent', // For multi-agent sessions
      startTime: new Date(),
      episodes: 0,
      totalReward: 0,
      improvementScore: 0,
      convergenceAchieved: false
    };

    console.log(`Training session ${this.currentSession.id} started in environment ${this.name}`);
    return this.currentSession;
  }

  public endTrainingSession(): TrainingSession | undefined {
    if (!this.currentSession) return undefined;

    this.currentSession.endTime = new Date();
    
    // Calculate improvement score
    const initialPerformance = this.getInitialPerformanceBaseline();
    const finalPerformance = this.getCurrentPerformanceAverage();
    this.currentSession.improvementScore = finalPerformance - initialPerformance;
    
    // Check convergence
    this.currentSession.convergenceAchieved = this.checkConvergence();

    console.log(`Training session ${this.currentSession.id} ended`);
    const session = this.currentSession;
    this.currentSession = undefined;
    return session;
  }

  // Episode Management
  public startEpisode(): void {
    this.episodeActive = true;
    this.stepCount = 0;
    
    // Initialize agents for new episode
    this.agents.forEach(agent => {
      agent.startEpisode();
    });

    if (this.currentSession) {
      this.currentSession.episodes++;
    }

    console.log(`Episode ${this.currentSession?.episodes || 'unknown'} started in environment ${this.name}`);
  }

  public endEpisode(): void {
    if (!this.episodeActive) return;

    this.episodeActive = false;
    
    // Calculate episode rewards and end episode for all agents
    this.agents.forEach(agent => {
      const episodeReward = this.calculateEpisodeReward(agent);
      agent.endEpisode(episodeReward);
      
      if (this.currentSession) {
        this.currentSession.totalReward += episodeReward;
      }
    });

    console.log(`Episode ended in environment ${this.name}. Steps: ${this.stepCount}`);
  }

  // Core Environment Step
  public step(agentId: string, action: AgentAction, currentState: AgentState): {
    nextState: AgentState;
    reward: Reward;
    done: boolean;
    info?: any;
  } {
    if (!this.episodeActive) {
      throw new Error('No active episode. Call startEpisode() first.');
    }

    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found in environment`);
    }

    this.stepCount++;

    // Apply state transition
    const nextState = this.applyStateTransition(currentState, action, agent);
    
    // Calculate reward
    const taskOutcome = this.evaluateTaskOutcome(action, currentState, nextState);
    const reward = this.rewardCalculator.calculateReward(
      action,
      currentState,
      nextState,
      taskOutcome
    );

    // Check if episode is done
    const done = this.checkTerminationConditions(nextState, agent);

    // Create experience for learning
    const experience: Experience = {
      id: `exp-${Date.now()}-${Math.random()}`,
      state: currentState,
      action,
      reward,
      nextState,
      done,
      timestamp: new Date()
    };

    // Agent learning
    agent.learn(experience);
    agent.receiveReward(reward, nextState, action);

    // Update environment state
    this.updateEnvironmentState(agent, action, nextState);

    // Handle shared rewards in multi-agent settings
    if (this.sharedRewards && this.agents.length > 1) {
      this.distributeSharedReward(reward, agentId);
    }

    return {
      nextState,
      reward,
      done,
      info: {
        stepCount: this.stepCount,
        environmentState: this.getEnvironmentSnapshot(),
        taskOutcome
      }
    };
  }

  // State Transition Logic
  private applyStateTransition(
    currentState: AgentState,
    action: AgentAction,
    agent: RLAgent
  ): AgentState {
    const { stateTransition } = this.environmentParams;
    
    // Create new state based on action and current state
    const newFeatures = { ...currentState.features };
    const newContext = { ...currentState.context };

    // Apply action effects
    this.applyActionEffects(action, newFeatures, newContext);

    // Apply environment dynamics
    if (!stateTransition.deterministic && stateTransition.noiseLevel) {
      this.addStateNoise(newFeatures, stateTransition.noiseLevel);
    }

    // Update system metrics
    this.updateSystemMetrics(newFeatures, newContext);

    // Create new state
    const nextState: AgentState = {
      timestamp: new Date(),
      features: newFeatures,
      context: newContext,
      hash: '' // Will be computed by the agent
    };

    return nextState;
  }

  private applyActionEffects(
    action: AgentAction,
    features: Record<string, any>,
    context: Record<string, any>
  ): void {
    // Action-specific state changes
    switch (action.name) {
      case 'optimize_analysis':
        features.analysisQuality = Math.min(1.0, (features.analysisQuality || 0.5) + 0.1);
        context.systemLoad = Math.max(0, (context.systemLoad || 0.5) + 0.1);
        break;
        
      case 'reduce_complexity':
        features.complexity = Math.max(0, (features.complexity || 0.5) - 0.2);
        context.systemLoad = Math.max(0, (context.systemLoad || 0.5) - 0.1);
        break;
        
      case 'enhance_accuracy':
        features.accuracy = Math.min(1.0, (features.accuracy || 0.7) + 0.15);
        features.processingTime = (features.processingTime || 1.0) * 1.2;
        break;
        
      case 'improve_efficiency':
        features.efficiency = Math.min(1.0, (features.efficiency || 0.6) + 0.1);
        features.resourceUsage = Math.max(0.1, (features.resourceUsage || 0.8) - 0.1);
        break;

      default:
        // Generic action effects
        features.lastActionTime = Date.now();
        break;
    }

    // Update action history
    if (!context.previousActions) {
      context.previousActions = [];
    }
    context.previousActions.push(action.id);
    
    // Keep only recent actions
    if (context.previousActions.length > 10) {
      context.previousActions.shift();
    }
  }

  private addStateNoise(features: Record<string, any>, noiseLevel: number): void {
    Object.keys(features).forEach(key => {
      if (typeof features[key] === 'number') {
        const noise = (Math.random() - 0.5) * noiseLevel;
        features[key] = Math.max(0, Math.min(1, features[key] + noise));
      }
    });
  }

  private updateSystemMetrics(
    features: Record<string, any>,
    context: Record<string, any>
  ): void {
    // Update system load based on current operations
    const baseLoad = 0.3;
    const complexityFactor = (features.complexity || 0.5) * 0.3;
    const accuracyFactor = (features.accuracy || 0.7) * 0.2;
    
    context.systemLoad = Math.min(1.0, baseLoad + complexityFactor + accuracyFactor);
    
    // Update performance metrics
    features.overallPerformance = (
      (features.accuracy || 0.7) * 0.4 +
      (features.efficiency || 0.6) * 0.3 +
      (1 - (features.complexity || 0.5)) * 0.3
    );
  }

  // Task Evaluation
  private evaluateTaskOutcome(
    action: AgentAction,
    currentState: AgentState,
    nextState: AgentState
  ): any {
    const improvement = {
      accuracy: Number(nextState.features.accuracy || 0) - Number(currentState.features.accuracy || 0),
      efficiency: Number(nextState.features.efficiency || 0) - Number(currentState.features.efficiency || 0),
      complexity: Number(currentState.features.complexity || 0) - Number(nextState.features.complexity || 0)
    };

    const overallImprovement = improvement.accuracy + improvement.efficiency + improvement.complexity;
    
    return {
      success: overallImprovement > 0.1,
      partial: overallImprovement > 0 && overallImprovement <= 0.1,
      failure: overallImprovement < 0,
      accuracy: nextState.features.accuracy || 0,
      improvements: improvement,
      overallScore: overallImprovement
    };
  }

  // Termination Conditions
  private checkTerminationConditions(state: AgentState, agent: RLAgent): boolean {
    for (const condition of this.environmentParams.terminationConditions) {
      if (this.evaluateTerminationCondition(condition, state, agent)) {
        return true;
      }
    }
    return false;
  }

  private evaluateTerminationCondition(
    condition: any,
    state: AgentState,
    agent: RLAgent
  ): boolean {
    switch (condition.type) {
      case 'max_steps':
        return this.stepCount >= (condition.value || 100);
        
      case 'goal_reached':
        return (state.features.overallPerformance || 0) >= (condition.value || 0.9);
        
      case 'performance_threshold':
        return agent.averageReward >= (condition.value || 1.0);
        
      case 'user_interrupt':
        return this.environmentState.get('userInterrupt') === true;
        
      default:
        return false;
    }
  }

  // Reward Distribution for Multi-Agent
  private distributeSharedReward(reward: Reward, sourceAgentId: string): void {
    if (this.competitiveMode) {
      // In competitive mode, other agents get reduced rewards
      const reductionFactor = 0.3;
      const reducedReward = { ...reward, value: reward.value * reductionFactor };
      
      this.agents.forEach(agent => {
        if (agent.id !== sourceAgentId) {
          agent.receiveReward(reducedReward, agent.currentState!, { id: 'shared', name: 'Shared Reward' } as AgentAction);
        }
      });
    } else {
      // In cooperative mode, all agents get the reward
      this.agents.forEach(agent => {
        if (agent.id !== sourceAgentId) {
          agent.receiveReward(reward, agent.currentState!, { id: 'shared', name: 'Shared Reward' } as AgentAction);
        }
      });
    }
  }

  // Environment State Management
  private updateEnvironmentState(agent: RLAgent, action: AgentAction, state: AgentState): void {
    this.environmentState.set('lastAction', action);
    this.environmentState.set('lastAgent', agent.id);
    this.environmentState.set('stepCount', this.stepCount);
    this.environmentState.set('overallPerformance', state.features.overallPerformance);
    this.environmentState.set('systemLoad', state.context.systemLoad);
  }

  private getEnvironmentSnapshot(): any {
    return Object.fromEntries(this.environmentState);
  }

  // Performance Analysis
  private calculateEpisodeReward(agent: RLAgent): number {
    // Get recent rewards from agent's history
    const events = agent.getLearningEvents?.() || [];
    const rewardEvents = events.filter(e => e.type === 'reward_received');
    
    if (rewardEvents.length === 0) return 0;
    
    const episodeRewards = rewardEvents
      .filter(e => e.timestamp >= (this.currentSession?.startTime || new Date()))
      .map(e => e.data.reward.value);
    
    return episodeRewards.reduce((sum, r) => sum + r, 0);
  }

  private getInitialPerformanceBaseline(): number {
    // Simple baseline - can be made more sophisticated
    return 0;
  }

  private getCurrentPerformanceAverage(): number {
    if (this.agents.length === 0) return 0;
    
    const totalReward = this.agents.reduce((sum, agent) => sum + agent.averageReward, 0);
    return totalReward / this.agents.length;
  }

  private checkConvergence(): boolean {
    // Check if agents have converged (low variance in recent performance)
    const convergenceScores = this.agents.map(agent => 
      agent.getPerformanceMetrics?.()?.convergenceScore || 0
    );
    
    const averageConvergence = convergenceScores.reduce((sum, score) => sum + score, 0) / convergenceScores.length;
    return averageConvergence > 0.8;
  }

  // Public API
  public getAgents(): RLAgent[] {
    return [...this.agents];
  }

  public getEnvironmentState(): Map<string, any> {
    return new Map(this.environmentState);
  }

  public getCurrentSession(): TrainingSession | undefined {
    return this.currentSession;
  }

  public getStepCount(): number {
    return this.stepCount;
  }

  public isEpisodeActive(): boolean {
    return this.episodeActive;
  }

  public reset(): void {
    this.stepCount = 0;
    this.episodeActive = false;
    this.environmentState.clear();
    this.agents.forEach(agent => agent.reset?.());
    
    if (this.currentSession) {
      this.endTrainingSession();
    }
  }

  public updateEnvironmentParams(newParams: Partial<EnvironmentParameters>): void {
    this.environmentParams = { ...this.environmentParams, ...newParams };
    
    if (newParams.rewardFunction) {
      this.rewardCalculator.updateRewardFunction(newParams.rewardFunction);
    }
  }

  public exportData(): any {
    return {
      id: this.id,
      name: this.name,
      agents: this.agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        performance: agent.getPerformanceMetrics?.()
      })),
      environmentParams: this.environmentParams,
      currentSession: this.currentSession,
      rewardHistory: this.rewardCalculator.getRewardHistory(),
      environmentState: this.getEnvironmentSnapshot()
    };
  }
}
