import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';

export const runtime = 'nodejs'; // Changed from 'edge' to 'nodejs' for better axios support
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  console.log(`🔍 Attempting to scrape: ${url}`);

  try {
    // Use axios with proper headers to mimic a real browser
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
        'Cache-Control': 'max-age=0',
      },
      timeout: 30000, // 30 second timeout
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Only accept 2xx status codes
      }
    });

    // Check if we actually got HTML content
    const html = response.data;
    
    if (typeof html !== 'string') {
      throw new Error('Response is not a string - might be JSON or binary data');
    }

    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      throw new Error('Response does not appear to be HTML content');
    }

    console.log('✅ Successfully received HTML content');

    // Parse with Cheerio
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .ads, iframe, noscript, link, meta').remove();

    // Extract title
    const title = $('title').first().text().trim() || 
                 $('h1').first().text().trim() || 
                 'Untitled Article';

    // Extract content using multiple strategies
    let content = '';

    // Strategy 1: Look for article tags
    const articleContent = $('article').text().trim();
    if (articleContent.length > 200) {
      content = articleContent;
    }

    // Strategy 2: Look for main content areas
    if (!content) {
      const mainContent = $('main, [role="main"], .main-content, .post-content, .entry-content, .article-body').text().trim();
      if (mainContent.length > 200) {
        content = mainContent;
      }
    }

    // Strategy 3: Look for content by class names
    if (!content) {
      const contentSelectors = [
        '.content', '.post', '.story', '.article', 
        '.blog-post', '.entry', '.text', '.body'
      ];
      
      for (const selector of contentSelectors) {
        const selectorContent = $(selector).text().trim();
        if (selectorContent.length > content.length && selectorContent.length > 200) {
          content = selectorContent;
        }
      }
    }

    // Strategy 4: Fallback to all paragraphs
    if (!content || content.length < 200) {
      content = $('p').map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 20)
        .join('\n\n');
    }

    // Strategy 5: Last resort - body text
    if (!content || content.length < 100) {
      content = $('body').text().trim();
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n')      // Replace multiple newlines with single newline
      .trim();

    // Validate we have meaningful content
    if (!content || content.length < 100) {
      throw new Error('Could not extract sufficient content from the page');
    }

    console.log(`✅ Successfully extracted content: ${title} (${content.length} characters)`);

    // Return the scraped data as JSON
    return NextResponse.json({
      title: title.substring(0, 200), // Limit title length
      content: content.substring(0, 5000), // Limit content length for API efficiency
      url: url,
      wordCount: content.split(' ').length,
      charCount: content.length
    });

  } catch (error) {
    console.error('❌ Scraping failed:', error);
    
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        console.error(`Server responded with status: ${error.response.status}`);
        return NextResponse.json({
          error: 'Website returned an error',
          details: `HTTP ${error.response.status}: ${error.response.statusText}`,
          url: url
        }, { status: 500 });
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received from server');
        return NextResponse.json({
          error: 'Could not reach the website',
          details: 'The website may be down or blocking our requests',
          url: url
        }, { status: 500 });
      }
    }

    // Generic error handling
    return NextResponse.json({
      error: 'Failed to scrape content',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      url: url
    }, { status: 500 });
  }
}