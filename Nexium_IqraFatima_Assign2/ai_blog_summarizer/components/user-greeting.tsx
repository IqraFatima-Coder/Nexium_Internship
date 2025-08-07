"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookMarked, History, User, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function UserGreeting() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [recentStats, setRecentStats] = useState({ saved: 0, total: 0 });
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          setUser(user);
          await fetchQuickStats(user.id);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };

    getUser();
  }, [supabase.auth]);

  const fetchQuickStats = async (userId: string) => {
    try {
      const [totalResponse, savedResponse] = await Promise.all([
        fetch(`/api/user-content?limit=1&userId=${userId}`),
        fetch(`/api/user-content?limit=1&savedOnly=true&userId=${userId}`)
      ]);

      if (totalResponse.ok && savedResponse.ok) {
        const [totalData, savedData] = await Promise.all([
          totalResponse.json(),
          savedResponse.json()
        ]);
        
        setRecentStats({
          total: totalData.pagination?.total || 0,
          saved: savedData.pagination?.total || 0
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (!user || !isVisible) return null;

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Welcome back, {displayName}! 👋
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You have {recentStats.total} summaries with {recentStats.saved} saved items
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/saved" className="flex items-center space-x-2">
                <BookMarked className="h-4 w-4" />
                <span>Saved</span>
                {recentStats.saved > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {recentStats.saved}
                  </Badge>
                )}
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/history" className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>History</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
