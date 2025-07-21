import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Database, 
  Upload,
  Download,
  Trash2,
  Edit,
  Save,
  X,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  document_type: string;
  category: string;
  tags: string[];
  difficulty_level: string;
  confidence_score: number;
  created_at: string;
  is_active: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
  category: string;
  tags: string[];
}

export function KnowledgeManager() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDocument, setEditingDocument] = useState<KnowledgeDocument | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Form state for new documents
  const [newDocument, setNewDocument] = useState({
    title: "",
    content: "",
    document_type: "pattern",
    category: "general",
    tags: "",
    difficulty_level: "intermediate"
  });

  const categories = [
    { value: "general", label: "General" },
    { value: "neural_networks", label: "Neural Networks" },
    { value: "distributed_systems", label: "Distributed Systems" },
    { value: "machine_learning", label: "Machine Learning" },
    { value: "memory_architecture", label: "Memory Architecture" },
    { value: "reasoning", label: "Reasoning Systems" }
  ];

  const documentTypes = [
    { value: "pattern", label: "Architecture Pattern" },
    { value: "best_practice", label: "Best Practice" },
    { value: "case_study", label: "Case Study" },
    { value: "guide", label: "Implementation Guide" }
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchKnowledge = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-search', {
        body: {
          query: searchQuery,
          similarity_threshold: 0.5,
          match_count: 10,
          search_type: 'documents'
        }
      });

      if (error) throw error;
      setSearchResults(data?.results || []);
    } catch (error) {
      console.error('Error searching knowledge:', error);
      toast({
        title: "Search Error",
        description: "Failed to search knowledge base",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDocument = async () => {
    if (!newDocument.title || !newDocument.content) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const tagsArray = newDocument.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { data, error } = await supabase
        .from('knowledge_documents')
        .insert({
          title: newDocument.title,
          content: newDocument.content,
          document_type: newDocument.document_type,
          category: newDocument.category,
          tags: tagsArray,
          difficulty_level: newDocument.difficulty_level,
          confidence_score: 1.0
        })
        .select()
        .single();

      if (error) throw error;

      // Generate embedding for the new document
      await supabase.functions.invoke('generate-embeddings', {
        body: {
          text: newDocument.content,
          documentId: data.id
        }
      });

      toast({
        title: "Success",
        description: "Knowledge document created successfully"
      });

      // Reset form
      setNewDocument({
        title: "",
        content: "",
        document_type: "pattern",
        category: "general",
        tags: "",
        difficulty_level: "intermediate"
      });

      loadDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "Failed to create knowledge document",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocument = async () => {
    if (!editingDocument) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('knowledge_documents')
        .update({
          title: editingDocument.title,
          content: editingDocument.content,
          document_type: editingDocument.document_type,
          category: editingDocument.category,
          tags: editingDocument.tags,
          difficulty_level: editingDocument.difficulty_level
        })
        .eq('id', editingDocument.id);

      if (error) throw error;

      // Regenerate embedding for updated content
      await supabase.functions.invoke('generate-embeddings', {
        body: {
          text: editingDocument.content,
          documentId: editingDocument.id
        }
      });

      toast({
        title: "Success",
        description: "Knowledge document updated successfully"
      });

      setEditingDocument(null);
      loadDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "Failed to update knowledge document",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('knowledge_documents')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Knowledge document deleted successfully"
      });

      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete knowledge document",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const seedKnowledgeBase = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-knowledge-base', {
        body: { force: false }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Knowledge base seeded: ${data.documents_processed} documents, ${data.chunks_created} chunks`
      });

      loadDocuments();
    } catch (error) {
      console.error('Error seeding knowledge base:', error);
      toast({
        title: "Error",
        description: "Failed to seed knowledge base",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Knowledge Management</CardTitle>
                <CardDescription>
                  Manage architectural patterns, best practices, and domain knowledge
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                {documents.length} Documents
              </Badge>
              <Button 
                onClick={seedKnowledgeBase}
                disabled={isSeeding}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isSeeding ? (
                  <Brain className="h-4 w-4 animate-pulse" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
                {isSeeding ? "Seeding..." : "Seed Knowledge Base"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Knowledge Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doc.content.substring(0, 150)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingDocument(doc)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{doc.document_type}</Badge>
                        <Badge variant="secondary">{doc.category}</Badge>
                        <Badge variant="outline">{doc.difficulty_level}</Badge>
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Semantic Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchKnowledge()}
                />
                <Button onClick={searchKnowledge} disabled={isLoading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <div key={result.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{result.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {result.content.substring(0, 200)}...
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {Math.round(result.similarity * 100)}% match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{result.category}</Badge>
                          {result.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Knowledge Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                    placeholder="Document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select
                    value={newDocument.document_type}
                    onValueChange={(value) => setNewDocument({...newDocument, document_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newDocument.category}
                    onValueChange={(value) => setNewDocument({...newDocument, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={newDocument.difficulty_level}
                    onValueChange={(value) => setNewDocument({...newDocument, difficulty_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={newDocument.tags}
                  onChange={(e) => setNewDocument({...newDocument, tags: e.target.value})}
                  placeholder="architecture, patterns, scalability"
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newDocument.content}
                  onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
                  placeholder="Enter the knowledge content..."
                  className="min-h-[200px]"
                />
              </div>

              <Button onClick={createDocument} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Create Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import & Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Documents
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Knowledge Base
                </Button>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>• Import: Upload JSON files with knowledge documents</p>
                <p>• Export: Download your entire knowledge base</p>
                <p>• Embeddings are automatically generated for imported documents</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Knowledge Document</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingDocument(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={editingDocument.title}
                onChange={(e) => setEditingDocument({...editingDocument, title: e.target.value})}
                placeholder="Title"
              />
              <Textarea
                value={editingDocument.content}
                onChange={(e) => setEditingDocument({...editingDocument, content: e.target.value})}
                className="min-h-[200px]"
                placeholder="Content"
              />
              <div className="flex gap-2">
                <Button onClick={updateDocument} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingDocument(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}