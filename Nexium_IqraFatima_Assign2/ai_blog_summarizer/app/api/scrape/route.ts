import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const maxDuration = 60; // Give it up to 60 seconds to run

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required.' }, { status: 400 });
  }

  // This is the most critical check for Vercel deployment
  if (!apiKey) {
    console.error('CRITICAL: SCRAPINGBEE_API_KEY environment variable is not set.');
    return NextResponse.json({ error: 'Scraping service is not configured on the server.' }, { status: 500 });
  }

  console.log(`Attempting to scrape URL: ${url}`);

  try {
    // Construct a more powerful ScrapingBee URL
    // render_js=true -> Renders the page in a real browser
    // premium_proxy=true -> Uses residential IPs, which are much harder to block
    const scraperUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=true&premium_proxy=true`;

    console.log('Fetching from ScrapingBee...');
    const response = await fetch(scraperUrl, { next: { revalidate: 0 } });

    // Detailed logging for debugging the response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ScrapingBee API responded with status ${response.status}: ${errorText}`);
      throw new Error(`Scraping service failed. Status: ${response.status}.`);
    }

    const html = await response.text();

    // Check if we got a valid HTML document
    if (!html || !html.includes('<html')) {
      console.error('Invalid or empty response received from scraping service. Response:', html.substring(0, 500));
      throw new Error('Failed to retrieve valid HTML from the scraping service.');
    }

    console.log('Successfully received HTML. Parsing content...');
    const $ = cheerio.load(html);

    // Remove clutter
    $('script, style, nav, footer, header, aside, .ads, iframe, link, meta, noscript').remove();

    const title = $('title').first().text().trim() || $('h1').first().text().trim() || 'Untitled';

    // Find the element with the most text, likely the main content
    let bestContent = '';
    $('article, main, .post, .story, [role="main"]').each((i, element) => {
      const elementText = $(element).text().trim();
      if (elementText.length > bestContent.length) {
        bestContent = elementText;
      }
    });

    // Fallback to the whole body if specific containers fail
    if (bestContent.length < 200) {
      bestContent = $('body').text().trim();
    }

    // Final cleanup of whitespace
    const content = bestContent.replace(/\s\s+/g, ' ').trim();

    if (content.length < 100) {
      console.warn('Extracted content was very short. The page might be structured unusually.');
      throw new Error('Could not extract sufficient readable content from the page.');
    }

    console.log(`Scraping successful for: ${title}`);
    return NextResponse.json({ title, content, url });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during scraping.';
    console.error('SCRAPING FAILED:', errorMessage);
    return NextResponse.json({
      error: 'Failed to process the URL.',
      details: errorMessage,
    }, { status: 500 });
  }
}