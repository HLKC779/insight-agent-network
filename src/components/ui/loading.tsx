import React from 'react';
import { cn } from '@/lib/utils';
import { Brain, Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'brain';
  text?: string;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  text,
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderIcon = () => {
    switch (variant) {
      case 'brain':
        return (
          <Brain 
            className={cn(
              sizeClasses[size], 
              'text-primary animate-pulse'
            )} 
          />
        );
      case 'pulse':
        return (
          <div 
            className={cn(
              sizeClasses[size],
              'rounded-full bg-primary animate-pulse'
            )}
          />
        );
      default:
        return (
          <Loader2 
            className={cn(
              sizeClasses[size], 
              'animate-spin text-primary'
            )} 
          />
        );
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {renderIcon()}
      {text && (
        <span className={cn(
          'text-muted-foreground', 
          textSizeClasses[size]
        )}>
          {text}
        </span>
      )}
    </div>
  );
}

interface LoadingScreenProps {
  title?: string;
  description?: string;
}

export function LoadingScreen({ 
  title = "AI Analysis Platform", 
  description = "Initializing advanced analysis systems..."
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gradient-cognitive">
            <Brain className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cognitive bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
        
        <div className="flex justify-center">
          <Loading size="lg" variant="spinner" />
        </div>
        
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}