import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { Copy, Download, Upload, Wand2, Brain, Server, Database, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIInfrastructurePrompt {
  id: string;
  title: string;
  description: string;
  category: 'architecture' | 'deployment' | 'optimization' | 'monitoring' | 'security' | 'scaling';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  template: string;
  tags: string[];
  variables: string[];
}

const infrastructurePrompts: AIInfrastructurePrompt[] = [
  {
    id: 'arch-1',
    title: 'Multi-Agent System Architecture Design',
    description: 'Design a scalable multi-agent AI system with proper load balancing and communication protocols',
    category: 'architecture',
    complexity: 'advanced',
    template: `Design a multi-agent AI system architecture for {{use_case}} with the following requirements:

**System Requirements:**
- {{num_agents}} specialized agents
- {{expected_load}} concurrent requests
- {{latency_requirement}} response time
- {{availability_requirement}} uptime

**Architecture Components:**
1. Agent orchestration layer
2. Message broker system
3. Shared memory/state management
4. Load balancing strategy
5. Fault tolerance mechanisms

**Technical Constraints:**
- {{infrastructure_type}} (cloud/on-premise/hybrid)
- {{budget_constraint}} budget
- {{compliance_requirements}} compliance needs

Please provide:
- Detailed system architecture diagram
- Component specifications
- Communication protocols
- Deployment strategy
- Monitoring and observability plan`,
    tags: ['multi-agent', 'architecture', 'scalability', 'orchestration'],
    variables: ['use_case', 'num_agents', 'expected_load', 'latency_requirement', 'availability_requirement', 'infrastructure_type', 'budget_constraint', 'compliance_requirements']
  },
  {
    id: 'deploy-1',
    title: 'AI Model Deployment Pipeline',
    description: 'Create a robust CI/CD pipeline for AI model deployment with automated testing and rollback',
    category: 'deployment',
    complexity: 'intermediate',
    template: `Design a comprehensive deployment pipeline for {{model_type}} models with the following specifications:

**Model Details:**
- Model type: {{model_type}}
- Framework: {{ml_framework}}
- Model size: {{model_size}}
- Expected inference volume: {{inference_volume}}

**Pipeline Requirements:**
1. Automated model validation and testing
2. A/B testing capabilities
3. Blue-green deployment strategy
4. Automated rollback mechanisms
5. Performance monitoring

**Infrastructure:**
- Container orchestration: {{orchestration_platform}}
- Cloud provider: {{cloud_provider}}
- Monitoring stack: {{monitoring_tools}}

Provide:
- Complete pipeline configuration
- Testing strategies
- Deployment scripts
- Monitoring setup
- Incident response procedures`,
    tags: ['deployment', 'ci-cd', 'containers', 'monitoring'],
    variables: ['model_type', 'ml_framework', 'model_size', 'inference_volume', 'orchestration_platform', 'cloud_provider', 'monitoring_tools']
  },
  {
    id: 'opt-1',
    title: 'GPU Cluster Optimization',
    description: 'Optimize GPU cluster utilization for distributed AI training and inference workloads',
    category: 'optimization',
    complexity: 'advanced',
    template: `Optimize GPU cluster performance for {{workload_type}} with the following configuration:

**Current Setup:**
- {{gpu_count}} × {{gpu_model}} GPUs
- {{node_count}} compute nodes
- Network: {{network_topology}}
- Storage: {{storage_type}}

**Workload Characteristics:**
- Training batch size: {{batch_size}}
- Model parameters: {{param_count}}
- Data throughput: {{data_throughput}}
- Memory requirements: {{memory_req}}

**Optimization Goals:**
1. Maximize GPU utilization (target: {{target_utilization}}%)
2. Minimize training time
3. Optimize memory usage
4. Reduce communication overhead

Please provide:
- Detailed performance analysis
- Optimization recommendations
- Resource allocation strategy
- Monitoring dashboards
- Cost optimization suggestions`,
    tags: ['gpu', 'optimization', 'distributed-training', 'performance'],
    variables: ['workload_type', 'gpu_count', 'gpu_model', 'node_count', 'network_topology', 'storage_type', 'batch_size', 'param_count', 'data_throughput', 'memory_req', 'target_utilization']
  },
  {
    id: 'monitor-1',
    title: 'AI System Observability Stack',
    description: 'Design comprehensive monitoring and observability for AI systems including model performance tracking',
    category: 'monitoring',
    complexity: 'intermediate',
    template: `Design an observability stack for {{ai_system_type}} with comprehensive monitoring capabilities:

**System Overview:**
- System type: {{ai_system_type}}
- Scale: {{request_volume}} requests/day
- Components: {{component_count}} microservices
- Data pipeline: {{data_pipeline_desc}}

**Monitoring Requirements:**
1. Model performance metrics (accuracy, drift, bias)
2. Infrastructure health (CPU, memory, GPU, network)
3. Application metrics (latency, throughput, errors)
4. Business metrics ({{business_metrics}})
5. Security monitoring

**Observability Stack:**
- Metrics: {{metrics_platform}}
- Logging: {{logging_platform}}
- Tracing: {{tracing_platform}}
- Alerting: {{alerting_platform}}

Deliver:
- Complete monitoring architecture
- Key metrics and SLIs/SLOs
- Alert configurations
- Dashboard designs
- Incident response playbooks`,
    tags: ['monitoring', 'observability', 'metrics', 'alerting'],
    variables: ['ai_system_type', 'request_volume', 'component_count', 'data_pipeline_desc', 'business_metrics', 'metrics_platform', 'logging_platform', 'tracing_platform', 'alerting_platform']
  },
  {
    id: 'security-1',
    title: 'AI Security Framework',
    description: 'Implement comprehensive security measures for AI systems including data protection and model security',
    category: 'security',
    complexity: 'advanced',
    template: `Design a comprehensive security framework for {{ai_application}} addressing the following requirements:

**Application Context:**
- AI application: {{ai_application}}
- Data sensitivity: {{data_classification}}
- Compliance requirements: {{compliance_standards}}
- User base: {{user_count}} users
- Geographic distribution: {{regions}}

**Security Domains:**
1. Data security (encryption, access control, privacy)
2. Model security (adversarial attacks, model theft, poisoning)
3. Infrastructure security (network, containers, APIs)
4. Application security (authentication, authorization, audit)
5. Operational security (incident response, backup, recovery)

**Threat Model:**
- Primary threats: {{threat_categories}}
- Risk level: {{risk_assessment}}
- Attack vectors: {{attack_vectors}}

Provide:
- Detailed security architecture
- Security controls implementation
- Threat detection mechanisms
- Incident response procedures
- Compliance mapping
- Security testing strategy`,
    tags: ['security', 'compliance', 'threat-modeling', 'data-protection'],
    variables: ['ai_application', 'data_classification', 'compliance_standards', 'user_count', 'regions', 'threat_categories', 'risk_assessment', 'attack_vectors']
  },
  {
    id: 'scale-1',
    title: 'Auto-scaling AI Infrastructure',
    description: 'Design auto-scaling mechanisms for AI workloads with predictive scaling and cost optimization',
    category: 'scaling',
    complexity: 'advanced',
    template: `Design an auto-scaling solution for {{ai_workload}} with intelligent scaling policies:

**Workload Characteristics:**
- Workload type: {{ai_workload}}
- Traffic patterns: {{traffic_patterns}}
- Resource requirements: {{resource_profile}}
- Performance SLAs: {{sla_requirements}}

**Scaling Requirements:**
1. Horizontal scaling ({{min_instances}} - {{max_instances}} instances)
2. Vertical scaling capabilities
3. Predictive scaling based on {{prediction_factors}}
4. Cost optimization (target: {{cost_target}})
5. Zero-downtime scaling

**Infrastructure:**
- Platform: {{platform_type}}
- Container orchestration: {{orchestrator}}
- Load balancer: {{load_balancer}}
- Storage: {{storage_solution}}

**Scaling Triggers:**
- CPU/GPU utilization thresholds
- Memory usage patterns
- Queue depth monitoring
- Custom business metrics

Deliver:
- Auto-scaling architecture
- Scaling policies and algorithms
- Cost optimization strategies
- Performance monitoring
- Testing and validation plan`,
    tags: ['auto-scaling', 'cost-optimization', 'performance', 'infrastructure'],
    variables: ['ai_workload', 'traffic_patterns', 'resource_profile', 'sla_requirements', 'min_instances', 'max_instances', 'prediction_factors', 'cost_target', 'platform_type', 'orchestrator', 'load_balancer', 'storage_solution']
  }
];

export function PromptEngineeringGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<AIInfrastructurePrompt | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const { toast } = useToast();

  const filteredPrompts = infrastructurePrompts.filter(prompt => {
    const categoryMatch = selectedCategory === 'all' || prompt.category === selectedCategory;
    const complexityMatch = selectedComplexity === 'all' || prompt.complexity === selectedComplexity;
    return categoryMatch && complexityMatch;
  });

  const handleTemplateSelect = (prompt: AIInfrastructurePrompt) => {
    setSelectedTemplate(prompt);
    setVariableValues({});
    setGeneratedPrompt('');
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [variable]: value }));
  };

  const generatePrompt = () => {
    if (!selectedTemplate) return;

    let prompt = selectedTemplate.template;
    selectedTemplate.variables.forEach(variable => {
      const value = variableValues[variable] || `[${variable}]`;
      prompt = prompt.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });
    
    setGeneratedPrompt(prompt);
    toast({
      title: "Prompt Generated",
      description: "Your AI infrastructure prompt has been generated successfully.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Prompt has been copied to your clipboard.",
    });
  };

  const handleFileProcessed = (content: string, fileName: string) => {
    setCustomPrompt(content);
    toast({
      title: "File Uploaded",
      description: `${fileName} has been loaded into the prompt editor.`,
    });
  };

  const exportPrompt = () => {
    const content = generatedPrompt || customPrompt;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-infrastructure-prompt.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Infrastructure Architecture Prompt Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Template Library</TabsTrigger>
              <TabsTrigger value="generator">Prompt Generator</TabsTrigger>
              <TabsTrigger value="custom">Custom Editor</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="architecture">Architecture</SelectItem>
                      <SelectItem value="deployment">Deployment</SelectItem>
                      <SelectItem value="optimization">Optimization</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="scaling">Scaling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="complexity">Complexity</Label>
                  <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredPrompts.map((prompt) => (
                  <Card key={prompt.id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleTemplateSelect(prompt)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{prompt.title}</h3>
                        <div className="flex gap-2">
                          <Badge variant={prompt.complexity === 'advanced' ? 'destructive' : prompt.complexity === 'intermediate' ? 'default' : 'secondary'}>
                            {prompt.complexity}
                          </Badge>
                          <Badge variant="outline">{prompt.category}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{prompt.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="generator" className="space-y-4">
              {selectedTemplate ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedTemplate.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                      
                      <div className="grid gap-4">
                        <h4 className="font-semibold">Configure Variables:</h4>
                        {selectedTemplate.variables.map((variable) => (
                          <div key={variable}>
                            <Label htmlFor={variable}>{variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                            <Input
                              id={variable}
                              placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                              value={variableValues[variable] || ''}
                              onChange={(e) => handleVariableChange(variable, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={generatePrompt} className="flex items-center gap-2">
                          <Wand2 className="h-4 w-4" />
                          Generate Prompt
                        </Button>
                        {generatedPrompt && (
                          <>
                            <Button variant="outline" onClick={() => copyToClipboard(generatedPrompt)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={exportPrompt}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      {generatedPrompt && (
                        <div className="mt-4">
                          <Label>Generated Prompt:</Label>
                          <Textarea
                            value={generatedPrompt}
                            onChange={(e) => setGeneratedPrompt(e.target.value)}
                            rows={12}
                            className="mt-2 font-mono text-sm"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a template from the library to start generating prompts</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Custom Prompt Editor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUpload onFileProcessed={handleFileProcessed} />
                  
                  <div>
                    <Label htmlFor="custom-prompt">Write or Edit Your Prompt:</Label>
                    <Textarea
                      id="custom-prompt"
                      placeholder="Enter your custom AI infrastructure architecture prompt here..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={10}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(customPrompt)}
                      disabled={!customPrompt}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={exportPrompt}
                      disabled={!customPrompt}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}