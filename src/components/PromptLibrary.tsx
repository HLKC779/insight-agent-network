import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Code, 
  Bug, 
  TestTube, 
  Brain, 
  Settings, 
  Database, 
  Shield, 
  Zap,
  Lightbulb,
  Copy,
  Star
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popular?: boolean;
}

interface PromptLibraryProps {
  onPromptSelect?: (prompt: string) => void;
  className?: string;
}

const prompts: Prompt[] = [
  // Architecture Analysis
  {
    id: 'arch-1',
    title: 'Microservices Architecture Review',
    description: 'Analyze a microservices architecture for scalability and performance',
    prompt: 'Please analyze my microservices architecture. I have user service, payment service, order service, and notification service. Each service has its own database. Review the communication patterns, data consistency, and potential bottlenecks.',
    category: 'architecture',
    tags: ['microservices', 'scalability', 'performance'],
    difficulty: 'advanced',
    popular: true
  },
  {
    id: 'arch-2',
    title: 'API Design Best Practices',
    description: 'Get recommendations for RESTful API design',
    prompt: 'Review my REST API design for a social media platform. I need endpoints for users, posts, comments, and likes. Suggest proper HTTP methods, status codes, and data structures.',
    category: 'architecture',
    tags: ['api', 'rest', 'design'],
    difficulty: 'intermediate'
  },
  {
    id: 'arch-3',
    title: 'Database Schema Optimization',
    description: 'Optimize database schema and relationships',
    prompt: 'Analyze my e-commerce database schema with tables for users, products, orders, and reviews. Suggest optimizations for indexing, normalization, and query performance.',
    category: 'architecture',
    tags: ['database', 'optimization', 'schema'],
    difficulty: 'intermediate',
    popular: true
  },

  // Code Generation
  {
    id: 'code-1',
    title: 'React Component with Hooks',
    description: 'Generate a modern React component with state management',
    prompt: 'Create a React component for a todo list with add, edit, delete, and filter functionality. Use modern hooks like useState, useEffect, and custom hooks for API calls.',
    category: 'generation',
    tags: ['react', 'hooks', 'component'],
    difficulty: 'intermediate'
  },
  {
    id: 'code-2',
    title: 'TypeScript Interface Design',
    description: 'Create comprehensive TypeScript interfaces',
    prompt: 'Generate TypeScript interfaces for a blog application with User, Post, Comment, and Category entities. Include proper relationships and optional fields.',
    category: 'generation',
    tags: ['typescript', 'interfaces', 'types'],
    difficulty: 'beginner'
  },
  {
    id: 'code-3',
    title: 'Express.js API Endpoints',
    description: 'Build RESTful API endpoints with Express.js',
    prompt: 'Create Express.js API endpoints for user authentication including registration, login, logout, and password reset. Include middleware for validation and authentication.',
    category: 'generation',
    tags: ['express', 'api', 'authentication'],
    difficulty: 'advanced',
    popular: true
  },

  // Testing
  {
    id: 'test-1',
    title: 'Unit Tests for React Components',
    description: 'Generate comprehensive unit tests',
    prompt: 'Create unit tests for a React login component using Jest and React Testing Library. Test form validation, submission, error handling, and loading states.',
    category: 'testing',
    tags: ['jest', 'react', 'unit-tests'],
    difficulty: 'intermediate'
  },
  {
    id: 'test-2',
    title: 'API Integration Tests',
    description: 'Build end-to-end API tests',
    prompt: 'Write integration tests for a REST API using Supertest. Test CRUD operations for a user management system including proper status codes and response validation.',
    category: 'testing',
    tags: ['integration', 'api', 'supertest'],
    difficulty: 'advanced'
  },
  {
    id: 'test-3',
    title: 'Mock Data Generator',
    description: 'Create realistic test data',
    prompt: 'Generate mock data functions for testing an e-commerce application. Include realistic user profiles, products, orders, and reviews with proper relationships.',
    category: 'testing',
    tags: ['mock-data', 'testing', 'faker'],
    difficulty: 'beginner',
    popular: true
  },

  // Debugging
  {
    id: 'debug-1',
    title: 'Memory Leak Investigation',
    description: 'Identify and fix memory leaks',
    prompt: 'Help me debug a memory leak in my React application. The app becomes slow after navigating between pages multiple times. Suggest debugging strategies and common causes.',
    category: 'debugging',
    tags: ['memory-leak', 'react', 'performance'],
    difficulty: 'advanced'
  },
  {
    id: 'debug-2',
    title: 'Database Query Optimization',
    description: 'Fix slow database queries',
    prompt: 'My PostgreSQL queries are running slowly. Help me analyze the execution plan for a complex join query and suggest optimizations for better performance.',
    category: 'debugging',
    tags: ['database', 'performance', 'sql'],
    difficulty: 'intermediate',
    popular: true
  },
  {
    id: 'debug-3',
    title: 'Error Handling Strategy',
    description: 'Implement robust error handling',
    prompt: 'Design an error handling strategy for a Node.js microservice. Include error logging, user-friendly messages, and proper HTTP status codes.',
    category: 'debugging',
    tags: ['error-handling', 'nodejs', 'logging'],
    difficulty: 'intermediate'
  },

  // AI & ML
  {
    id: 'ai-1',
    title: 'Recommendation System Design',
    description: 'Build a content recommendation engine',
    prompt: 'Design a recommendation system for an e-commerce platform. Consider collaborative filtering, content-based filtering, and hybrid approaches for product recommendations.',
    category: 'ai',
    tags: ['recommendation', 'machine-learning', 'algorithms'],
    difficulty: 'advanced',
    popular: true
  },
  {
    id: 'ai-2',
    title: 'Natural Language Processing',
    description: 'Implement text analysis features',
    prompt: 'Create a sentiment analysis system for customer reviews. Include text preprocessing, feature extraction, and classification using modern NLP techniques.',
    category: 'ai',
    tags: ['nlp', 'sentiment-analysis', 'text-processing'],
    difficulty: 'advanced'
  },
  {
    id: 'ai-3',
    title: 'Data Pipeline for ML',
    description: 'Build machine learning data pipelines',
    prompt: 'Design a data pipeline for training a product recommendation model. Include data collection, cleaning, feature engineering, and model training workflows.',
    category: 'ai',
    tags: ['data-pipeline', 'ml-ops', 'etl'],
    difficulty: 'advanced'
  },

  // Security
  {
    id: 'security-1',
    title: 'Authentication & Authorization',
    description: 'Implement secure user authentication',
    prompt: 'Design a secure authentication system with JWT tokens, refresh tokens, and role-based access control. Include best practices for password hashing and session management.',
    category: 'security',
    tags: ['auth', 'jwt', 'security'],
    difficulty: 'advanced'
  },
  {
    id: 'security-2',
    title: 'API Security Audit',
    description: 'Review API security vulnerabilities',
    prompt: 'Audit my REST API for security vulnerabilities. Check for SQL injection, XSS, CSRF, and other common attack vectors. Suggest mitigation strategies.',
    category: 'security',
    tags: ['security-audit', 'vulnerabilities', 'api'],
    difficulty: 'advanced',
    popular: true
  },
  {
    id: 'security-3',
    title: 'Data Encryption Implementation',
    description: 'Secure sensitive data with encryption',
    prompt: 'Implement encryption for sensitive user data in my application. Include field-level encryption for PII and secure key management practices.',
    category: 'security',
    tags: ['encryption', 'data-protection', 'privacy'],
    difficulty: 'intermediate'
  }
];

const categories = [
  { id: 'all', label: 'All Prompts', icon: Lightbulb },
  { id: 'architecture', label: 'Architecture', icon: Settings },
  { id: 'generation', label: 'Code Generation', icon: Code },
  { id: 'testing', label: 'Testing', icon: TestTube },
  { id: 'debugging', label: 'Debugging', icon: Bug },
  { id: 'ai', label: 'AI & ML', icon: Brain },
  { id: 'security', label: 'Security', icon: Shield }
];

export function PromptLibrary({ onPromptSelect, className = "" }: PromptLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || prompt.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const popularPrompts = prompts.filter(p => p.popular);

  const handlePromptSelect = (prompt: Prompt) => {
    onPromptSelect?.(prompt.prompt);
    toast({
      title: "Prompt selected",
      description: `"${prompt.title}" has been loaded`,
    });
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to clipboard",
      description: "Prompt has been copied to your clipboard",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-muted';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Prompt Library
          </CardTitle>
          <CardDescription>
            Explore curated prompts to accelerate your AI-assisted development workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Popular Prompts */}
          {searchTerm === "" && selectedCategory === "all" && selectedDifficulty === "all" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <h3 className="font-medium">Popular Prompts</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {popularPrompts.slice(0, 3).map((prompt) => (
                  <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-shadow border-border/50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">{prompt.title}</h4>
                          <Badge className={getDifficultyColor(prompt.difficulty)}>
                            {prompt.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {prompt.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {prompt.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handlePromptSelect(prompt)}
                            className="h-6 text-xs"
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full h-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-1 text-xs p-2"
                >
                  <category.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pr-4">
                    {filteredPrompts.length === 0 ? (
                      <Card className="border-border/50">
                        <CardContent className="p-8 text-center">
                          <p className="text-muted-foreground">No prompts found matching your criteria.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredPrompts.map((prompt) => (
                        <Card key={prompt.id} className="border-border/50 hover:shadow-md transition-all duration-200">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{prompt.title}</h3>
                                    {prompt.popular && (
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    )}
                                    <Badge className={getDifficultyColor(prompt.difficulty)}>
                                      {prompt.difficulty}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {prompt.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {prompt.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm leading-relaxed">
                                  {prompt.prompt}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handlePromptSelect(prompt)}
                                  className="flex-1"
                                >
                                  <Zap className="h-4 w-4 mr-2" />
                                  Use This Prompt
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => copyPrompt(prompt.prompt)}
                                  size="icon"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}