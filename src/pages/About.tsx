import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Code, Heart } from "lucide-react";

const About = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">AI Analysis Platform</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced artificial intelligence platform for comprehensive system analysis and reasoning
          </p>
        </div>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              About This Platform
            </CardTitle>
            <CardDescription>
              Learn more about our AI-powered analysis capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This platform leverages cutting-edge artificial intelligence technologies to provide 
              comprehensive system analysis, knowledge management, and reasoning capabilities. 
              Built with modern web technologies and designed for scalability and performance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">Advanced reasoning and analysis</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Secure</h3>
                <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">User-Focused</h3>
                <p className="text-sm text-muted-foreground">Designed for optimal experience</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>
              Built with modern, reliable technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="secondary">Supabase</Badge>
              <Badge variant="secondary">Vite</Badge>
              <Badge variant="secondary">Radix UI</Badge>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Legal Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legal Information
            </CardTitle>
            <CardDescription>
              Copyright and legal notices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Copyright Notice */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Copyright Notice</h3>
              <p className="text-muted-foreground">
                © {currentYear} Cuong Lam Kim Huynh. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                This software and its documentation are protected by copyright law and international treaties. 
                Unauthorized reproduction or distribution of this software, or any portion of it, may result in 
                severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law.
              </p>
            </div>

            <Separator />

            {/* Terms of Use */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Terms of Use</h3>
              <p className="text-sm text-muted-foreground">
                By using this platform, you agree to use it responsibly and in accordance with all applicable laws 
                and regulations. The platform is provided "as is" without warranties of any kind.
              </p>
            </div>

            <Separator />

            {/* Privacy */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Privacy</h3>
              <p className="text-sm text-muted-foreground">
                We are committed to protecting your privacy. Any data processed through this platform is handled 
                in accordance with industry best practices for data security and privacy.
              </p>
            </div>

            <Separator />

            {/* Contact */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                For questions regarding copyright, licensing, or legal matters related to this platform, 
                please contact the copyright holder: Cuong Lam Kim Huynh.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground">
            AI Analysis Platform • © {currentYear} Cuong Lam Kim Huynh • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;