// Enhanced scraping utilities for better reliability
// Remove unused import
// import { generateSummary, assessContentQuality } from './translate';
import { assessContentQuality } from './translate';

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  domain?: string;
  wordCount?: number;
  extractionScore?: number;
  extractionMethod?: string;
  quality?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
}

// Enhanced scraping with retry logic and better error handling

// Enhanced scraping with retry logic and better error handling
export async function scrapeWebContent(url: string, retries = 2): Promise<ScrapedContent> {
  let lastError: Error | null = null;
  
  // Try multiple attempts with exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Validate URL format
      const urlObj = new URL(url);
      
      // Check for supported protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported');
      }

      console.log(`🔄 Scraping attempt ${attempt + 1}/${retries + 1} for: ${url}`);
      
      // Make API call to scraping endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
      
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to scrape content`);
      }
      
      const data = await response.json();
      
      // Enhanced validation
      if (!data.content || typeof data.content !== 'string' || data.content.trim().length < 50) {
        throw new Error('Insufficient content found on the webpage. Please try a different URL.');
      }
      
      // Assess content quality
      const quality = assessContentQuality(data.content);
      
      if (quality.score < 30 && attempt < retries) {
        console.warn(`⚠️ Low quality content (score: ${quality.score}), retrying...`);
        throw new Error('Content quality too low, retrying with different method');
      }
      
      console.log(`✅ Successfully scraped content: ${data.title} (${data.content.length} chars, score: ${data.extractionScore || 'N/A'})`);
      
      return {
        title: data.title || 'Untitled',
        content: data.content,
        url: url,
        domain: urlObj.hostname,
        wordCount: data.wordCount || data.content.split(' ').filter((w: string) => w.length > 0).length,
        extractionScore: data.extractionScore,
        extractionMethod: data.extractionMethod,
        quality: quality
      };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`❌ Attempt ${attempt + 1} failed:`, lastError.message);
      
      // Don't retry on certain errors
      if (error instanceof Error && (
        error.message.includes('Invalid URL') ||
        error.message.includes('Only HTTP and HTTPS') ||
        error.message.includes('AbortError')
      )) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  throw new Error(
    `Failed to scrape content after ${retries + 1} attempts. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

// Utility function to validate and normalize URLs
export function validateAndNormalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported');
    }
    return urlObj.toString();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid URL')) {
      throw new Error('Please enter a valid URL starting with http:// or https://');
    }
    throw error;
  }
}

// Utility function to validate if URL looks like a blog/article
export function validateBlogUrl(url: string): { valid: boolean; message?: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    
    // Check for common blog indicators
    const blogIndicators = [
      'blog', 'article', 'post', 'news', 'story', 'medium.com', 
      'substack.com', 'wordpress.com', 'blogspot.com'
    ];
    
    const hasBlogIndicator = blogIndicators.some(indicator => 
      hostname.includes(indicator) || pathname.includes(indicator)
    );
    
    // Check for non-blog patterns
    const nonBlogPatterns = [
      'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
      'linkedin.com', 'pinterest.com', 'reddit.com', 'stackoverflow.com'
    ];
    
    const isNonBlog = nonBlogPatterns.some(pattern => hostname.includes(pattern));
    
    if (isNonBlog) {
      return {
        valid: false,
        message: 'Social media and video platforms are not supported. Please try a blog or news article URL.'
      };
    }
    
    if (!hasBlogIndicator && !pathname.includes('/')) {
      return {
        valid: false,
        message: 'This URL doesn\'t appear to be a blog post. Try a specific article URL.'
      };
    }
    
    return { valid: true };
    
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      valid: false,
      message: 'Please enter a valid URL starting with http:// or https://'
    };
  }
}