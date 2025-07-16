import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Use corsproxy.io to bypass CORS and anti-bot protections
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Proxy request failed with status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, .ads, iframe').remove();

    // Get title
    const title = $('title').first().text() || 
                 $('h1').first().text() || 
                 'Untitled Article';

    // Try multiple selectors for content
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

    // Fallback to paragraphs if no content found
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

    return NextResponse.json({
      title: title.trim(),
      content,
      url
    });

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