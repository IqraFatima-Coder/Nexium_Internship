// Comprehensive verification system for Assignment 2 requirements
// This file tests MongoDB and Supabase integration according to project specs

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dbConnect from './mongodb/client';
import BlogContent from '../models/BlogContent';

interface VerificationResult {
  component: string;
  requirement: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  data?: Record<string, unknown>;
}

export class RequirementsVerifier {
  private results: VerificationResult[] = [];
  private supabase: SupabaseClient | null = null;

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  // Test MongoDB connection and full text storage
  async verifyMongoDB(): Promise<VerificationResult[]> {
    const mongoResults: VerificationResult[] = [];

    try {
      // Test 1: MongoDB Connection
      await dbConnect();
      mongoResults.push({
        component: 'MongoDB',
        requirement: 'Database Connection',
        status: 'PASS',
        details: 'Successfully connected to MongoDB'
      });

      // Test 2: Full Text Storage Capability
      const testBlogContent = {
        url: 'https://test-verification.example.com',
        content: 'This is a test full text content for verification purposes. '.repeat(100), // Large content
        title: 'Test Blog Post for Verification',
        summary: 'Test summary for verification'
      };

      // Save test data
      const savedContent = await BlogContent.create(testBlogContent);
      mongoResults.push({
        component: 'MongoDB',
        requirement: 'Full Text Storage',
        status: 'PASS',
        details: `Successfully stored full text content (${testBlogContent.content.length} characters)`,
        data: { contentLength: testBlogContent.content.length, id: savedContent._id }
      });

      // Test 3: Data Retrieval
      const retrievedContent = await BlogContent.findById(savedContent._id);
      if (retrievedContent && retrievedContent.content === testBlogContent.content) {
        mongoResults.push({
          component: 'MongoDB',
          requirement: 'Data Retrieval',
          status: 'PASS',
          details: 'Successfully retrieved complete full text content'
        });
      } else {
        mongoResults.push({
          component: 'MongoDB',
          requirement: 'Data Retrieval',
          status: 'FAIL',
          details: 'Failed to retrieve complete content or data corruption detected'
        });
      }

      // Test 4: URL Uniqueness (as per schema)
      try {
        await BlogContent.create(testBlogContent); // Should fail due to unique constraint
        mongoResults.push({
          component: 'MongoDB',
          requirement: 'URL Uniqueness',
          status: 'FAIL',
          details: 'Duplicate URL was allowed - unique constraint not working'
        });
      } catch {
        mongoResults.push({
          component: 'MongoDB',
          requirement: 'URL Uniqueness',
          status: 'PASS',
          details: 'URL uniqueness constraint working correctly'
        });
      }

      // Clean up test data
      await BlogContent.findByIdAndDelete(savedContent._id);

    } catch (error) {
      mongoResults.push({
        component: 'MongoDB',
        requirement: 'Database Connection',
        status: 'FAIL',
        details: `MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return mongoResults;
  }

  // Test Supabase connection and summary storage
  async verifySupabase(): Promise<VerificationResult[]> {
    const supabaseResults: VerificationResult[] = [];

    if (!this.supabase) {
      supabaseResults.push({
        component: 'Supabase',
        requirement: 'Configuration',
        status: 'FAIL',
        details: 'Supabase environment variables not configured'
      });
      return supabaseResults;
    }

    try {
      // Test 1: Supabase Connection
      const { error: connectionError } = await this.supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (connectionError && !connectionError.message.includes('relation "public.profiles" does not exist')) {
        supabaseResults.push({
          component: 'Supabase',
          requirement: 'Database Connection',
          status: 'FAIL',
          details: `Supabase connection failed: ${connectionError.message}`
        });
        return supabaseResults;
      }

      supabaseResults.push({
        component: 'Supabase',
        requirement: 'Database Connection',
        status: 'PASS',
        details: 'Successfully connected to Supabase'
      });

      // Test 2: Check if blog_summaries table exists (or similar)
      const { error: tableError } = await this.supabase
        .from('blog_summaries')
        .select('*')
        .limit(1);

      if (tableError && tableError.message.includes('does not exist')) {
        supabaseResults.push({
          component: 'Supabase',
          requirement: 'Summary Storage Table',
          status: 'WARNING',
          details: 'blog_summaries table does not exist. You need to create it for summary storage.'
        });
      } else if (tableError) {
        supabaseResults.push({
          component: 'Supabase',
          requirement: 'Summary Storage Table',
          status: 'FAIL',
          details: `Table access error: ${tableError.message}`
        });
      } else {
        supabaseResults.push({
          component: 'Supabase',
          requirement: 'Summary Storage Table',
          status: 'PASS',
          details: 'blog_summaries table exists and accessible'
        });

        // Test 3: Summary Storage Capability
        const testSummary = {
          url: 'https://test-verification.example.com',
          title: 'Test Blog Post for Verification',
          summary_english: 'This is a test English summary for verification purposes.',
          summary_urdu: 'یہ تصدیق کے مقاصد کے لیے ایک ٹیسٹ اردو خلاصہ ہے۔',
          created_at: new Date().toISOString()
        };

        const { data: insertData, error: insertError } = await this.supabase
          .from('blog_summaries')
          .insert([testSummary])
          .select();

        if (insertError) {
          supabaseResults.push({
            component: 'Supabase',
            requirement: 'Summary Storage',
            status: 'FAIL',
            details: `Failed to store summary: ${insertError.message}`
          });
        } else {
          supabaseResults.push({
            component: 'Supabase',
            requirement: 'Summary Storage',
            status: 'PASS',
            details: 'Successfully stored blog summary with English and Urdu text',
            data: { summaryId: insertData[0]?.id }
          });

          // Clean up test data
          if (insertData[0]?.id) {
            await this.supabase
              .from('blog_summaries')
              .delete()
              .eq('id', insertData[0].id);
          }
        }
      }

    } catch (error) {
      supabaseResults.push({
        component: 'Supabase',
        requirement: 'General Operation',
        status: 'FAIL',
        details: `Supabase operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return supabaseResults;
  }

  // Test complete workflow according to assignment requirements
  async verifyWorkflow(): Promise<VerificationResult[]> {
    const workflowResults: VerificationResult[] = [];

    // Test 1: URL Input → Scraping capability
    try {
      const testUrl = 'https://nextjs.org/blog/next-14-2';
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(testUrl)}`);
      
      if (response.ok) {
        const data = await response.json();
        workflowResults.push({
          component: 'Workflow',
          requirement: 'URL → Scrape Text',
          status: 'PASS',
          details: `Successfully scraped content from blog URL (${data.content?.length || 0} characters)`
        });
      } else {
        workflowResults.push({
          component: 'Workflow',
          requirement: 'URL → Scrape Text',
          status: 'FAIL',
          details: 'Scraping API endpoint failed'
        });
      }
    } catch (error) {
      workflowResults.push({
        component: 'Workflow',
        requirement: 'URL → Scrape Text',
        status: 'FAIL',
        details: `Scraping test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 2: AI Summary Simulation (check if function exists)
    try {
      const { generateSummary } = await import('./translate');
      if (typeof generateSummary === 'function') {
        workflowResults.push({
          component: 'Workflow',
          requirement: 'AI Summary Simulation',
          status: 'PASS',
          details: 'AI summary generation function is available'
        });
      }
    } catch {
      workflowResults.push({
        component: 'Workflow',
        requirement: 'AI Summary Simulation',
        status: 'WARNING',
        details: 'AI summary function may not be properly implemented'
      });
    }

    // Test 3: Urdu Translation (JS dictionary)
    try {
      const { translateToUrdu } = await import('./translate');
      if (typeof translateToUrdu === 'function') {
        const testTranslation = await translateToUrdu('Hello World');
        workflowResults.push({
          component: 'Workflow',
          requirement: 'Urdu Translation (JS Dictionary)',
          status: 'PASS',
          details: `Translation function working: "Hello World" → "${testTranslation}"`
        });
      }
    } catch {
      workflowResults.push({
        component: 'Workflow',
        requirement: 'Urdu Translation (JS Dictionary)',
        status: 'WARNING',
        details: 'Urdu translation function may not be properly implemented'
      });
    }

    return workflowResults;
  }

  // Generate comprehensive verification report
  async generateReport(): Promise<{
    summary: {
      total: number;
      passed: number;
      failed: number;
      warnings: number;
    };
    results: VerificationResult[];
    recommendations: string[];
  }> {
    console.log('🔍 Starting Assignment 2 Requirements Verification...\n');

    // Run all verifications
    const mongoResults = await this.verifyMongoDB();
    const supabaseResults = await this.verifySupabase();
    const workflowResults = await this.verifyWorkflow();

    const allResults = [...mongoResults, ...supabaseResults, ...workflowResults];

    // Calculate summary
    const summary = {
      total: allResults.length,
      passed: allResults.filter(r => r.status === 'PASS').length,
      failed: allResults.filter(r => r.status === 'FAIL').length,
      warnings: allResults.filter(r => r.status === 'WARNING').length
    };

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (allResults.some(r => r.component === 'Supabase' && r.requirement === 'Summary Storage Table' && r.status === 'WARNING')) {
      recommendations.push('Create blog_summaries table in Supabase with columns: id, url, title, summary_english, summary_urdu, created_at');
    }
    
    if (allResults.some(r => r.component === 'MongoDB' && r.status === 'FAIL')) {
      recommendations.push('Verify MongoDB connection string and database permissions');
    }
    
    if (allResults.some(r => r.component === 'Supabase' && r.status === 'FAIL')) {
      recommendations.push('Check Supabase environment variables and database setup');
    }

    if (allResults.some(r => r.requirement.includes('Translation') && r.status === 'WARNING')) {
      recommendations.push('Ensure Urdu translation functionality is properly implemented');
    }

    return {
      summary,
      results: allResults,
      recommendations
    };
  }
}

// Export verification function for API route
export async function verifyRequirements() {
  const verifier = new RequirementsVerifier();
  return await verifier.generateReport();
}
