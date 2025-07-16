import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  console.log(`🔍 Starting to scrape: ${url}`);

  try {
    // Use ScrapingDog API - this works well with Vercel deployments
    const scrapingdogUrl = `https://api.scrapingdog.com/scrape?api_key=649a5d824ca3b51d503e729b&url=${encodeURIComponent(url)}&dynamic=false`;

    const response = await fetch(scrapingdogUrl, { next: { revalidate: 0 } });
    const html = await response.text();

    // Important check: Make sure we received HTML (not an error message)
    if (html.includes('<!DOCTYPE') || html.includes('<html')) {
      // It's valid HTML, parse it with cheerio
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
    } else {
      console.log('Invalid HTML received:', html.substring(0, 100));
      throw new Error('Invalid HTML response from scraping API');
    }

  } catch (error) {
    console.error('ScrapingDog failed, trying fallback:', error);

    try {
      // Try AllOrigins as fallback
      const fallbackUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const fallbackResponse = await fetch(fallbackUrl);
      const html = await fallbackResponse.text();

      // Make sure we received HTML
      if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
        throw new Error('Invalid HTML from fallback API');
      }

      const $ = cheerio.load(html);
      $('script, style, nav, footer, header, .ads').remove();

      const title = $('title').first().text() || $('h1').first().text() || 'Untitled';

      let content = '';
      if ($('article').length) {
        content = $('article').text().trim();
      } else if ($('main').length) {
        content = $('main').text().trim();
      } else {
        content = $('p').map((_, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 20)
          .join('\n\n');
      }

      if (!content || content.length < 100) {
        throw new Error('Not enough content found in page');
      }

      return NextResponse.json({ 
        title, 
        content, 
        url 
      });

    } catch (secondError) {
      console.error('All methods failed:', secondError);
      return NextResponse.json({
        error: 'All scraping methods failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        url
      }, { status: 500 });
    }
  }
}