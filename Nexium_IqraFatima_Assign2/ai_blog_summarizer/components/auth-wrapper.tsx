"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FirstTimeSetup } from "@/components/first-time-setup";
import type { User } from "@supabase/supabase-js";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuthAndSetup = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!error && user) {
          setUser(user);
          
          // Check if user needs first-time setup
          const setupCompleted = user.user_metadata?.setup_completed;
          const hasDisplayName = user.user_metadata?.display_name;
          
          // User needs setup if they're authenticated but haven't completed setup
          if (!setupCompleted || !hasDisplayName) {
            setNeedsSetup(true);
          }
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndSetup();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Check setup status for newly signed in users
          const setupCompleted = session.user.user_metadata?.setup_completed;
          const hasDisplayName = session.user.user_metadata?.display_name;
          
          if (!setupCompleted || !hasDisplayName) {
            setNeedsSetup(true);
          } else {
            setNeedsSetup(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setNeedsSetup(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSetupComplete = () => {
    setNeedsSetup(false);
  };

  // Show loading state
  if (isLoading) {
    return children;
  }

  // Show first-time setup if needed
  if (user && needsSetup) {
    return <FirstTimeSetup user={user} onComplete={handleSetupComplete} />;
  }

  // Show normal app
  return <>{children}</>;
}
