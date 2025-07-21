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
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
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

  const importDocuments = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate JSON structure
      if (!Array.isArray(data) && !data.documents) {
        throw new Error('Invalid JSON format. Expected array of documents or object with documents property.');
      }

      const documentsToImport = Array.isArray(data) ? data : data.documents;
      let importedCount = 0;

      for (const doc of documentsToImport) {
        try {
          // Validate required fields
          if (!doc.title || !doc.content) {
            console.warn('Skipping document with missing title or content:', doc);
            continue;
          }

          const { data: insertedDoc, error } = await supabase
            .from('knowledge_documents')
            .insert({
              title: doc.title,
              content: doc.content,
              document_type: doc.document_type || 'guide',
              category: doc.category || 'general',
              tags: Array.isArray(doc.tags) ? doc.tags : doc.tags?.split(',').map((t: string) => t.trim()) || [],
              difficulty_level: doc.difficulty_level || 'intermediate',
              confidence_score: doc.confidence_score || 1.0,
              author: doc.author || null,
              source_url: doc.source_url || null
            })
            .select()
            .single();

          if (error) {
            console.error('Error inserting document:', error);
            continue;
          }

          // Generate embedding for the imported document
          await supabase.functions.invoke('generate-embeddings', {
            body: {
              text: doc.content,
              documentId: insertedDoc.id
            }
          });

          importedCount++;
        } catch (docError) {
          console.error('Error processing document:', doc.title, docError);
        }
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${importedCount} documents from ${documentsToImport.length} total.`
      });

      loadDocuments();
    } catch (error) {
      console.error('Error importing documents:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import documents. Please check the file format.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const exportKnowledgeBase = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const exportData = {
        export_info: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          total_documents: data.length,
          exported_by: 'AI Analysis Platform'
        },
        documents: data.map(doc => ({
          title: doc.title,
          content: doc.content,
          document_type: doc.document_type,
          category: doc.category,
          tags: doc.tags,
          difficulty_level: doc.difficulty_level,
          confidence_score: doc.confidence_score,
          author: doc.author,
          source_url: doc.source_url,
          created_at: doc.created_at
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-base-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${data.length} documents to JSON file.`
      });
    } catch (error) {
      console.error('Error exporting knowledge base:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export knowledge base",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
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
              <CardDescription>
                Manage your knowledge base with import and export functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Import Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    Import Documents
                  </h3>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center space-y-4">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Upload JSON file</p>
                      <p className="text-xs text-muted-foreground">
                        Select a JSON file containing knowledge documents
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importDocuments}
                      className="hidden"
                      id="import-file"
                      disabled={isImporting}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('import-file')?.click()}
                      disabled={isImporting}
                      className="flex items-center gap-2"
                    >
                      {isImporting ? (
                        <Brain className="h-4 w-4 animate-pulse" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {isImporting ? 'Importing...' : 'Choose File'}
                    </Button>
                  </div>
                </div>

                {/* Export Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    Export Knowledge Base
                  </h3>
                  <div className="border border-muted-foreground/25 rounded-lg p-6 text-center space-y-4">
                    <Download className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Download as JSON</p>
                      <p className="text-xs text-muted-foreground">
                        Export all {documents.length} documents
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={exportKnowledgeBase}
                      disabled={isExporting || documents.length === 0}
                      className="flex items-center gap-2"
                    >
                      {isExporting ? (
                        <Brain className="h-4 w-4 animate-pulse" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {isExporting ? 'Exporting...' : 'Export All'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold">Import/Export Format</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• <strong>Import:</strong> Upload JSON files with knowledge documents</p>
                  <p>• <strong>Export:</strong> Download your entire knowledge base as JSON</p>
                  <p>• <strong>Embeddings:</strong> Automatically generated for imported documents</p>
                  <p>• <strong>Format:</strong> Supports both document arrays and structured objects</p>
                </div>
              </div>

              {/* Sample Format */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Expected JSON Format:</h4>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`{
  "documents": [
    {
      "title": "Document Title",
      "content": "Document content...",
      "document_type": "pattern|best_practice|case_study|guide",
      "category": "general|neural_networks|distributed_systems|...",
      "tags": ["tag1", "tag2"],
      "difficulty_level": "beginner|intermediate|advanced",
      "author": "Author Name (optional)",
      "source_url": "https://example.com (optional)"
    }
  ]
}`}
                </pre>
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