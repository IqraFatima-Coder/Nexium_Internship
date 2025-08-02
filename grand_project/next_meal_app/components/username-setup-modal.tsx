"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User } from "@supabase/supabase-js";

interface UsernameSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userEmail: string;
  user?: User; // Use proper User type
}

export function UsernameSetupModal({ isOpen, onComplete, userEmail, user }: UsernameSetupModalProps) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Pre-fill data from Google OAuth if available
  useEffect(() => {
    if (user && isOpen && !username && !fullName) {
      const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
      const googleUsername = user.user_metadata?.preferred_username || 
                           user.user_metadata?.email?.split('@')[0] || '';
      
      if (googleName) {
        setFullName(googleName);
      }
      if (googleUsername) {
        // Clean up username to be URL-safe
        const cleanUsername = googleUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(cleanUsername);
      }
    }
  }, [user, isOpen, username, fullName]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username: username.trim(),
          full_name: fullName.trim() || username.trim(),
          profile_completed: true,
        }
      });

      if (updateError) throw updateError;

      // Create user profile in database if needed
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.trim(),
          full_name: fullName.trim() || username.trim(),
          email: userEmail,
          updated_at: new Date().toISOString(),
        });

      // Don't throw error if profiles table doesn't exist yet
      if (profileError && !profileError.message.includes('relation "profiles" does not exist')) {
        console.warn('Profile table error:', profileError);
      }

      onComplete();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <span className="text-4xl">👨‍🍳</span>
          </div>
          <CardTitle className="text-xl">Welcome to NextMeal!</CardTitle>
          <CardDescription>
            Let&apos;s set up your profile to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="chef_john"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                This will be your display name on NextMeal
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (optional)</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="flex-1"
              >
                {isLoading ? "Saving..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
