"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Languages,
  FileText,
  Save,
  CheckCircle,
  BookOpen,
  Timer,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

interface SummaryDisplayProps {
  summary: Summary;
  onSave?: (summary: Summary) => Promise<void>;
}

export function SummaryDisplay({ summary, onSave }: SummaryDisplayProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(summary.isSaved || false);

  const handleSave = async () => {
    if (onSave && !isSaved) {
      setIsSaving(true);
      try {
        await onSave(summary);
        setIsSaved(true);
      } catch (error) {
        console.error("Save failed:", error);
        // Optionally, show an error message to the user
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getWordCount = (text: string) => text.trim().split(/\s+/).length;
  const getReadingTime = (wordCount: number) => Math.ceil(wordCount / 200); // Avg. reading speed

  const originalWordCount = getWordCount(summary.fullContent);
  const summaryWordCount = getWordCount(summary.englishSummary);
  const reduction = Math.round(
    ((originalWordCount - summaryWordCount) / originalWordCount) * 100
  );

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl shadow-primary/10 border-2 border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-primary">
              {summary.title || "Summary Result"}
            </CardTitle>
            <a
              href={summary.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="truncate">{summary.originalUrl}</span>
            </a>
          </div>
          <div className="flex items-center gap-3 self-start md:self-end">
            {isSaved ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Saved to Database
              </Badge>
            ) : (
              onSave && (
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Summary
                    </>
                  )}
                </Button>
              )
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <Card className="p-4">
            <CardHeader className="p-0">
              <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="mt-2 text-2xl font-bold">
                {originalWordCount}
              </CardTitle>
              <CardDescription>Original Words</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4">
            <CardHeader className="p-0">
              <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <Timer className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="mt-2 text-2xl font-bold">
                ~{getReadingTime(originalWordCount)} min
                <ArrowRight className="inline mx-2 h-5 w-5" />~
                {getReadingTime(summaryWordCount)} min
              </CardTitle>
              <CardDescription>Reading Time Saved</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4">
            <CardHeader className="p-0">
              <div className="mx-auto bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="mt-2 text-2xl font-bold">
                {summaryWordCount}
              </CardTitle>
              <CardDescription>Summary Words ({reduction}% shorter)</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Separator />

        {/* Summaries Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* English Summary */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Languages className="h-5 w-5 text-blue-600" />
                English Summary
                <Badge
                  variant="secondary"
                  className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  AI Generated
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                {summary.englishSummary}
              </p>
            </CardContent>
          </Card>

          {/* Urdu Summary */}
          <Card className="border-2 border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Languages className="h-5 w-5 text-emerald-600" />
                اردو خلاصہ (Urdu Summary)
                <Badge
                  variant="secondary"
                  className="ml-auto bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  Translated
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-base leading-relaxed text-right"
                dir="rtl"
                lang="ur"
              >
                {summary.urduSummary}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Original Content Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>View Full Scraped Content</AccordionTrigger>
            <AccordionContent>
              <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border mt-2">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {summary.fullContent}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}