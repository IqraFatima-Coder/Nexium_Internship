"use client";

import { useState, useEffect } from "react";
import { BlogForm } from "@/components/blog-form";
import { SummaryDisplay } from "@/components/summary-display";
import { scrapeWebContent } from "@/lib/scraper";
import { generateSummary, translateToUrdu } from "@/lib/translate";
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

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
  const [dbConnected, setDbConnected] = useState(false);

  // This will be useful for database setup verification
  useEffect(() => {
    async function verifyDatabaseConnection() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('summaries')
          .select('count')
          .single();

        if (error) {
          console.error('Database connection failed:', error.message);
          setError('Database connection failed. Please check your configuration.');
          setDbConnected(false);
          return;
        }

        setDbConnected(true);
        console.log('Database connected successfully');
      } catch (err) {
        setError('Failed to initialize database connection');
        setDbConnected(false);
      }
    }

    verifyDatabaseConnection();
  }, []);

  const handleSubmit = async (url: string) => {
    if (!dbConnected) {
      setError('Database connection not established. Please wait...');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setSummary(null);
    
    try {
      // Step 1: Scrape content
      setSuccessMessage("Scraping content from the webpage...");
      const scrapedContent = await scrapeWebContent(url);
      
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
      
      // Step 3: Translate to Urdu
      const urduSummary = translateToUrdu(englishSummary);
      
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
      
    } catch (err) {
      console.error('Error processing blog:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Provide helpful suggestions based on error type
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setError(`Network error: ${errorMessage}. Please check your internet connection and try again.`);
      } else if (errorMessage.includes('content') || errorMessage.includes('scrape')) {
        setError(`Content error: ${errorMessage}. Try a different blog post or news article.`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create Supabase client instance when needed
  const handleSave = async (summaryToSave: Summary) => {
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

      if (supabaseError) throw supabaseError;

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
        throw new Error('Failed to save to MongoDB');
      }

      return supabaseData;
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl p-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            AI Blog Summarizer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform lengthy blog posts into concise, intelligent summaries in both English and Urdu using advanced AI technology
          </p>
        </div>
        
        {/* Form */}
        <BlogForm onSubmit={handleSubmit} isLoading={isLoading} />
        
        {/* Success Message */}
        {successMessage && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Summary Display */}
        {summary && (
          <SummaryDisplay 
            summary={summary} 
            onSave={handleSave}
          />
        )}
        
        {/* Footer */}
        <div className="text-center pt-12 pb-6">
          <p className="text-sm text-muted-foreground">
            Powered by Next.js, Supabase, and ShadCN UI
          </p>
        </div>
      </div>
    </main>
  );
}