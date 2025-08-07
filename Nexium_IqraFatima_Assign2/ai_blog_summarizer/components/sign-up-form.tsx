"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const router = useRouter();

  // Debounced email check function
  const checkEmailExists = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) return;
    
    setIsCheckingEmail(true);
    setEmailWarning(null);
    
    try {
      const response = await fetch('/api/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToCheck }),
      });
      
      const data = await response.json();
      
      if (data.exists) {
        setEmailWarning(`An account with this email already exists. You can log in instead.`);
      } else {
        setEmailWarning(null);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // Don't show error to user for email checking
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  // Debounce email checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email) {
        checkEmailExists(email);
      } else {
        setEmailWarning(null);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [email, checkEmailExists]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Check if email already exists warning is showing
    if (emailWarning) {
      setError(`An account with email "${email}" already exists. Please try logging in instead.`);
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        // Handle specific error cases for better user experience
        if (error.message.includes('User already registered')) {
          setError(`An account with email "${email}" already exists. Please try logging in instead.`);
        } else if (error.message.includes('already been registered')) {
          setError(`This email is already registered. Please try logging in or use a different email.`);
        } else if (error.message.includes('weak password')) {
          setError('Password is too weak. Please use at least 6 characters with a mix of letters and numbers.');
        } else if (error.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }
      
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      
      // Additional error handling for common cases
      if (errorMessage.includes('User already registered') || errorMessage.includes('already been registered')) {
        setError(`An account with email "${email}" already exists. Please try logging in instead.`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={emailWarning ? "border-amber-400 focus:border-amber-500" : ""}
                  />
                  {isCheckingEmail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
                {emailWarning && (
                  <div className="p-2 rounded-md bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                    <p className="text-sm text-amber-600 dark:text-amber-400">{emailWarning}</p>
                    <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                      <Link href="/auth/login" className="underline underline-offset-4 hover:text-amber-700 dark:hover:text-amber-300">
                        Click here to login instead
                      </Link>
                    </p>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  {(error.includes('already exists') || error.includes('already registered')) && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                      <Link href="/auth/login" className="underline underline-offset-4 hover:text-red-700 dark:hover:text-red-300">
                        Click here to login instead
                      </Link>
                    </p>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading || !!emailWarning}>
                {isLoading ? "Creating an account..." : emailWarning ? "Email already exists" : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
