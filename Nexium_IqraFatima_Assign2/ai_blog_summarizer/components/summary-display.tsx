"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Globe, Languages, FileText, Save, CheckCircle } from "lucide-react";
import { useState } from "react";

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


export function SummaryDisplay({ summary, onSave}: SummaryDisplayProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (onSave && !summary.isSaved) {
      setSaving(true);
      try {
        await onSave(summary);
      } catch (error) {
        console.error('Save failed:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  // ...rest of the component remains the same...
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Globe className="h-6 w-6 text-blue-600" />
                {summary.title || "Blog Summary"}
              </CardTitle>
              <p className="text-sm text-muted-foreground break-all bg-white/50 dark:bg-black/20 p-2 rounded">
                <strong>Source:</strong> {summary.originalUrl}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {summary.createdAt && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(summary.createdAt).toLocaleDateString()}
                </Badge>
              )}
              {!summary.isSaved && onSave && (
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
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
              )}
              {summary.isSaved && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Original Content Card */}
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <FileText className="h-5 w-5 text-gray-600" />
            Original Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {summary.fullContent}
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Summaries Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* English Summary */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Languages className="h-5 w-5 text-blue-600" />
              English Summary
              <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                AI Generated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {summary.englishSummary}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Urdu Summary */}
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-background">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Languages className="h-5 w-5 text-emerald-600" />
              اردو خلاصہ (Urdu Summary)
              <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                Translated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 text-right" dir="rtl">
                {summary.urduSummary}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {summary.fullContent.split(' ').length}
              </p>
              <p className="text-xs text-muted-foreground">Original Words</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.englishSummary.split(' ').length}
              </p>
              <p className="text-xs text-muted-foreground">Summary Words</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((summary.englishSummary.split(' ').length / summary.fullContent.split(' ').length) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Compression</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {summary.urduSummary.split(' ').length}
              </p>
              <p className="text-xs text-muted-foreground">Urdu Words</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}