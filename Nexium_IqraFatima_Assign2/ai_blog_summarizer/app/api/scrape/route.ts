import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const maxDuration = 60; // Set max duration to 60 seconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  console.log(`🔍 Attempting to scrape: ${url}`);
  
  try {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    console.log('Sending fetch request...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
      signal: controller.signal,
      next: { revalidate: 0 }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);
    
    const html = await response.text();
    console.log(`Received ${html.length} bytes of data`);
    console.log(`Data preview: ${html.substring(0, 100)}...`);
    
    if (!html || html.length < 100) {
      throw new Error('Empty or too short response');
    }

    const $ = cheerio.load(html);
    console.log('HTML loaded into cheerio');
    
    // Remove unwanted elements
    $('script, style, nav, footer, header, .ads, iframe').remove();
    
    // Get title
    let title = $('title').first().text().trim();
    if (!title) {
      title = $('h1').first().text().trim() || 'Untitled Article';
    }
    console.log(`Extracted title: ${title}`);
    
    // Try different content selectors
    const selectors = [
      'article', 'main', '[role="main"]', '.post-content',
      '.article-content', '.entry-content', '.content',
      '#main-content', '.post', '.blog-post'
    ];
    
    let content = '';
    
    // Try each selector
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length) {
        content = element.text().trim();
        console.log(`Found content with selector: ${selector}`);
        if (content.length > 200) break;
      }
    }
    
    // Fallback to paragraphs if no content found
    if (!content || content.length < 200) {
      console.log('Using paragraph fallback method');
      content = $('p').map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 20)
        .join('\n\n');
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    console.log(`Extracted ${content.length} characters of content`);
    
    if (!content || content.length < 200) {
      throw new Error('Could not extract meaningful content from the webpage');
    }
    
    const result = {
      title,
      content,
      url
    };
    
    console.log('Successfully scraped content');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape content',
      details: error instanceof Error ? error.message : 'Unknown error',
      url 
    }, { 
      status: 500
    });
  }
}