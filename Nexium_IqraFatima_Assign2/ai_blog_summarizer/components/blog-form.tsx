"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Globe, Zap } from "lucide-react";

interface BlogFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

export function BlogForm({ onSubmit, isLoading }: BlogFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      await onSubmit(url.trim());
    }
  };

  const exampleUrls = [
    "https://blog.vercel.com/",
    "https://nextjs.org/blog/",
    "https://openai.com/blog/"
  ];

  const fillExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="relative overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-transparent rounded-tr-full" />
        
        <CardHeader className="relative space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Blog Summarizer
              </CardTitle>
              <CardDescription className="text-base">
                Transform lengthy blog posts into concise summaries in English and Urdu
              </CardDescription>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 text-blue-500" />
              <span>Web Scraping</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-green-500" />
              <span>AI Summarization</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Urdu Translation</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blog-url" className="text-base font-medium">
                Blog URL
              </Label>
              <div className="relative">
                <Input
                  id="blog-url"
                  type="url"
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-base border-2 focus:border-primary/50 transition-colors"
                />
                <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200" 
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Blog...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Summarize Blog
                </>
              )}
            </Button>
          </form>
          
          {/* Example URLs */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleUrls.map((exampleUrl, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => fillExample(exampleUrl)}
                  disabled={isLoading}
                  className="text-xs hover:bg-primary/10 hover:border-primary/30 transition-colors"
                >
                  {exampleUrl.replace('https://', '').replace('/', '')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}