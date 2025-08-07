"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BlogForm } from "@/components/blog-form";
import { SummaryDisplay } from "@/components/summary-display";
import { generateSummary, translateToUrdu } from "@/lib/translate";
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Hero } from "@/components/hero";

interface Summary {
  id?: string;
  originalUrl: string;
  englishSummary: string;
  urduSummary: string;
  createdAt?: string;
  title?: string;
  fullContent: string;
  isSaved?: boolean;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update your handleSubmit function with better error handling
  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setSuccessMessage(null);

    try {
      setSuccessMessage("Scraping content from the webpage...");
      const scrapeResponse = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      
      if (!scrapeResponse.ok) {
        const errorData = await scrapeResponse.json();
        throw new Error(errorData.details || 'Failed to scrape content');
      }

      const data = await scrapeResponse.json();
      
      if (!data.content) {
        throw new Error('No content found on the webpage');
      }

      // Step 1: Scrape content
      setSuccessMessage("Scraping content from the webpage...");
      const scrapedContent = data;
      
      // Check content quality
      if (scrapedContent.quality && scrapedContent.quality.score < 50) {
        setSuccessMessage(`Content scraped (Quality: ${scrapedContent.quality.score}%). Generating summary...`);
      } else {
        setSuccessMessage("High-quality content found! Generating AI summary...");
      }
      
      // Step 2: Generate AI summary
      const englishSummary = generateSummary(scrapedContent.content);
      
      if (englishSummary.length < 50) {
        throw new Error("Unable to generate a meaningful summary from this content. Please try a different article.");
      }
      
      setSuccessMessage("Summary generated! Translating to Urdu...");
      
      // Step 3: Translate to Urdu using new async API
      const urduSummary = await translateToUrdu(englishSummary);
      
      // Step 4: Create summary object
      const newSummary: Summary = {
        originalUrl: url,
        englishSummary: englishSummary,
        urduSummary: urduSummary,
        title: scrapedContent.title,
        fullContent: scrapedContent.content,
        isSaved: false
      };
      
      setSummary(newSummary);
      setSuccessMessage("Summary completed successfully! Click 'Save Summary' to store it in the database.");
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process URL');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (summaryToSave: Summary) => {
    const toastId = toast.loading("Saving summary...", {
      description: "Storing data in Supabase and MongoDB.",
    });

    try {
      // Save to Supabase
      const supabase = createClient();
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('summaries')
        .insert({
          original_url: summaryToSave.originalUrl,
          title: summaryToSave.title,
          english_summary: summaryToSave.englishSummary,
          urdu_summary: summaryToSave.urduSummary,
          full_content: summaryToSave.fullContent
        })
        .select()
        .single();

      if (supabaseError) throw new Error(`Supabase error: ${supabaseError.message}`);

      // Save to MongoDB
      const mongoResponse = await fetch('/api/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: summaryToSave.originalUrl,
          content: summaryToSave.fullContent,
        }),
      });

      if (!mongoResponse.ok) {
        const errorData = await mongoResponse.json();
        throw new Error(`MongoDB error: ${errorData.error || 'Failed to save content'}`);
      }
      
      toast.success("Summary saved successfully!", {
        id: toastId,
        description: "Your summary is now stored in our databases.",
      });

      // Update the summary state to reflect the saved state
      setSummary(prev => prev ? { ...prev, isSaved: true, id: supabaseData.id } : null);

    } catch (error) {
      console.error('Error saving data:', error);
      toast.error("Failed to save summary.", {
        id: toastId,
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
      // Re-throw the error to be caught by the calling component if needed
      throw error;
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Enhanced Hero Section */}
      <Hero />
      
      <div className="container mx-auto max-w-7xl p-6 space-y-12 relative z-10">
        
        {/* Enhanced Form Section */}
        <div id="summarize-form" className="pt-12">
          <div className="glass-card max-w-4xl mx-auto p-8 smooth-transition card-hover">
            <BlogForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
        
        {/* Enhanced Success Message with Animation */}
        {successMessage && !summary && (
          <div className="max-w-4xl mx-auto">
            <div className="glass-card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/50 rounded-2xl p-6 success-bounce">
              <div className="flex items-center gap-4">
                <div className="pulse-ring w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-green-800 dark:text-green-200 font-semibold text-lg">{successMessage}</p>
                  <div className="mt-2 w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto">
            <div className="glass-card bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-6 smooth-transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-red-800 dark:text-red-200 font-semibold text-lg">{error}</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">Please try again with a different URL or check your internet connection.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Summary Display */}
        {summary && (
          <div className="max-w-6xl mx-auto">
            <div className="glass-card p-8 card-hover">
              <SummaryDisplay summary={summary} onSave={handleSave} />
            </div>
          </div>
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Processing Your Request</h3>
              <p className="text-muted-foreground">
                {successMessage || "Analyzing and summarizing content..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}