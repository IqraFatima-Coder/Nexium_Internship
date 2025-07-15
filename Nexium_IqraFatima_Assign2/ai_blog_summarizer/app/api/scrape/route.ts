import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }
  
  try {
    // Validate URL
    const urlObj = new URL(url);
    
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract title with multiple fallbacks
    let title = 
      $('title').first().text() ||
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      'Blog Post';
    
    // Clean title
    title = title.trim().replace(/\s+/g, ' ');
    
    // Extract main content with multiple strategies
    let content = '';
    
    // Strategy 1: Look for common article selectors
    const articleSelectors = [
      'article',
      '.post-content',
      '.entry-content', 
      '.content',
      '.post-body',
      '.article-content',
      '.blog-content',
      '.main-content',
      '#content',
      '.container .content',
      '[role="main"]'
    ];
    
    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length && element.text().trim().length > 200) {
        content = element.text();
        break;
      }
    }
    
    // Strategy 2: If no article content found, look for paragraphs
    if (!content || content.length < 200) {
      const paragraphs = $('p').map((i, el) => $(el).text().trim()).get();
      content = paragraphs
        .filter(p => p.length > 50) // Filter out short paragraphs
        .join(' ');
    }
    
    // Strategy 3: Fallback to body content (filtered)
    if (!content || content.length < 200) {
      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .sidebar, .menu, .navigation').remove();
      content = $('body').text();
    }
    
    // Clean and process content
    content = content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n+/g, ' ') // Remove line breaks
      .trim();
    
    // Remove common noise
    content = content
      .replace(/Subscribe.*?newsletter/gi, '')
      .replace(/Follow us on.*?social/gi, '')
      .replace(/Click here.*?more/gi, '')
      .replace(/Read more.*?article/gi, '')
      .replace(/Share this.*?post/gi, '');
    
    // Validate content quality
    if (!content || content.length < 100) {
      throw new Error('Could not extract meaningful content from the webpage');
    }
    
    // Limit content length for processing
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '...';
    }
    
    return NextResponse.json({
      title: title,
      content: content,
      wordCount: content.split(' ').length,
      url: url,
      domain: urlObj.hostname
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    
    // Provide helpful error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({ 
        error: 'Unable to access the website. It may be blocking automated requests.',
        suggestion: 'Try a different blog URL or check if the website is accessible.'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to scrape content from the provided URL',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Please ensure the URL is a valid blog post or article.'
    }, { status: 500 });
  }
}