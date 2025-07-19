export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  currentTask?: Task;
  performance: AgentPerformance;
}

export interface Task {
  id: string;
  type: TaskType;
  priority: Priority;
  input: any;
  output?: any;
  status: TaskStatus;
  assignedAgent?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  content: any;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface AgentPerformance {
  tasksCompleted: number;
  averageTime: number;
  successRate: number;
  currentLoad: number;
}

export type AgentType = 
  | 'orchestrator'
  | 'analyzer' 
  | 'generator'
  | 'tester'
  | 'debugger'
  | 'trainer'
  | 'monitor';

export type AgentStatus = 
  | 'idle'
  | 'busy'
  | 'error'
  | 'offline';

export type TaskType = 
  | 'analyze_architecture'
  | 'generate_code'
  | 'run_tests'
  | 'debug_issues'
  | 'train_model'
  | 'monitor_performance'
  | 'optimize_parameters';

export type TaskStatus = 
  | 'pending'
  | 'assigned'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type MessageType = 
  | 'task_assignment'
  | 'task_result'
  | 'status_update'
  | 'resource_request'
  | 'collaboration_request';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  context: ConversationContext;
  activeTask?: Task;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'agent';
  content: string;
  timestamp: Date;
  agentId?: string;
  taskId?: string;
  metadata?: Record<string, any>;
}

export interface ConversationContext {
  currentProject?: string;
  activeTasks: string[];
  sessionData: Record<string, any>;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultAgents: string[];
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  autorun: boolean;
  notifications: boolean;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  input: any;
  expectedOutput: any;
  metrics: string[];
  environment: TestEnvironment;
}

export interface TestEnvironment {
  resources: ResourceLimits;
  constraints: EnvironmentConstraints;
  monitoring: MonitoringConfig;
}

export interface ResourceLimits {
  maxMemory: number;
  maxCpu: number;
  maxTime: number;
  maxRequests: number;
}

export interface EnvironmentConstraints {
  networkLatency?: number;
  errorRate?: number;
  concurrentUsers?: number;
}

export interface MonitoringConfig {
  metrics: string[];
  intervals: number;
  alertThresholds: Record<string, number>;
}

export interface TrainingConfig {
  modelType: string;
  dataset: DatasetConfig;
  hyperparameters: Record<string, any>;
  optimization: OptimizationConfig;
  validation: ValidationConfig;
}

export interface DatasetConfig {
  source: string;
  format: string;
  preprocessing: string[];
  splitRatio: [number, number, number]; // train, validation, test
}

export interface OptimizationConfig {
  algorithm: string;
  searchSpace: Record<string, any>;
  maxIterations: number;
  earlyStoppingCriteria: Record<string, any>;
}

export interface ValidationConfig {
  method: string;
  metrics: string[];
  crossValidationFolds?: number;
}

export interface DebugReport {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  stackTrace?: string;
  suggestedFixes: string[];
  affectedComponents: string[];
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  throughput: number;
}