import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onFileProcessed?: (content: string, fileName: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  content?: string;
  error?: string;
}

export function FileUpload({ 
  onFileProcessed, 
  acceptedTypes = ['.txt', '.md', '.json', '.pdf', '.docx'],
  maxFileSize = 10,
  className = ""
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    
    if (fileType === 'text/plain' || fileType === 'text/markdown') {
      return await file.text();
    }
    
    if (fileType === 'application/json') {
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        return JSON.stringify(json, null, 2);
      } catch {
        return text;
      }
    }
    
    // For other file types, we'll need to implement specific parsers
    // For now, return basic info
    return `File: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n[Content extraction for ${file.type} files coming soon]`;
  };

  const handleFileUpload = async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxFileSize}MB limit`,
          variant: "destructive",
        });
        continue;
      }
      
      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.some(type => fileExtension === type || file.type.includes(type.replace('.', '')))) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        continue;
      }
      
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      };
      
      newFiles.push(uploadedFile);
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Process each file
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const uploadedFile = newFiles[i];
      
      if (!uploadedFile) continue;
      
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);
        
        // Process the file content
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'processing', progress: 90 }
            : f
        ));
        
        const content = await processFile(file);
        
        clearInterval(progressInterval);
        
        // Update file status
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'completed', progress: 100, content }
            : f
        ));
        
        // Save to database if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('documents')
            .insert({
              title: file.name,
              content,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              user_id: user.id,
            });
          
          if (error) {
            console.error('Error saving document:', error);
          }
        }
        
        // Notify parent component
        onFileProcessed?.(content, file.name);
        
        toast({
          title: "File processed",
          description: `${file.name} has been successfully processed`,
        });
        
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: 'Failed to process file' }
            : f
        ));
        
        toast({
          title: "Processing failed",
          description: `Failed to process ${file.name}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-border/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports: {acceptedTypes.join(', ')} (max {maxFileSize}MB)
          </p>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="border-primary/30 hover:bg-primary/5"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(file.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <Badge variant="outline" className="h-4 text-xs">
                        {file.status}
                      </Badge>
                    </div>
                    {file.status === 'uploading' || file.status === 'processing' ? (
                      <Progress value={file.progress} className="mt-2 h-1" />
                    ) : null}
                    {file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}