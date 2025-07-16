import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('Attempting to fetch URL:', url);

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      console.log('Unexpected content type:', contentType);
    }

    const html = await response.text();
    
    if (!html || html.trim().length === 0) {
      throw new Error('Empty response received from server');
    }

    console.log('Successfully fetched HTML, length:', html.length);

    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, .ads').remove();

    // Get the title
    let title = $('title').first().text().trim();
    if (!title) {
      title = $('h1').first().text().trim();
    }
    if (!title) {
      title = 'Untitled Article';
    }

    console.log('Extracted title:', title);

    // Get the main content
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.entry-content',
      'main',
      '#main-content',
      '.content',
      '.post'
    ];

    let content = '';
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length) {
        content = element.text().trim();
        if (content.length > 100) {
          console.log('Found content using selector:', selector);
          break;
        }
      }
    }

    // Fallback to paragraphs if no content found
    if (!content || content.length < 100) {
      console.log('Using fallback content extraction method');
      content = $('p')
        .map((_, el) => $(el).text().trim())
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

    console.log('Successfully extracted content, length:', content.length);

    return NextResponse.json({
      title,
      content,
      url,
      quality: {
        score: 100,
        contentLength: content.length
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({
      error: 'Failed to scrape content',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}
