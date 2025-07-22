import { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage, ConversationContext, UserPreferences } from '../types/MultiAgentTypes';
import { AgentOrchestrator } from './AgentOrchestrator';
import { AnalysisCard } from '../AnalysisCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bot, User, Send, Loader2, MessageSquare, Settings, Upload } from 'lucide-react';
import { FileUpload } from '../FileUpload';

interface MultiTaskChatbotProps {
  orchestrator: AgentOrchestrator;
  onTaskCreated?: (taskId: string) => void;
}

export function MultiTaskChatbot({ orchestrator, onTaskCreated }: MultiTaskChatbotProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultAgents: ['analyzer-001', 'generator-001'],
    analysisDepth: 'detailed',
    autorun: true,
    notifications: true
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create initial conversation
    createNewConversation('Welcome! How can I help you today?');
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = (title?: string) => {
    const newConversation: Conversation = {
      id: generateConversationId(),
      title: title || `Conversation ${conversations.length + 1}`,
      messages: [{
        id: generateMessageId(),
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant with access to multiple specialized agents. I can help you with architecture analysis, code generation, testing, debugging, and model training. What would you like to work on?',
        timestamp: new Date()
      }],
      context: {
        activeTasks: [],
        sessionData: {},
        preferences
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => [...prev, newConversation]);
    setActiveConversation(newConversation);
    return newConversation;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeConversation || isProcessing) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Add user message
    updateConversationMessages(activeConversation.id, [userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Parse user intent and create tasks
      const response = await processUserMessage(userMessage.content, activeConversation);
      
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        taskId: 'taskId' in response ? response.taskId : undefined,
        metadata: response.metadata
      };

      updateConversationMessages(activeConversation.id, [assistantMessage]);

      if ('taskId' in response && response.taskId && onTaskCreated) {
        onTaskCreated(response.taskId);
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      };

      updateConversationMessages(activeConversation.id, [errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserMessage = async (message: string, conversation: Conversation) => {
    const intent = analyzeUserIntent(message);
    
    switch (intent.action) {
      case 'analyze_architecture':
        return await handleArchitectureAnalysis(intent, conversation);
      case 'generate_code':
        return await handleCodeGeneration(intent, conversation);
      case 'run_tests':
        return await handleTestExecution(intent, conversation);
      case 'debug_issues':
        return await handleDebugging(intent, conversation);
      case 'train_model':
        return await handleModelTraining(intent, conversation);
      case 'get_status':
        return handleStatusCheck(intent, conversation);
      default:
        return handleGeneralQuery(intent, conversation);
    }
  };

  const analyzeUserIntent = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based intent classification
    if (lowerMessage.includes('analyze') || lowerMessage.includes('architecture') || lowerMessage.includes('components')) {
      return { action: 'analyze_architecture', data: extractArchitectureData(message) };
    }
    
    if (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('code')) {
      return { action: 'generate_code', data: extractGenerationData(message) };
    }
    
    if (lowerMessage.includes('test') || lowerMessage.includes('run tests') || lowerMessage.includes('testing')) {
      return { action: 'run_tests', data: extractTestData(message) };
    }
    
    if (lowerMessage.includes('debug') || lowerMessage.includes('fix') || lowerMessage.includes('error')) {
      return { action: 'debug_issues', data: extractDebugData(message) };
    }
    
    if (lowerMessage.includes('train') || lowerMessage.includes('model') || lowerMessage.includes('fine-tune')) {
      return { action: 'train_model', data: extractTrainingData(message) };
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('progress') || lowerMessage.includes('agents')) {
      return { action: 'get_status', data: {} };
    }
    
    return { action: 'general_query', data: { message } };
  };

  const handleArchitectureAnalysis = async (intent: any, conversation: Conversation) => {
    const taskId = await orchestrator.submitTask({
      type: 'analyze_architecture',
      priority: 'medium',
      input: intent.data,
      metadata: { conversationId: conversation.id }
    });

    updateConversationContext(conversation.id, { activeTasks: [...conversation.context.activeTasks, taskId] });

    return {
      content: `🔍 I've started analyzing the architecture with our specialized analysis agent. Task ID: ${taskId}\n\nThe agent will examine:\n• Component structure and relationships\n• Architecture patterns and best practices\n• Performance and scalability considerations\n• Security and reliability factors\n\nI'll notify you when the analysis is complete!`,
      taskId,
      metadata: { agentType: 'analyzer' }
    };
  };

  const handleCodeGeneration = async (intent: any, conversation: Conversation) => {
    const taskId = await orchestrator.submitTask({
      type: 'generate_code',
      priority: 'medium',
      input: intent.data,
      metadata: { conversationId: conversation.id }
    });

    updateConversationContext(conversation.id, { activeTasks: [...conversation.context.activeTasks, taskId] });

    return {
      content: `⚡ Code generation task has been assigned to our generator agent. Task ID: ${taskId}\n\nThe agent will create:\n• Component implementations\n• Interface definitions\n• Configuration files\n• Documentation and tests\n\nGeneration in progress...`,
      taskId,
      metadata: { agentType: 'generator' }
    };
  };

  const handleTestExecution = async (intent: any, conversation: Conversation) => {
    const taskId = await orchestrator.submitTask({
      type: 'run_tests',
      priority: 'high',
      input: intent.data,
      metadata: { conversationId: conversation.id }
    });

    return {
      content: `🧪 Test execution started with our testing specialist. Task ID: ${taskId}\n\nRunning:\n• Unit tests\n• Integration tests\n• Performance benchmarks\n• Security scans\n\nResults will be available shortly!`,
      taskId,
      metadata: { agentType: 'tester' }
    };
  };

  const handleDebugging = async (intent: any, conversation: Conversation) => {
    const taskId = await orchestrator.submitTask({
      type: 'debug_issues',
      priority: 'high',
      input: intent.data,
      metadata: { conversationId: conversation.id }
    });

    return {
      content: `🐛 Debug analysis initiated with our debugging specialist. Task ID: ${taskId}\n\nInvestigating:\n• Error patterns and stack traces\n• Performance bottlenecks\n• Memory leaks and resource issues\n• Logic errors and edge cases\n\nAnalysis in progress...`,
      taskId,
      metadata: { agentType: 'debugger' }
    };
  };

  const handleModelTraining = async (intent: any, conversation: Conversation) => {
    const taskId = await orchestrator.submitTask({
      type: 'train_model',
      priority: 'low',
      input: intent.data,
      metadata: { conversationId: conversation.id }
    });

    return {
      content: `🚀 Model training started with our ML specialist. Task ID: ${taskId}\n\nTraining process includes:\n• Data preprocessing and validation\n• Hyperparameter optimization\n• Model architecture setup\n• Training progress monitoring\n\nThis may take several minutes...`,
      taskId,
      metadata: { agentType: 'trainer' }
    };
  };

  const handleStatusCheck = (intent: any, conversation: Conversation) => {
    const agents = orchestrator.getAgents();
    const activeTasks = orchestrator.getActiveTasks();
    const queuedTasks = orchestrator.getTaskQueue();

    const agentSummary = agents.map(agent => 
      `• ${agent.name}: ${agent.status} (${agent.performance.tasksCompleted} completed, ${Math.round(agent.performance.successRate)}% success rate)`
    ).join('\n');

    return {
      content: `📊 **System Status Report**\n\n**Active Agents:**\n${agentSummary}\n\n**Tasks:**\n• Active: ${activeTasks.length}\n• Queued: ${queuedTasks.length}\n• Total completed: ${agents.reduce((sum, a) => sum + a.performance.tasksCompleted, 0)}\n\n**Conversation Tasks:**\n• Active in this conversation: ${conversation.context.activeTasks.length}`,
      metadata: { systemStatus: true }
    } as const;
  };

  const handleGeneralQuery = (intent: any, conversation: Conversation) => {
    return {
      content: `I understand you're asking about: "${intent.data.message}"\n\nI can help you with:\n• **Architecture Analysis** - "analyze my system architecture"\n• **Code Generation** - "generate a React component"\n• **Testing** - "run tests on my application"\n• **Debugging** - "debug performance issues"\n• **Model Training** - "train a new model"\n• **Status Check** - "show agent status"\n\nWhat would you like me to help you with?`,
      metadata: { queryType: 'general' }
    } as const;
  };

  // Helper functions for data extraction
  const extractArchitectureData = (message: string) => ({ description: message });
  const extractGenerationData = (message: string) => ({ requirements: message });
  const extractTestData = (message: string) => ({ testType: 'comprehensive' });
  const extractDebugData = (message: string) => ({ issue: message });
  const extractTrainingData = (message: string) => ({ modelType: 'custom' });

  const updateConversationMessages = (conversationId: string, newMessages: ChatMessage[]) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, messages: [...conv.messages, ...newMessages], updatedAt: new Date() }
        : conv
    ));

    if (activeConversation?.id === conversationId) {
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, ...newMessages],
        updatedAt: new Date()
      } : null);
    }
  };

  const updateConversationContext = (conversationId: string, contextUpdates: Partial<ConversationContext>) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, context: { ...conv.context, ...contextUpdates } }
        : conv
    ));

    if (activeConversation?.id === conversationId) {
      setActiveConversation(prev => prev ? {
        ...prev,
        context: { ...prev.context, ...contextUpdates }
      } : null);
    }
  };

  const generateConversationId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnalysisCard
      title="Multi-Task AI Assistant"
      description="Intelligent chatbot with specialized agent delegation"
      icon={MessageSquare}
      variant="cognitive"
    >
      <div className="space-y-4">
        {/* Conversation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              {orchestrator.getAgents().filter(a => a.status === 'idle').length} Available Agents
            </Badge>
            {activeConversation && activeConversation.context.activeTasks.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {activeConversation.context.activeTasks.length} Active Tasks
              </Badge>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => createNewConversation()}
          >
            New Chat
          </Button>
        </div>

        <Separator />

        {/* Messages */}
        <ScrollArea className="h-96">
          <div className="space-y-4 p-4">
            {activeConversation?.messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    
                    {message.taskId && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <Badge variant="outline" className="text-xs">
                          Task: {message.taskId}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="rounded-lg p-3 bg-muted">
                    <div className="text-sm">Processing your request...</div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to analyze, generate, test, debug, or train..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing}
              size="icon"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* File Upload for Chat */}
          <details className="group">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Attach files to your message
            </summary>
            <div className="mt-2 p-3 border rounded-lg bg-muted/20">
              <FileUpload 
                onFileProcessed={(content, fileName) => {
                  setInput(prev => prev + (prev ? '\n\n' : '') + `[File: ${fileName}]\n\n${content}`);
                }}
                acceptedTypes={['.txt', '.md', '.json', '.csv', '.log']}
                maxFileSize={5}
                className="scale-95"
              />
            </div>
          </details>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {[
            'Analyze my architecture',
            'Generate a component',
            'Run tests',
            'Debug issues',
            'Check agent status'
          ].map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => setInput(action)}
              disabled={isProcessing}
              className="text-xs"
            >
              {action}
            </Button>
          ))}
        </div>
      </div>
    </AnalysisCard>
  );
}