import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Video, 
  FileText,
  ExternalLink,
  Lightbulb,
  Code,
  Settings,
  Zap
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface TutorialItem {
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
}

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs: FAQItem[] = [
    {
      question: "How do I analyze my AI system architecture?",
      answer: "Simply paste your system description in the input area and click 'Analyze System'. Our AI will automatically detect components, relationships, and provide comprehensive analysis including architecture validation and recommendations.",
      category: "analysis"
    },
    {
      question: "What types of AI systems can be analyzed?",
      answer: "Our platform supports analysis of various AI systems including neural networks, multi-agent systems, cognitive architectures, knowledge-based systems, and hybrid AI solutions. The system recognizes components like neural engines, memory systems, reasoning frameworks, and more.",
      category: "analysis"
    },
    {
      question: "How does the multi-agent chatbot work?",
      answer: "The chatbot uses specialized agents for different tasks like architecture analysis, code generation, testing, and debugging. When you send a message, it automatically routes your request to the most appropriate agent and coordinates their responses.",
      category: "chatbot"
    },
    {
      question: "Can I export analysis results?",
      answer: "Yes! You can export comprehensive reports including component analysis, relationship mappings, validation results, and recommendations in various formats through the dashboard.",
      category: "features"
    },
    {
      question: "How accurate is the system analysis?",
      answer: "Our analysis engine uses advanced pattern recognition and maintains a confidence score for each detected component. The accuracy typically ranges from 85-95% depending on the complexity and detail of your system description.",
      category: "analysis"
    },
    {
      question: "What should I include in my system description?",
      answer: "Include detailed information about components, their purposes, interactions, data flows, and technical specifications. The more detailed your description, the better the analysis quality.",
      category: "tips"
    }
  ];

  const tutorials: TutorialItem[] = [
    {
      title: "Getting Started with System Analysis",
      description: "Learn how to input your AI system description and interpret the analysis results.",
      duration: "5 min",
      difficulty: "Beginner",
      topics: ["System Input", "Component Detection", "Basic Analysis"]
    },
    {
      title: "Understanding Component Relationships",
      description: "Deep dive into how components interact and how to optimize system architecture.",
      duration: "8 min",
      difficulty: "Intermediate",
      topics: ["Relationship Mapping", "Data Flow", "Architecture Patterns"]
    },
    {
      title: "Advanced Multi-Agent Usage",
      description: "Master the multi-agent chatbot for complex development workflows.",
      duration: "12 min",
      difficulty: "Advanced",
      topics: ["Agent Orchestration", "Task Management", "Custom Workflows"]
    },
    {
      title: "Memory System Analysis",
      description: "Learn to analyze and optimize memory systems in AI architectures.",
      duration: "10 min",
      difficulty: "Intermediate",
      topics: ["Memory Types", "Persistence", "Performance Optimization"]
    }
  ];

  const filteredFAQs = faqs.filter(
    faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTutorials = tutorials.filter(
    tutorial => 
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">Help Center</CardTitle>
              <CardDescription>
                Find answers, tutorials, and guidance for using the AI Systems Architecture Platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help topics, features, or issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card 
          className="text-center hover:shadow-glow transition-shadow cursor-pointer"
          onClick={() => window.open('https://docs.lovable.dev/', '_blank')}
        >
          <CardContent className="pt-6">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Documentation</h3>
            <p className="text-sm text-muted-foreground">Complete guides and API docs</p>
          </CardContent>
        </Card>
        
        <Card 
          className="text-center hover:shadow-glow transition-shadow cursor-pointer"
          onClick={() => window.open('https://www.youtube.com/watch?v=9KHLTZaJcR8&list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO', '_blank')}
        >
          <CardContent className="pt-6">
            <Video className="h-8 w-8 text-cognitive mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground">Step-by-step video guides</p>
          </CardContent>
        </Card>
        
        <Card 
          className="text-center hover:shadow-glow transition-shadow cursor-pointer"
          onClick={() => window.open('https://discord.com/channels/1119885301872070706/1280461670979993613', '_blank')}
        >
          <CardContent className="pt-6">
            <MessageSquare className="h-8 w-8 text-analysis mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Community</h3>
            <p className="text-sm text-muted-foreground">Connect with other users</p>
          </CardContent>
        </Card>
        
        <Card 
          className="text-center hover:shadow-glow transition-shadow cursor-pointer"
          onClick={() => window.open('mailto:support@lovable.dev', '_blank')}
        >
          <CardContent className="pt-6">
            <Settings className="h-8 w-8 text-neural mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Support</h3>
            <p className="text-sm text-muted-foreground">Contact our support team</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Common questions and answers about the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>{faq.question}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTutorials.map((tutorial, index) => (
              <Card key={index} className="hover:shadow-glow transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </div>
                    <Badge variant={
                      tutorial.difficulty === 'Beginner' ? 'default' :
                      tutorial.difficulty === 'Intermediate' ? 'secondary' : 'destructive'
                    }>
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      {tutorial.duration}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {tutorial.topics.map((topic, topicIndex) => (
                      <Badge key={topicIndex} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Tutorial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-cognitive" />
                  Neural Network Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Example analysis of a transformer-based neural network with attention mechanisms.
                </p>
                <div className="bg-muted p-3 rounded-md text-sm font-mono">
                  "The Adaptive Intelligence Network (AIN) utilizes transformer-based models with multi-head attention..."
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Example
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-analysis" />
                  Multi-Agent System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Complex multi-agent coordination system with distributed reasoning.
                </p>
                <div className="bg-muted p-3 rounded-md text-sm font-mono">
                  "The Distributed AI Coordination Platform features multiple specialized agents..."
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Example
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid gap-4">
            {[
              {
                title: "Write Detailed Descriptions",
                tip: "Include specific technical details about components, data flows, and interactions for more accurate analysis.",
                icon: FileText
              },
              {
                title: "Use Technical Terminology",
                tip: "The system recognizes AI-specific terms like 'transformer', 'attention mechanism', 'neural embedding', etc.",
                icon: Lightbulb
              },
              {
                title: "Describe Component Relationships",
                tip: "Explain how components interact, what data they exchange, and their dependencies.",
                icon: MessageSquare
              },
              {
                title: "Leverage Multi-Agent Features",
                tip: "Use specific commands like 'analyze', 'generate', 'test', or 'debug' to route tasks to specialized agents.",
                icon: Zap
              }
            ].map((tip, index) => (
              <Card key={index}>
                <CardContent className="flex items-start gap-3 pt-6">
                  <tip.icon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.tip}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}