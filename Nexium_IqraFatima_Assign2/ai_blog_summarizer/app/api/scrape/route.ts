import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Verify we got HTML
    if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
      console.error('Invalid response:', html.substring(0, 100));
      throw new Error('Invalid HTML response');
    }

    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, .ads').remove();

    // Get title
    const title = $('title').first().text() || 
                 $('h1').first().text() || 
                 'Untitled Article';

    // Try multiple selectors for content
    const selectors = [
      'article',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.entry-content',
      'main',
      '#main-content'
    ];

    let content = '';
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length) {
        content = element.text().trim();
        if (content.length > 100) break;
      }
    }

    // Fallback to paragraphs if no content found
    if (!content || content.length < 100) {
      content = $('p').map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 20)
        .join('\n\n');
    }

    if (!content) {
      throw new Error('No content found');
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    return NextResponse.json({
      title,
      content,
      url
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape content',
      details: error instanceof Error ? error.message : 'Unknown error',
      url 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}