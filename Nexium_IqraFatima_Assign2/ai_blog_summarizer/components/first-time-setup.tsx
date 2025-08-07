"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface FirstTimeSetupProps {
  user: SupabaseUser;
  onComplete: () => void;
}

export function FirstTimeSetup({ user, onComplete }: FirstTimeSetupProps) {
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Set initial display name from email
    if (user.email) {
      const emailName = user.email.split('@')[0];
      const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      setDisplayName(formattedName);
    }
  }, [user.email]);

  const handleSetupComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user metadata with display name and setup completion flag
      const { error } = await supabase.auth.updateUser({
        data: { 
          display_name: displayName,
          setup_completed: true,
          setup_date: new Date().toISOString()
        }
      });

      if (error) throw error;

      // Call the completion callback
      onComplete();
      
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error completing setup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to AI Blog Summarizer!</CardTitle>
            <p className="text-muted-foreground mt-2">
              Let&apos;s set up your profile to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetupComplete} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This is how you&apos;ll appear in the app. You can change this later in your profile.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What you can do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Summarize blog posts in English and Urdu</li>
                  <li>• Save your favorite summaries</li>
                  <li>• Access your content history anytime</li>
                  <li>• Manage your profile and preferences</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !displayName.trim()}>
                {isLoading ? (
                  "Setting up your profile..."
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Complete Setup</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
