export interface RLAgent {
  id: string;
  name: string;
  type: RLAgentType;
  status: 'learning' | 'active' | 'idle' | 'evaluating';
  
  // Learning Configuration
  learningConfig: LearningConfig;
  
  // State and Action Spaces
  stateSpace: StateSpace;
  actionSpace: ActionSpace;
  
  // Current Learning State
  currentState?: AgentState;
  episodeCount: number;
  totalReward: number;
  averageReward: number;
  
  // Performance Metrics
  performance: RLPerformanceMetrics;
  
  // Q-Table or Neural Network Weights
  knowledge: AgentKnowledge;

  // Required Methods
  startEpisode(): void;
  endEpisode(episodeReward: number): void;
  learn(experience: Experience): void;
  receiveReward(reward: Reward, state: AgentState, action: AgentAction): void;
  selectAction(state: AgentState): AgentAction;
  getPerformanceMetrics(): RLPerformanceMetrics;
  getLearningEvents(): LearningEvent[];
  reset(): void;
}

export interface LearningConfig {
  algorithm: 'q-learning' | 'dqn' | 'policy-gradient';
  learningRate: number;
  discountFactor: number; // gamma
  explorationRate: number; // epsilon
  explorationDecay: number;
  minExploration: number;
  batchSize?: number;
  memorySize?: number;
}

export interface StateSpace {
  dimensions: StateDimension[];
  encoding: 'discrete' | 'continuous' | 'mixed';
}

export interface StateDimension {
  name: string;
  type: 'numerical' | 'categorical' | 'boolean';
  range?: [number, number];
  categories?: string[];
  weight: number; // importance weight for state representation
}

export interface ActionSpace {
  actions: AgentAction[];
  type: 'discrete' | 'continuous';
}

export interface AgentAction {
  id: string;
  name: string;
  description: string;
  parameters?: ActionParameter[];
  cost?: number; // computational cost
}

export interface ActionParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  range?: [number, number];
  options?: string[];
}

export interface AgentState {
  timestamp: Date;
  features: Record<string, number | string | boolean>;
  context: StateContext;
  hash: string; // for quick state comparison
}

export interface StateContext {
  taskType?: string;
  userPreferences?: Record<string, any>;
  systemLoad?: number;
  previousActions?: string[];
  environmentFactors?: Record<string, any>;
}

export interface Reward {
  value: number;
  source: RewardSource;
  timestamp: Date;
  context?: RewardContext;
  breakdown?: RewardBreakdown;
}

export interface RewardBreakdown {
  taskCompletion: number;
  userSatisfaction: number;
  efficiency: number;
  accuracy: number;
  penalty: number;
}

export interface RewardContext {
  taskId?: string;
  userId?: string;
  sessionId?: string;
  metrics?: Record<string, number>;
}

export type RewardSource = 
  | 'user_feedback'
  | 'task_completion'
  | 'performance_metric'
  | 'system_optimization'
  | 'error_reduction'
  | 'efficiency_gain';

export interface Experience {
  id: string;
  state: AgentState;
  action: AgentAction;
  reward: Reward;
  nextState: AgentState;
  done: boolean;
  timestamp: Date;
}

export interface RLPerformanceMetrics {
  episodesCompleted: number;
  averageReward: number;
  rewardVariance: number;
  explorationRate: number;
  convergenceScore: number;
  learningProgress: LearningProgress[];
  successRate: number;
  efficiencyScore: number;
}

export interface LearningProgress {
  episode: number;
  reward: number;
  loss?: number;
  accuracy?: number;
  timestamp: Date;
}

export interface AgentKnowledge {
  type: 'q-table' | 'neural-network' | 'policy-table';
  data: QTable | NeuralNetworkWeights | PolicyTable;
  lastUpdated: Date;
  version: number;
}

export interface QTable {
  states: Map<string, Map<string, number>>; // state_hash -> action_id -> q_value
  defaultValue: number;
}

export interface NeuralNetworkWeights {
  layers: number[][];
  biases: number[][];
  activation: string;
}

export interface PolicyTable {
  policies: Map<string, Map<string, number>>; // state_hash -> action_id -> probability
}

export type RLAgentType = 
  | 'optimization-agent'
  | 'analysis-agent'
  | 'preference-agent'
  | 'efficiency-agent'
  | 'quality-agent';

export interface RLEnvironment {
  id: string;
  name: string;
  agents: RLAgent[];
  sharedRewards: boolean;
  competitiveMode: boolean;
  environmentParams: EnvironmentParameters;
}

export interface EnvironmentParameters {
  maxEpisodeLength: number;
  rewardFunction: RewardFunction;
  stateTransition: StateTransitionFunction;
  terminationConditions: TerminationCondition[];
}

export interface RewardFunction {
  name: string;
  weights: Record<RewardSource, number>;
  bonuses: RewardBonus[];
  penalties: RewardPenalty[];
}

export interface RewardBonus {
  condition: string;
  multiplier: number;
  description: string;
}

export interface RewardPenalty {
  condition: string;
  reduction: number;
  description: string;
}

export interface StateTransitionFunction {
  deterministic: boolean;
  noiseLevel?: number;
  dependencies: string[];
}

export interface TerminationCondition {
  type: 'max_steps' | 'goal_reached' | 'performance_threshold' | 'user_interrupt';
  value?: number;
  description: string;
}

export interface LearningEvent {
  id: string;
  agentId: string;
  type: 'state_transition' | 'reward_received' | 'action_taken' | 'episode_complete';
  data: any;
  timestamp: Date;
}

export interface TrainingSession {
  id: string;
  agentId: string;
  startTime: Date;
  endTime?: Date;
  episodes: number;
  totalReward: number;
  improvementScore: number;
  convergenceAchieved: boolean;
}