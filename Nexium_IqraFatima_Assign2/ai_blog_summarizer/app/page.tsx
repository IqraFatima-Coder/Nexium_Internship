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
    <main className="min-h-screen bg-white">
      <Hero />
      <div className="container mx-auto max-w-7xl p-6 space-y-12">
        
        {/* Form */}
        <div id="summarize-form" className="pt-12">
          <BlogForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        
        {/* Success Message */}
        {successMessage && !summary && (
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
          <div className="max-w-6xl mx-auto">
            <SummaryDisplay summary={summary} onSave={handleSave} />
          </div>
        )}
      </div>
    </main>
  );
}