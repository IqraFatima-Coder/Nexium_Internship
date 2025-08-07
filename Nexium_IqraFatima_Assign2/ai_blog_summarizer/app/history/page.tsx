"use client";

import { ContentHistory } from "@/components/content-history";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { History, Clock, Calendar, Activity } from "lucide-react";

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <History className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Content History</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  View all your blog summaries and content activity
                </p>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">--</p>
                      <p className="text-sm text-muted-foreground">Total Summaries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">--</p>
                      <p className="text-sm text-muted-foreground">Recent Activity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">--</p>
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content History Component */}
          <ContentHistory defaultSavedOnly={false} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
