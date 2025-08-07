"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
    "https://nextjs.org/blog/next-14-2",
    "https://react.dev/blog/2024/02/15/react-labs-what-we-have-been-working-on-february-2024",
    "https://tailwindcss.com/blog/tailwindcss-v3-4"
  ];

  const fillExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/30">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            AI-Powered Blog Summarizer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform any article into concise summaries in both English and Urdu. 
            Just paste a URL and let our AI do the magic! ✨
          </p>
        </div>
      </div>

      {/* Enhanced Form Card */}
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl"></div>
        
        <CardContent className="relative p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* URL Input Section */}
            <div className="space-y-4">
              <Label htmlFor="url" className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Article URL
              </Label>
              <div className="relative">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/amazing-article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={isLoading}
                  className="input-modern h-14 text-lg pl-6 pr-6 border-2 border-primary/20 hover:border-primary/40 focus:border-primary transition-all duration-300"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <Button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="w-full h-14 text-lg font-semibold btn-gradient hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processing Magic...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6" />
                  <span>Summarize Article</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Enhanced Example URLs */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Try These Examples
        </h3>
        <div className="grid gap-3">
          {exampleUrls.map((exampleUrl, index) => (
            <button
              key={index}
              onClick={() => fillExample(exampleUrl)}
              disabled={isLoading}
              className="group text-left p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/10 hover:to-secondary/10 border border-border/50 hover:border-primary/30 transition-all duration-300 smooth-transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground truncate">
                  {exampleUrl}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
