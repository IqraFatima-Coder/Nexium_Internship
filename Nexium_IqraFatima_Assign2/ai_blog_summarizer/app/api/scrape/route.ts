import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const maxDuration = 60; // Allow for longer scraping time

async function fetchWithScrapingBee(url: string, apiKey: string) {
  console.log('Attempting to scrape with ScrapingBee...');
  const scraperUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=false`;
  const response = await fetch(scraperUrl);

  if (!response.ok) {
    throw new Error(`ScrapingBee failed with status: ${response.status}`);
  }
  return response.text();
}

async function fetchWithAllOrigins(url: string) {
  console.log('ScrapingBee failed, trying fallback with AllOrigins...');
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error(`AllOrigins fallback failed with status: ${response.status}`);
  }
  return response.text();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Scraping service API key is not configured.' }, { status: 500 });
  }

  try {
    let html: string;
    try {
      html = await fetchWithScrapingBee(url, apiKey);
    } catch (scrapingBeeError) {
      console.error(scrapingBeeError);
      html = await fetchWithAllOrigins(url);
    }

    if (!html || typeof html !== 'string' || html.trim().length < 100) {
        throw new Error('Failed to retrieve valid HTML content from any source.');
    }

    const $ = cheerio.load(html);

    // Remove non-content elements
    $('script, style, nav, footer, header, aside, .ads, iframe, link, meta').remove();

    const title = $('title').first().text() || $('h1').first().text() || 'Untitled';

    // Prioritize selectors for main content
    const selectors = ['article', 'main', '.post-content', '.article-body', '[role="main"]'];
    let content = '';
    for (const selector of selectors) {
      const elementText = $(selector).text().trim();
      if (elementText.length > content.length) {
        content = elementText;
      }
    }

    // Fallback if specific selectors fail
    if (content.length < 200) {
      content = $('body').text().trim();
    }

    // Clean up whitespace
    content = content.replace(/\s\s+/g, ' ').trim();

    if (content.length < 100) {
      throw new Error('Could not extract sufficient content from the page.');
    }

    console.log(`Successfully scraped: ${title}`);
    return NextResponse.json({ title, content, url });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('All scraping methods failed:', errorMessage);
    return NextResponse.json({
      error: 'Failed to scrape the provided URL.',
      details: errorMessage,
    }, { status: 500 });
  }
}