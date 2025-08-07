import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';

export const runtime = 'nodejs'; // Changed from 'edge' to 'nodejs' for better axios support
export const maxDuration = 60;

// Multiple scraping strategies for better reliability
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

// Fallback scraping using different approaches
async function scrapeWithFetch(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(25000)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.text();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`🔍 Attempting to scrape: ${url}`);

    // Try multiple scraping methods with retries
    const scrapingMethods = [
      () => scrapeWithAxios(url),
      () => scrapeWithFetch(url),
      () => scrapeWithAxios(url, true) // Retry axios with different config
    ];

    let lastError: Error | null = null;

    for (let methodIndex = 0; methodIndex < scrapingMethods.length; methodIndex++) {
      try {
        console.log(`📡 Trying scraping method ${methodIndex + 1}/${scrapingMethods.length}`);
        const html = await scrapingMethods[methodIndex]();
        
        const extractedData = extractContentFromHtml(html, url);
        if (extractedData.content && extractedData.content.length > 100) {
          console.log(`✅ Successfully scraped with method ${methodIndex + 1}: ${extractedData.title} (${extractedData.content.length} characters)`);
          return NextResponse.json(extractedData);
        } else {
          throw new Error('Insufficient content extracted');
        }
      } catch (error) {
        console.error(`❌ Method ${methodIndex + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Wait before trying next method
        if (methodIndex < scrapingMethods.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // All methods failed
    console.error('❌ All scraping methods failed');
    return NextResponse.json({
      error: 'Failed to scrape content after trying multiple methods',
      details: lastError?.message || 'All scraping attempts failed',
      url: url,
      suggestion: 'The website might be blocking scraping or have anti-bot protection'
    }, { status: 500 });

  } catch (error) {
    // Global error handler to ensure we always return JSON
    console.error('❌ Unexpected error in scrape API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'An unexpected error occurred',
      suggestion: 'Please try again or contact support if the issue persists'
    }, { status: 500 });
  }
}

// Primary scraping method using axios
async function scrapeWithAxios(url: string, retryMode = false): Promise<string> {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  const config = {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': retryMode ? 'no-cache' : 'max-age=0',
    },
    timeout: retryMode ? 45000 : 30000,
    maxRedirects: 5,
    validateStatus: function (status: number) {
      return status >= 200 && status < 300;
    }
  };

  const response = await axios.get(url, config);

  // Validate response
  const html = response.data;
  if (typeof html !== 'string') {
    throw new Error('Response is not HTML content');
  }

  if (!html.includes('<html') && !html.includes('<!DOCTYPE') && !html.includes('<body')) {
    throw new Error('Response does not appear to be valid HTML');
  }

  return html;
}

// Extract content from HTML using improved strategies
function extractContentFromHtml(html: string, url: string): {
  title: string;
  content: string;
  url: string;
  wordCount: number;
  charCount: number;
  extractionScore: number;
  extractionMethod: string;
} {
  const $ = cheerio.load(html);

  // Remove unwanted elements more comprehensively
  $('script, style, nav, footer, header, aside, .ads, .advertisement, iframe, noscript, link, meta, form, button, .cookie, .popup, .modal, .newsletter, .social, .share, .comment, .sidebar').remove();

  // Extract title with multiple fallbacks
  const title = $('title').first().text().trim() || 
               $('h1').first().text().trim() || 
               $('meta[property="og:title"]').attr('content') ||
               $('meta[name="title"]').attr('content') ||
               'Untitled Article';

  // Enhanced content extraction with scoring system
  let bestContent = '';
  let bestScore = 0;

  // Strategy 1: Semantic HTML5 elements
  const semanticSelectors = ['article', 'main', '[role="main"]', 'section[class*="content"]'];
  for (const selector of semanticSelectors) {
    const content = $(selector).text().trim();
    const score = calculateContentScore(content);
    if (score > bestScore && score > 50) {
      bestContent = content;
      bestScore = score;
    }
  }

  // Strategy 2: Common content class patterns
  const contentSelectors = [
    '.post-content', '.entry-content', '.article-body', '.article-content',
    '.main-content', '.content-body', '.story-body', '.text-content',
    '.blog-post', '.post-body', '.article-text', '.content-area',
    '[class*="content"]', '[id*="content"]', '[class*="article"]', '[id*="article"]'
  ];

  for (const selector of contentSelectors) {
    const elements = $(selector);
    elements.each((_, element) => {
      const content = $(element).text().trim();
      const score = calculateContentScore(content);
      if (score > bestScore && score > 30) {
        bestContent = content;
        bestScore = score;
      }
    });
  }

  // Strategy 3: Paragraph-based extraction with filtering
  if (bestScore < 100) {
    const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();
    const filteredParagraphs = paragraphs
      .filter(text => text.length > 30 && !isNavOrMetaText(text))
      .join('\n\n');
    
    const score = calculateContentScore(filteredParagraphs);
    if (score > bestScore) {
      bestContent = filteredParagraphs;
      bestScore = score;
    }
  }

  // Strategy 4: Div-based extraction as last resort
  if (bestScore < 50) {
    $('div').each((_, element) => {
      const $div = $(element);
      const text = $div.text().trim();
      
      // Skip if div contains other divs (likely container)
      if ($div.find('div').length > 2) return;
      
      const score = calculateContentScore(text);
      if (score > bestScore && score > 20) {
        bestContent = text;
        bestScore = score;
      }
    });
  }

  // Clean up the content
  let content = bestContent
    .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n')      // Replace multiple newlines with single newline
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters except newlines
    .trim();

  // Validate we have meaningful content
  if (!content || content.length < 100) {
    // Emergency fallback - get all text and clean it
    content = $('body').text()
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Final validation
  if (!content || content.length < 50) {
    throw new Error('Could not extract sufficient content from the page');
  }

  // Return structured data
  return {
    title: title.substring(0, 200),
    content: content.substring(0, 8000), // Increased limit for better summaries
    url: url,
    wordCount: content.split(' ').filter(word => word.length > 0).length,
    charCount: content.length,
    extractionScore: bestScore,
    extractionMethod: bestScore > 100 ? 'semantic' : bestScore > 50 ? 'class-based' : 'paragraph-based'
  };
}

// Helper function to calculate content quality score
function calculateContentScore(text: string): number {
  if (!text || text.length < 50) return 0;
  
  let score = 0;
  
  // Length scoring
  score += Math.min(text.length / 10, 100);
  
  // Sentence count scoring
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  score += Math.min(sentences.length * 5, 50);
  
  // Word variety scoring
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  score += Math.min((uniqueWords.size / words.length) * 100, 50);
  
  // Penalty for navigation-like text
  if (isNavOrMetaText(text)) {
    score -= 50;
  }
  
  return Math.max(0, score);
}

// Helper function to identify navigation or metadata text
function isNavOrMetaText(text: string): boolean {
  const lowerText = text.toLowerCase();
  const navKeywords = [
    'menu', 'navigation', 'nav', 'home', 'about', 'contact',
    'login', 'register', 'search', 'subscribe', 'newsletter',
    'cookie', 'privacy', 'terms', 'policy', 'copyright',
    'follow us', 'social media', 'share', 'tweet', 'facebook'
  ];
  
  return navKeywords.some(keyword => lowerText.includes(keyword)) ||
         text.split(' ').length < 10 || // Very short text
         text.split('\n').length > text.split(' ').length / 3; // Too many line breaks
}