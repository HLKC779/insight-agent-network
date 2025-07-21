import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  BarChart3, 
  HelpCircle, 
  Settings, 
  Activity,
  Brain,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  activeTaskCount: number;
}

export function Navigation({ activeView, onViewChange, activeTaskCount }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      id: 'analysis',
      label: 'Analysis Platform',
      icon: Home,
      description: 'Main analysis workspace'
    },
    {
      id: 'dashboard',
      label: 'System Dashboard',
      icon: BarChart3,
      description: 'Performance monitoring'
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      icon: Brain,
      description: 'Manage architectural knowledge'
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: HelpCircle,
      description: 'Documentation and guides'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  return (
    <div className={cn(
      "h-full bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">AI Platform</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="p-4">
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed ? "justify-center" : ""
        )}>
          <Activity className="h-4 w-4 text-green-500" />
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">System Active</span>
              {activeTaskCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeTaskCount} tasks
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Navigation Items */}
      <div className="p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed ? "px-2" : "px-3",
                isActive && "bg-primary/10 text-primary"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
        {!isCollapsed && (
          <div className="text-left">
            <div className="font-medium">{item.label}</div>
            {!isCollapsed && (
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            )}
          </div>
        )}
            </Button>
          );
        })}
      </div>

      {/* Quick Stats */}
      {!isCollapsed && (
        <>
          <Separator className="mt-auto" />
          <div className="p-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              QUICK STATS
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Analyses Today</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-medium text-green-500">94%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Response</span>
                <span className="font-medium">1.2s</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}