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
    "https://blog.vercel.com/posts/react-19",
    "https://nextjs.org/blog/next-14-2",
    "https://www.builder.io/blog/structured-data-for-ai"
  ];

  const fillExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="relative overflow-hidden border-2 border-primary/10 shadow-lg">
        <CardHeader className="relative space-y-4 text-center">
          <div className="inline-block mx-auto p-3 bg-primary/10 rounded-full">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Summarize Any Article
          </CardTitle>
          <CardDescription className="text-lg">
            Just paste the URL of a blog post or news article below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url-input" className="sr-only">
                Blog URL
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/blog/my-awesome-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="pl-10 h-12 text-base"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Generate Summary
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <div className="flex flex-col items-start gap-4 p-4 border-t border-primary/10">
          <p className="text-sm text-muted-foreground font-medium">
            Or try one of these examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleUrls.map((exampleUrl) => (
              <Button
                key={exampleUrl}
                variant="outline"
                size="sm"
                onClick={() => fillExample(exampleUrl)}
                disabled={isLoading}
                className="text-xs"
              >
                {new URL(exampleUrl).pathname.slice(1, 30)}...
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}