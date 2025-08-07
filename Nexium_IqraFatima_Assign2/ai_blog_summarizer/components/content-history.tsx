"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BookMarked, 
  Calendar, 
  ExternalLink, 
  Loader2,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Languages
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface SavedContent {
  _id: string;
  url: string;
  title?: string;
  summary?: string;
  englishSummary?: string;
  urduSummary?: string;
  content?: string;
  fullContent?: string;
  createdAt: string;
  isSaved: boolean;
  tags?: string[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ContentHistoryProps {
  defaultSavedOnly?: boolean;
}

// Individual Content Card Component
function ContentCard({ content }: { content: SavedContent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const englishSummary = content.englishSummary || content.summary;
  const urduSummary = content.urduSummary;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                  {content.title || 'Untitled'}
                </h3>
                {content.isSaved && (
                  <Badge variant="secondary">
                    <BookMarked className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(content.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  <span className="truncate max-w-xs">{content.url}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expand
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(content.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Original
              </Button>
            </div>
          </div>

          {/* Summary Preview */}
          {!isExpanded && englishSummary && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                {englishSummary.substring(0, 200)}...
              </p>
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-4 border-t pt-4">
              {/* English Summary */}
              {englishSummary && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      English Summary
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(englishSummary)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {englishSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Urdu Summary */}
              {urduSummary && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Languages className="h-4 w-4 text-purple-500" />
                      Urdu Summary
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(urduSummary)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4" dir="rtl">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-right">
                      {urduSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {content.tags && content.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {content.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ContentHistory({ defaultSavedOnly = false }: ContentHistoryProps) {
  const [contents, setContents] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [search, setSearch] = useState("");
  const [savedOnly, setSavedOnly] = useState(defaultSavedOnly);
  const [page, setPage] = useState(1);
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClient();

  // Check authentication and listen for auth changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          setError("Please log in to view your content history");
          setUser(null);
        } else {
          setUser(user);
          setError(null);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Authentication error");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setError("Please log in to view your content history");
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setError(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
          setError(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Fetch content when dependencies change
  useEffect(() => {
    const fetchContent = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          savedOnly: savedOnly.toString(),
          search: search
        });

        const response = await fetch(`/api/user-content?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }

        const data = await response.json();
        setContents(data.data || []);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchContent();
    }
  }, [user, page, savedOnly, search]);

  // Handle refresh
  const handleRefresh = () => {
    setPage(1);
    // This will trigger the useEffect to refetch
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  // Handle filter toggle
  const toggleSavedOnly = () => {
    setSavedOnly(!savedOnly);
    setPage(1); // Reset to first page on filter change
  };

  if (!user && !loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <BookMarked className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Authentication Required</h3>
              <p className="text-muted-foreground">
                Please log in to view your saved content history.
              </p>
              <Link href="/auth/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Content History</CardTitle>
              <p className="text-muted-foreground mt-2">
                Browse and manage your saved blog summaries and content
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by title, URL, or tags..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant={savedOnly ? "default" : "outline"}
              onClick={toggleSavedOnly}
              className="sm:w-auto w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              {savedOnly ? "Saved Only" : "All Content"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading your content...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content List */}
      {!loading && contents.length > 0 && (
        <div className="space-y-4">
          {contents.map((content) => (
            <ContentCard key={content._id} content={content} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && contents.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Content Found</h3>
              <p className="text-muted-foreground mb-4">
                {search || savedOnly 
                  ? "No content matches your current filters." 
                  : "Start by summarizing some blog posts to build your content history."}
              </p>
              <Link href="/">
                <Button>Summarize Your First Blog</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
