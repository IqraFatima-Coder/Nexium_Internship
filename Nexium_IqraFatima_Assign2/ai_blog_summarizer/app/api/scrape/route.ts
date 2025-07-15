import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const urlObj = new URL(url);

    // ✅ Add AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      signal: controller.signal, // ✅ Important!
    });

    clearTimeout(timeoutId); // ✅ Clear timer after fetch completes

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    let title =
      $('title').first().text() ||
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      'Blog Post';

    title = title.trim().replace(/\s+/g, ' ');

    let content = '';

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
      '[role="main"]',
    ];

    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length && element.text().trim().length > 200) {
        content = element.text();
        break;
      }
    }

    if (!content || content.length < 200) {
      const paragraphs = $('p').map((i, el) => $(el).text().trim()).get();
      content = paragraphs.filter(p => p.length > 50).join(' ');
    }

    if (!content || content.length < 200) {
      $('script, style, nav, header, footer, aside, .sidebar, .menu, .navigation').remove();
      content = $('body').text();
    }

    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
      .replace(/Subscribe.*?newsletter/gi, '')
      .replace(/Follow us on.*?social/gi, '')
      .replace(/Click here.*?more/gi, '')
      .replace(/Read more.*?article/gi, '')
      .replace(/Share this.*?post/gi, '');

    if (!content || content.length < 100) {
      throw new Error('Could not extract meaningful content from the webpage');
    }

    if (content.length > 5000) {
      content = content.substring(0, 5000) + '...';
    }

    return NextResponse.json({
      title,
      content,
      wordCount: content.split(' ').length,
      url,
      domain: urlObj.hostname,
    });

  } catch (error) {
    console.error('Scraping error:', error);

    const isAbort = error instanceof Error && error.name === 'AbortError';

    return NextResponse.json({
      error: isAbort
        ? 'Request timed out after 10 seconds.'
        : 'Failed to scrape content from the provided URL',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: isAbort
        ? 'Try a different blog or check your internet connection.'
        : 'Please ensure the URL is a valid blog post or article.',
    }, { status: 500 });
  }
}
