import { 
  RLAgent, 
  LearningConfig, 
  AgentState, 
  AgentAction, 
  Reward, 
  Experience,
  QTable,
  LearningEvent,
  RLPerformanceMetrics,
  StateSpace,
  ActionSpace
} from '../types/RLAgentTypes';

export class RLAgentBase implements RLAgent {
  id: string;
  name: string;
  type: any;
  status: 'learning' | 'active' | 'idle' | 'evaluating' = 'idle';
  
  learningConfig: LearningConfig;
  stateSpace: StateSpace;
  actionSpace: ActionSpace;
  
  currentState?: AgentState;
  episodeCount: number = 0;
  totalReward: number = 0;
  averageReward: number = 0;
  
  performance: RLPerformanceMetrics;
  knowledge: any;
  
  // Learning components
  private experienceBuffer: Experience[] = [];
  private qTable: QTable;
  private rewardHistory: number[] = [];
  private learningEvents: LearningEvent[] = [];

  constructor(
    id: string,
    name: string,
    type: any,
    learningConfig: LearningConfig,
    stateSpace: StateSpace,
    actionSpace: ActionSpace
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.learningConfig = learningConfig;
    this.stateSpace = stateSpace;
    this.actionSpace = actionSpace;
    
    this.qTable = {
      states: new Map(),
      defaultValue: 0
    };
    
    this.performance = {
      episodesCompleted: 0,
      averageReward: 0,
      rewardVariance: 0,
      explorationRate: learningConfig.explorationRate,
      convergenceScore: 0,
      learningProgress: [],
      successRate: 0,
      efficiencyScore: 0
    };

    this.knowledge = {
      type: 'q-table',
      data: this.qTable,
      lastUpdated: new Date(),
      version: 1
    };
  }

  // Core RL Methods
  public selectAction(state: AgentState): AgentAction {
    const stateHash = this.hashState(state);
    
    // Epsilon-greedy action selection
    if (Math.random() < this.performance.explorationRate) {
      return this.exploreAction();
    } else {
      return this.exploitAction(stateHash);
    }
  }

  public learn(experience: Experience): void {
    this.addExperience(experience);
    
    if (this.learningConfig.algorithm === 'q-learning') {
      this.updateQTable(experience);
    }
    
    this.updatePerformanceMetrics();
    this.logLearningEvent('state_transition', experience);
  }

  public receiveReward(reward: Reward, state: AgentState, action: AgentAction): void {
    this.totalReward += reward.value;
    this.rewardHistory.push(reward.value);
    
    // Update running average
    this.averageReward = this.totalReward / Math.max(1, this.rewardHistory.length);
    
    this.logLearningEvent('reward_received', { reward, state, action });
  }

  public startEpisode(): void {
    this.episodeCount++;
    this.status = 'learning';
    this.performance.episodesCompleted = this.episodeCount;
    
    this.logLearningEvent('episode_start', {
      episode: this.episodeCount,
      explorationRate: this.performance.explorationRate
    });
  }

  public endEpisode(episodeReward: number): void {
    this.status = 'idle';
    this.rewardHistory.push(episodeReward);
    
    // Update exploration rate (epsilon decay)
    this.performance.explorationRate = Math.max(
      this.learningConfig.minExploration,
      this.performance.explorationRate * this.learningConfig.explorationDecay
    );
    
    this.updateLearningProgress(episodeReward);
    this.logLearningEvent('episode_complete', {
      episode: this.episodeCount,
      reward: episodeReward,
      totalReward: this.totalReward
    });
  }

  // Q-Learning Implementation
  private updateQTable(experience: Experience): void {
    const { state, action, reward, nextState, done } = experience;
    const stateHash = this.hashState(state);
    const nextStateHash = this.hashState(nextState);
    
    // Get current Q-value
    const currentQ = this.getQValue(stateHash, action.id);
    
    // Calculate target Q-value
    let targetQ = reward.value;
    if (!done) {
      const maxNextQ = this.getMaxQValue(nextStateHash);
      targetQ += this.learningConfig.discountFactor * maxNextQ;
    }
    
    // Update Q-value using learning rate
    const newQ = currentQ + this.learningConfig.learningRate * (targetQ - currentQ);
    this.setQValue(stateHash, action.id, newQ);
    
    this.knowledge.lastUpdated = new Date();
    this.knowledge.version++;
  }

  private getQValue(stateHash: string, actionId: string): number {
    if (!this.qTable.states.has(stateHash)) {
      this.qTable.states.set(stateHash, new Map());
    }
    
    const stateActions = this.qTable.states.get(stateHash)!;
    return stateActions.get(actionId) || this.qTable.defaultValue;
  }

  private setQValue(stateHash: string, actionId: string, value: number): void {
    if (!this.qTable.states.has(stateHash)) {
      this.qTable.states.set(stateHash, new Map());
    }
    
    this.qTable.states.get(stateHash)!.set(actionId, value);
  }

  private getMaxQValue(stateHash: string): number {
    if (!this.qTable.states.has(stateHash)) {
      return this.qTable.defaultValue;
    }
    
    const stateActions = this.qTable.states.get(stateHash)!;
    if (stateActions.size === 0) {
      return this.qTable.defaultValue;
    }
    
    return Math.max(...stateActions.values());
  }

  private exploitAction(stateHash: string): AgentAction {
    // Choose action with highest Q-value
    let bestAction = this.actionSpace.actions[0];
    let bestValue = this.getQValue(stateHash, bestAction.id);
    
    for (const action of this.actionSpace.actions) {
      const qValue = this.getQValue(stateHash, action.id);
      if (qValue > bestValue) {
        bestValue = qValue;
        bestAction = action;
      }
    }
    
    return bestAction;
  }

  private exploreAction(): AgentAction {
    // Random action selection
    const randomIndex = Math.floor(Math.random() * this.actionSpace.actions.length);
    return this.actionSpace.actions[randomIndex];
  }

  // State Management
  private hashState(state: AgentState): string {
    if (state.hash) {
      return state.hash;
    }
    
    // Create a deterministic hash from state features
    const features = JSON.stringify(state.features, Object.keys(state.features).sort());
    return this.simpleHash(features);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Experience Management
  private addExperience(experience: Experience): void {
    this.experienceBuffer.push(experience);
    
    // Limit buffer size
    const maxBufferSize = this.learningConfig.memorySize || 10000;
    if (this.experienceBuffer.length > maxBufferSize) {
      this.experienceBuffer.shift();
    }
  }

  // Performance Tracking
  private updatePerformanceMetrics(): void {
    if (this.rewardHistory.length === 0) return;
    
    // Calculate reward variance
    const mean = this.averageReward;
    const variance = this.rewardHistory.reduce((acc, reward) => {
      return acc + Math.pow(reward - mean, 2);
    }, 0) / this.rewardHistory.length;
    
    this.performance.rewardVariance = variance;
    
    // Calculate success rate (rewards > 0)
    const successfulEpisodes = this.rewardHistory.filter(r => r > 0).length;
    this.performance.successRate = successfulEpisodes / this.rewardHistory.length;
    
    // Simple convergence metric (low variance indicates convergence)
    this.performance.convergenceScore = Math.max(0, 1 - (variance / Math.abs(mean + 0.001)));
    
    // Efficiency score based on recent performance
    const recentRewards = this.rewardHistory.slice(-10);
    if (recentRewards.length > 0) {
      const recentAverage = recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length;
      this.performance.efficiencyScore = Math.max(0, recentAverage);
    }
  }

  private updateLearningProgress(episodeReward: number): void {
    this.performance.learningProgress.push({
      episode: this.episodeCount,
      reward: episodeReward,
      timestamp: new Date()
    });
    
    // Keep only recent progress (last 100 episodes)
    if (this.performance.learningProgress.length > 100) {
      this.performance.learningProgress.shift();
    }
  }

  private logLearningEvent(type: string, data: any): void {
    const event: LearningEvent = {
      id: `${this.id}-${Date.now()}-${Math.random()}`,
      agentId: this.id,
      type: type as any,
      data,
      timestamp: new Date()
    };
    
    this.learningEvents.push(event);
    
    // Limit event history
    if (this.learningEvents.length > 1000) {
      this.learningEvents.shift();
    }
  }

  // Public API Methods
  public getPerformanceMetrics(): RLPerformanceMetrics {
    return { ...this.performance };
  }

  public getExperienceBuffer(): Experience[] {
    return [...this.experienceBuffer];
  }

  public getLearningEvents(): LearningEvent[] {
    return [...this.learningEvents];
  }

  public exportKnowledge(): any {
    return {
      qTable: {
        states: Array.from(this.qTable.states.entries()).map(([state, actions]) => [
          state,
          Array.from(actions.entries())
        ]),
        defaultValue: this.qTable.defaultValue
      },
      performance: this.performance,
      config: this.learningConfig
    };
  }

  public importKnowledge(knowledgeData: any): void {
    if (knowledgeData.qTable) {
      this.qTable.states = new Map(
        knowledgeData.qTable.states.map(([state, actions]: any) => [
          state,
          new Map(actions)
        ])
      );
      this.qTable.defaultValue = knowledgeData.qTable.defaultValue;
    }
    
    if (knowledgeData.performance) {
      this.performance = { ...this.performance, ...knowledgeData.performance };
    }
    
    this.knowledge.lastUpdated = new Date();
    this.knowledge.version++;
  }

  public reset(): void {
    this.episodeCount = 0;
    this.totalReward = 0;
    this.averageReward = 0;
    this.rewardHistory = [];
    this.experienceBuffer = [];
    this.learningEvents = [];
    this.qTable.states.clear();
    this.performance.explorationRate = this.learningConfig.explorationRate;
    this.status = 'idle';
  }
}
