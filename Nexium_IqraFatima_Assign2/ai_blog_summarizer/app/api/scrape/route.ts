import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // List of proxy services to try
  const proxies = [
    (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
    (target: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`
  ];

  let lastError = null;

  for (const [i, getProxyUrl] of proxies.entries()) {
    try {
      const proxyUrl = getProxyUrl(url);
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Proxy #${i + 1} failed with status: ${response.status}`);
      }

      let html: string;
      if (i === 1) {
        // allorigins returns JSON
        const data = await response.json();
        html = data.contents;
      } else {
        html = await response.text();
      }

      const $ = cheerio.load(html);
      $('script, style, nav, footer, header, .ads, iframe').remove();

      const title = $('title').first().text() || $('h1').first().text() || 'Untitled Article';

      let content = '';
      const selectors = [
        'article', 'main', '[role="main"]', '.post-content',
        '.article-content', '.entry-content', '#content',
        '.content', '.post', '.blog-post'
      ];

      for (const selector of selectors) {
        if ($(selector).length) {
          content = $(selector).text().trim();
          if (content.length > 200) break;
        }
      }

      if (!content || content.length < 200) {
        content = $('p').map((_, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 20)
          .join('\n\n');
      }

      content = content.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();

      if (!content || content.length < 100) {
        throw new Error('Could not extract meaningful content');
      }

      return NextResponse.json({
        title: title.trim(),
        content,
        url
      });
    } catch (error) {
      lastError = error;
      // Try next proxy
    }
  }

  // If all proxies fail
  return NextResponse.json({
    error: 'Failed to scrape content with all methods',
    details: lastError instanceof Error ? lastError.message : 'Unknown error',
    url
  }, { status: 500 });
}