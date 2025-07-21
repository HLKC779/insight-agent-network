import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Brain, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  Download,
  Upload,
  RefreshCw,
  Save
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SystemSettings {
  general: {
    autoAnalysis: boolean;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
    maxConcurrentTasks: number;
    cacheResults: boolean;
  };
  agents: {
    enabledAgents: string[];
    agentTimeout: number;
    retryAttempts: number;
    loadBalancing: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    animations: boolean;
    compactView: boolean;
    showConfidence: boolean;
  };
  notifications: {
    taskCompletion: boolean;
    systemAlerts: boolean;
    performanceWarnings: boolean;
    emailNotifications: boolean;
  };
  security: {
    dataEncryption: boolean;
    auditLogging: boolean;
    sessionTimeout: number;
    requireAuth: boolean;
  };
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      autoAnalysis: true,
      analysisDepth: 'detailed',
      maxConcurrentTasks: 5,
      cacheResults: true
    },
    agents: {
      enabledAgents: ['analyzer-001', 'generator-001', 'tester-001'],
      agentTimeout: 30,
      retryAttempts: 3,
      loadBalancing: true
    },
    ui: {
      theme: 'system',
      animations: true,
      compactView: false,
      showConfidence: true
    },
    notifications: {
      taskCompletion: true,
      systemAlerts: true,
      performanceWarnings: true,
      emailNotifications: false
    },
    security: {
      dataEncryption: true,
      auditLogging: true,
      sessionTimeout: 60,
      requireAuth: false
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Simulate saving settings
    setTimeout(() => {
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 1000);
  };

  const resetToDefaults = () => {
    setSettings({
      general: {
        autoAnalysis: true,
        analysisDepth: 'detailed',
        maxConcurrentTasks: 5,
        cacheResults: true
      },
      agents: {
        enabledAgents: ['analyzer-001', 'generator-001', 'tester-001'],
        agentTimeout: 30,
        retryAttempts: 3,
        loadBalancing: true
      },
      ui: {
        theme: 'system',
        animations: true,
        compactView: false,
        showConfidence: true
      },
      notifications: {
        taskCompletion: true,
        systemAlerts: true,
        performanceWarnings: true,
        emailNotifications: false
      },
      security: {
        dataEncryption: true,
        auditLogging: true,
        sessionTimeout: 60,
        requireAuth: false
      }
    });
    setHasChanges(true);
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-platform-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">System Settings</CardTitle>
                <CardDescription>
                  Configure your AI platform preferences and system behavior
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Unsaved Changes
                </Badge>
              )}
              <Button onClick={saveSettings} disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="ui">Interface</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Analysis Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Analysis</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically analyze system descriptions on input
                  </div>
                </div>
                <Switch
                  checked={settings.general.autoAnalysis}
                  onCheckedChange={(checked) => updateSetting('general', 'autoAnalysis', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Analysis Depth</Label>
                <Select
                  value={settings.general.analysisDepth}
                  onValueChange={(value) => updateSetting('general', 'analysisDepth', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Quick overview</SelectItem>
                    <SelectItem value="detailed">Detailed - Comprehensive analysis</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive - Deep dive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Concurrent Tasks: {settings.general.maxConcurrentTasks}</Label>
                <Slider
                  value={[settings.general.maxConcurrentTasks]}
                  onValueChange={(value) => updateSetting('general', 'maxConcurrentTasks', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cache Results</Label>
                  <div className="text-sm text-muted-foreground">
                    Store analysis results for faster subsequent access
                  </div>
                </div>
                <Switch
                  checked={settings.general.cacheResults}
                  onCheckedChange={(checked) => updateSetting('general', 'cacheResults', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Agent Timeout (seconds): {settings.agents.agentTimeout}</Label>
                <Slider
                  value={[settings.agents.agentTimeout]}
                  onValueChange={(value) => updateSetting('agents', 'agentTimeout', value[0])}
                  max={120}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Retry Attempts: {settings.agents.retryAttempts}</Label>
                <Slider
                  value={[settings.agents.retryAttempts]}
                  onValueChange={(value) => updateSetting('agents', 'retryAttempts', value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Load Balancing</Label>
                  <div className="text-sm text-muted-foreground">
                    Distribute tasks evenly across available agents
                  </div>
                </div>
                <Switch
                  checked={settings.agents.loadBalancing}
                  onCheckedChange={(checked) => updateSetting('agents', 'loadBalancing', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Interface Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={settings.ui.theme}
                  onValueChange={(value) => updateSetting('ui', 'theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable smooth transitions and animations
                  </div>
                </div>
                <Switch
                  checked={settings.ui.animations}
                  onCheckedChange={(checked) => updateSetting('ui', 'animations', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <div className="text-sm text-muted-foreground">
                    Show more information in less space
                  </div>
                </div>
                <Switch
                  checked={settings.ui.compactView}
                  onCheckedChange={(checked) => updateSetting('ui', 'compactView', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Confidence Scores</Label>
                  <div className="text-sm text-muted-foreground">
                    Display confidence percentages in analysis results
                  </div>
                </div>
                <Switch
                  checked={settings.ui.showConfidence}
                  onCheckedChange={(checked) => updateSetting('ui', 'showConfidence', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Completion</Label>
                  <div className="text-sm text-muted-foreground">
                    Notify when analysis tasks complete
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.taskCompletion}
                  onCheckedChange={(checked) => updateSetting('notifications', 'taskCompletion', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <div className="text-sm text-muted-foreground">
                    Important system status updates
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Performance Warnings</Label>
                  <div className="text-sm text-muted-foreground">
                    Alerts for performance issues
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.performanceWarnings}
                  onCheckedChange={(checked) => updateSetting('notifications', 'performanceWarnings', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Encryption</Label>
                  <div className="text-sm text-muted-foreground">
                    Encrypt sensitive data at rest and in transit
                  </div>
                </div>
                <Switch
                  checked={settings.security.dataEncryption}
                  onCheckedChange={(checked) => updateSetting('security', 'dataEncryption', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <div className="text-sm text-muted-foreground">
                    Log all system activities for security monitoring
                  </div>
                </div>
                <Switch
                  checked={settings.security.auditLogging}
                  onCheckedChange={(checked) => updateSetting('security', 'auditLogging', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes): {settings.security.sessionTimeout}</Label>
                <Slider
                  value={[settings.security.sessionTimeout]}
                  onValueChange={(value) => updateSetting('security', 'sessionTimeout', value[0])}
                  max={240}
                  min={15}
                  step={15}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Settings Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}