import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  console.log(`Starting to scrape: ${url}`);
  
  // Define a list of proxy services to try
  const proxyServices = [
    (targetUrl: string) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    (targetUrl: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
  ];
  
  let lastError = null;
  
  // Try each proxy service until one works
  for (const [index, getProxyUrl] of proxyServices.entries()) {
    try {
      console.log(`Trying proxy service #${index + 1}`);
      const proxyUrl = getProxyUrl(url);
      
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
        },
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Handle different response formats based on the proxy
      let html;
      if (index === 1) { // allorigins returns JSON
        const data = await response.json();
        html = data.contents;
      } else {
        html = await response.text();
      }
      
      // Process the HTML
      const $ = cheerio.load(html);
      $('script, style, nav, footer, header, .ads, iframe').remove();
      
      // Extract title
      const title = $('title').first().text() || 
                   $('h1').first().text() || 
                   'Untitled Article';

      // Extract content using multiple selectors
      let content = '';
      const contentSelectors = [
        'article', 'main', '[role="main"]', '.post-content',
        '.article-content', '.entry-content', '#content',
        '.content', '.post', '.blog-post'
      ];
      
      for (const selector of contentSelectors) {
        if ($(selector).length) {
          content = $(selector).text().trim();
          if (content.length > 200) break;
        }
      }

      // Fallback to paragraphs
      if (!content || content.length < 200) {
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

      if (!content || content.length < 100) {
        throw new Error('Could not extract meaningful content');
      }

      console.log(`Successfully scraped content (${content.length} chars)`);
      
      return NextResponse.json({
        title: title.trim(),
        content,
        url
      });
      
    } catch (error) {
      lastError = error;
      console.error(`Proxy service #${index + 1} failed:`, error);
      // Continue to next proxy
    }
  }
  
  // If we get here, all proxies failed
  return NextResponse.json({ 
    error: 'Failed to scrape content with all methods',
    details: lastError instanceof Error ? lastError.message : 'Unknown error',
    url
  }, { 
    status: 500
  });
}