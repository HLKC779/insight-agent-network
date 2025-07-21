import { Agent, Task, Message, AgentType, TaskType, TaskStatus, Priority } from '../types/MultiAgentTypes';

export class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private taskQueue: Task[] = [];
  private messageQueue: Message[] = [];
  private activeTasks: Map<string, Task> = new Map();
  private completedTasks: Task[] = [];
  private resourceMonitor: ResourceMonitor;

  constructor() {
    this.resourceMonitor = new ResourceMonitor();
    this.initializeAgents();
    this.startOrchestrationLoop();
  }

  private initializeAgents() {
    // Initialize core agents
    const agents: Agent[] = [
      {
        id: 'analyzer-001',
        name: 'Architecture Analyzer',
        type: 'analyzer',
        status: 'idle',
        capabilities: ['architecture_analysis', 'component_detection', 'relationship_mapping'],
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 100, currentLoad: 0 }
      },
      {
        id: 'generator-001',
        name: 'Code Generator',
        type: 'generator',
        status: 'idle',
        capabilities: ['code_generation', 'component_creation', 'refactoring'],
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 100, currentLoad: 0 }
      },
      {
        id: 'tester-001',
        name: 'Test Runner',
        type: 'tester',
        status: 'idle',
        capabilities: ['unit_testing', 'integration_testing', 'performance_testing'],
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 100, currentLoad: 0 }
      },
      {
        id: 'debugger-001',
        name: 'Debug Specialist',
        type: 'debugger',
        status: 'idle',
        capabilities: ['error_detection', 'performance_analysis', 'fix_suggestions'],
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 100, currentLoad: 0 }
      },
      {
        id: 'trainer-001',
        name: 'Model Trainer',
        type: 'trainer',
        status: 'idle',
        capabilities: ['model_training', 'hyperparameter_optimization', 'model_evaluation'],
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 100, currentLoad: 0 }
      }
    ];

    agents.forEach(agent => this.agents.set(agent.id, agent));
  }

  async submitTask(task: Omit<Task, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const fullTask: Task = {
      ...task,
      id: this.generateTaskId(),
      status: 'pending',
      createdAt: new Date()
    };

    this.taskQueue.push(fullTask);
    this.prioritizeTaskQueue();
    
    return fullTask.id;
  }

  private startOrchestrationLoop() {
    setInterval(() => {
      this.processTaskQueue();
      this.handleMessages();
      this.monitorAgentHealth();
      this.optimizeResourceAllocation();
    }, 1000);
  }

  private processTaskQueue() {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'idle')
      .sort((a, b) => a.performance.currentLoad - b.performance.currentLoad);

    for (const agent of availableAgents) {
      const suitableTask = this.findSuitableTask(agent);
      if (suitableTask) {
        this.assignTaskToAgent(suitableTask, agent);
      }
    }
  }

  private findSuitableTask(agent: Agent): Task | null {
    return this.taskQueue.find(task => 
      task.status === 'pending' && 
      this.canAgentHandleTask(agent, task)
    ) || null;
  }

  private canAgentHandleTask(agent: Agent, task: Task): boolean {
    const taskCapabilityMap: Record<TaskType, string[]> = {
      'analyze_architecture': ['architecture_analysis', 'component_detection'],
      'generate_code': ['code_generation', 'component_creation'],
      'run_tests': ['unit_testing', 'integration_testing', 'performance_testing'],
      'debug_issues': ['error_detection', 'performance_analysis'],
      'train_model': ['model_training', 'hyperparameter_optimization'],
      'monitor_performance': ['performance_monitoring', 'metrics_collection'],
      'optimize_parameters': ['hyperparameter_optimization', 'model_evaluation']
    };

    const requiredCapabilities = taskCapabilityMap[task.type] || [];
    return requiredCapabilities.some(cap => agent.capabilities.includes(cap));
  }

  private assignTaskToAgent(task: Task, agent: Agent) {
    task.status = 'assigned';
    task.assignedAgent = agent.id;
    task.startedAt = new Date();
    
    agent.status = 'busy';
    agent.currentTask = task;
    agent.performance.currentLoad += 1;

    this.activeTasks.set(task.id, task);
    
    // Remove from queue
    const index = this.taskQueue.indexOf(task);
    if (index > -1) {
      this.taskQueue.splice(index, 1);
    }

    // Start task execution
    this.executeTask(task, agent);
  }

  private async executeTask(task: Task, agent: Agent) {
    try {
      task.status = 'running';
      
      // Simulate task execution with different agents
      const result = await this.delegateToSpecializedAgent(task, agent);
      
      task.output = result;
      task.status = 'completed';
      task.completedAt = new Date();
      
      // Update agent performance
      const executionTime = task.completedAt.getTime() - (task.startedAt?.getTime() || 0);
      this.updateAgentPerformance(agent, executionTime, true);
      
    } catch (error) {
      task.status = 'failed';
      task.output = { error: error.message };
      
      this.updateAgentPerformance(agent, 0, false);
    } finally {
      agent.status = 'idle';
      agent.currentTask = undefined;
      agent.performance.currentLoad = Math.max(0, agent.performance.currentLoad - 1);
      
      this.activeTasks.delete(task.id);
      
      // Store completed task
      if (task.status === 'completed') {
        this.completedTasks.push(task);
      }
      
      // Notify completion
      this.notifyTaskCompletion(task);
    }
  }

  private async delegateToSpecializedAgent(task: Task, agent: Agent): Promise<any> {
    switch (agent.type) {
      case 'analyzer':
        return this.executeAnalysisTask(task);
      case 'generator':
        return this.executeGenerationTask(task);
      case 'tester':
        return this.executeTestingTask(task);
      case 'debugger':
        return this.executeDebuggingTask(task);
      case 'trainer':
        return this.executeTrainingTask(task);
      default:
        throw new Error(`Unknown agent type: ${agent.type}`);
    }
  }

  private async executeAnalysisTask(task: Task): Promise<any> {
    // Simulate analysis work
    await this.simulateWork(2000 + Math.random() * 3000);
    
    return {
      analysisType: task.type,
      components: Math.floor(Math.random() * 5) + 3,
      relationships: Math.floor(Math.random() * 8) + 2,
      confidence: Math.random() * 0.3 + 0.7,
      recommendations: [
        'Consider adding error handling',
        'Implement caching layer',
        'Add monitoring endpoints'
      ]
    };
  }

  private async executeGenerationTask(task: Task): Promise<any> {
    await this.simulateWork(3000 + Math.random() * 4000);
    
    return {
      generatedCode: `// Generated code for ${task.type}`,
      filesCreated: Math.floor(Math.random() * 3) + 1,
      linesOfCode: Math.floor(Math.random() * 500) + 100,
      testCoverage: Math.random() * 0.4 + 0.6
    };
  }

  private async executeTestingTask(task: Task): Promise<any> {
    await this.simulateWork(1500 + Math.random() * 2500);
    
    return {
      testsRun: Math.floor(Math.random() * 20) + 10,
      testsPassed: Math.floor(Math.random() * 18) + 8,
      coverage: Math.random() * 0.3 + 0.7,
      performanceMetrics: {
        averageResponseTime: Math.random() * 100 + 50,
        memoryUsage: Math.random() * 512 + 256,
        cpuUsage: Math.random() * 50 + 25
      }
    };
  }

  private async executeDebuggingTask(task: Task): Promise<any> {
    await this.simulateWork(2500 + Math.random() * 3500);
    
    return {
      issuesFound: Math.floor(Math.random() * 5) + 1,
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      suggestedFixes: [
        'Add null checks',
        'Optimize database queries',
        'Implement retry logic'
      ],
      performanceImpact: Math.random() * 30 + 10
    };
  }

  private async executeTrainingTask(task: Task): Promise<any> {
    await this.simulateWork(5000 + Math.random() * 10000);
    
    return {
      epochs: Math.floor(Math.random() * 50) + 10,
      finalAccuracy: Math.random() * 0.2 + 0.8,
      trainingTime: Math.random() * 3600 + 1800,
      modelSize: Math.random() * 100 + 50,
      convergence: Math.random() > 0.2
    };
  }

  private simulateWork(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  private updateAgentPerformance(agent: Agent, executionTime: number, success: boolean) {
    const perf = agent.performance;
    
    if (success) {
      perf.tasksCompleted += 1;
      perf.averageTime = (perf.averageTime * (perf.tasksCompleted - 1) + executionTime) / perf.tasksCompleted;
      perf.successRate = (perf.successRate * (perf.tasksCompleted - 1) + 100) / perf.tasksCompleted;
    } else {
      perf.successRate = (perf.successRate * perf.tasksCompleted) / (perf.tasksCompleted + 1);
    }
  }

  private prioritizeTaskQueue() {
    this.taskQueue.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }

  private handleMessages() {
    // Process inter-agent communication
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.routeMessage(message);
      }
    }
  }

  private routeMessage(message: Message) {
    const targetAgent = this.agents.get(message.to);
    if (targetAgent) {
      // Handle different message types
      switch (message.type) {
        case 'task_assignment':
          // Already handled in task assignment
          break;
        case 'resource_request':
          this.handleResourceRequest(message);
          break;
        case 'collaboration_request':
          this.handleCollaborationRequest(message);
          break;
      }
    }
  }

  private handleResourceRequest(message: Message) {
    // Implement resource allocation logic
    console.log('Handling resource request:', message);
  }

  private handleCollaborationRequest(message: Message) {
    // Implement collaboration logic between agents
    console.log('Handling collaboration request:', message);
  }

  private monitorAgentHealth() {
    for (const agent of this.agents.values()) {
      if (agent.status === 'busy' && agent.currentTask) {
        const taskDuration = Date.now() - (agent.currentTask.startedAt?.getTime() || 0);
        
        // Check for stuck tasks (over 30 seconds)
        if (taskDuration > 30000) {
          console.warn(`Agent ${agent.id} appears stuck on task ${agent.currentTask.id}`);
          // Could implement recovery logic here
        }
      }
    }
  }

  private optimizeResourceAllocation() {
    // Implement dynamic resource optimization
    const totalLoad = Array.from(this.agents.values())
      .reduce((sum, agent) => sum + agent.performance.currentLoad, 0);
    
    if (totalLoad > this.agents.size * 0.8) {
      console.log('High load detected, considering scaling');
      // Could spawn additional agents or optimize task distribution
    }
  }

  private notifyTaskCompletion(task: Task) {
    // Emit events or callbacks for task completion
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('taskCompleted', { detail: task }));
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getTaskQueue(): Task[] {
    return [...this.taskQueue];
  }

  getActiveTasks(): Task[] {
    return Array.from(this.activeTasks.values());
  }

  getCompletedTasks(): Task[] {
    return [...this.completedTasks];
  }

  getTaskById(taskId: string): Task | undefined {
    return this.activeTasks.get(taskId) || 
           this.taskQueue.find(task => task.id === taskId);
  }

  getAgentById(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  cancelTask(taskId: string): boolean {
    const task = this.getTaskById(taskId);
    if (task && task.status !== 'completed') {
      task.status = 'cancelled';
      
      if (task.assignedAgent) {
        const agent = this.agents.get(task.assignedAgent);
        if (agent) {
          agent.status = 'idle';
          agent.currentTask = undefined;
          agent.performance.currentLoad = Math.max(0, agent.performance.currentLoad - 1);
        }
      }
      
      this.activeTasks.delete(taskId);
      return true;
    }
    return false;
  }
}

class ResourceMonitor {
  private metrics: any = {};

  getSystemMetrics() {
    return {
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
      networkLatency: this.getNetworkLatency()
    };
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize;
    }
    return Math.random() * 0.6 + 0.2; // Simulated
  }

  private getCpuUsage(): number {
    // Simulate CPU usage
    return Math.random() * 0.8 + 0.1;
  }

  private getNetworkLatency(): number {
    // Simulate network latency
    return Math.random() * 100 + 10;
  }
}