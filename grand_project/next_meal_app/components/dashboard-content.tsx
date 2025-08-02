"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardTabs } from "./dashboard-tabs";
import { UsernameSetupModal } from "./username-setup-modal";
import { ClientAuthButton } from "./client-auth-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push("/auth/login");
          return;
        }

        setUser(user);

        // Check if user needs to complete profile setup
        const hasUsername = user.user_metadata?.username || user.user_metadata?.profile_completed;
        
        if (!hasUsername) {
          setShowUsernameModal(true);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, [supabase.auth, router]);

  const handleProfileComplete = () => {
    setShowUsernameModal(false);
    // Refresh user data
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30 dark:from-blue-950/10 dark:via-gray-900 dark:to-indigo-950/10">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-gradient-to-r from-blue-50/50 via-transparent to-blue-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-blue-950/20 backdrop-blur-sm">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/" className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">NextMeal 🍲</Link>
            </div>
            <ClientAuthButton />
          </div>
        </nav>
        
        <main className="flex-1 w-full max-w-5xl mx-auto p-6">
          <DashboardTabs />
        </main>
      </div>

      <UsernameSetupModal
        isOpen={showUsernameModal}
        onComplete={handleProfileComplete}
        userEmail={user.email || ""}
        user={user}
      />
    </>
  );
}
