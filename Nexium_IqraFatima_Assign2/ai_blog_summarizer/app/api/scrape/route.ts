import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('Fetching URL:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    if (!html || html.trim().length === 0) {
      throw new Error('Received empty response from the server');
    }

    console.log('Parsing HTML content...');
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, .ads, .comments').remove();

    // Get title
    const title = $('title').first().text() || 
                 $('h1').first().text() || 
                 'Untitled Article';

    // Get main content
    let content = '';
    const mainSelectors = [
      'article', 
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.entry-content',
      'main',
      '#main-content'
    ];

    // Try each selector until we find content
    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length) {
        content = element.text().trim();
        if (content.length > 100) {
          console.log(`Found content using selector: ${selector}`);
          break;
        }
      }
    }

    // Fallback to paragraphs if no content found
    if (!content || content.length < 100) {
      console.log('Using fallback content extraction method...');
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
      throw new Error('Could not extract meaningful content from the webpage');
    }

    console.log('Successfully extracted content:', {
      titleLength: title.length,
      contentLength: content.length
    });

    return NextResponse.json({
      title,
      content,
      url,
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}
