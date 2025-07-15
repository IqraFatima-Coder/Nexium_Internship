// Remove unused import
// import { generateSummary, assessContentQuality } from './translate';
import { assessContentQuality } from './translate';

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  domain?: string;
  wordCount?: number;
  quality?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
}

export async function scrapeWebContent(url: string): Promise<ScrapedContent> {
  try {
    // Validate URL format
    const urlObj = new URL(url);
    
    // Check for supported protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported');
    }
    
    // Make API call to scraping endpoint
    const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to scrape content`);
    }
    
    const data = await response.json();
    
    // Validate scraped content
    if (!data.content || data.content.trim().length < 50) {
      throw new Error('Insufficient content found on the webpage. Please try a different URL.');
    }
    
    // Assess content quality
    const quality = assessContentQuality(data.content);
    
    if (quality.score < 30) {
      console.warn('Low quality content detected:', quality.issues);
    }
    
    return {
      title: data.title || 'Untitled Article',
      content: data.content,
      url: url,
      domain: data.domain || urlObj.hostname,
      wordCount: data.wordCount || data.content.split(' ').length,
      quality: quality
    };
    
  } catch (err) {
    console.error('Scraping error:', err);
    
    // Provide user-friendly error messages
    if (err instanceof TypeError && err.message.includes('Invalid URL')) {
      throw new Error('Please enter a valid URL starting with http:// or https://');
    }
    
    if (err instanceof Error) {
      throw err; // Re-throw with original message
    }
    
    throw new Error('Unable to process the webpage. Please try a different URL.');
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
    
  } catch (error) {
    return {
      valid: false,
      message: 'Please enter a valid URL starting with http:// or https://'
    };
  }
}