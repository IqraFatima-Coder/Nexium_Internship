import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios'; // Using axios as requested

export const maxDuration = 120; // Increased duration for robust scraping

// Helper function to parse HTML content
const parseHtmlAndExtractContent = (html: string, url: string) => {
  if (!html || typeof html !== 'string' || !html.includes('<html')) {
    throw new Error('Invalid or empty HTML content received from scraping service.');
  }

  const $ = cheerio.load(html);
  // Remove elements that don't contain main content
  $('script, style, nav, footer, header, aside, .ads, iframe, link, meta, noscript').remove();
  
  const title = $('title').first().text().trim() || $('h1').first().text().trim() || 'Untitled';

  // Find the element with the most text, which is likely the main content
  let bestContent = '';
  $('article, main, .post, .story, [role="main"]').each((i, element) => {
    const elementText = $(element).text().trim();
    if (elementText.length > bestContent.length) {
      bestContent = elementText;
    }
  });

  // Fallback to the whole body if specific containers fail to yield enough text
  if (bestContent.length < 200) {
    bestContent = $('body').text().trim();
  }

  // Final cleanup of whitespace
  const content = bestContent.replace(/\s\s+/g, ' ').trim();

  if (content.length < 100) {
    throw new Error('Could not extract sufficient readable content from the page.');
  }

  return { title, content, url };
};

// --- Main API Route Handler ---

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required.' }, { status: 400 });
  }

  if (!apiKey) {
    console.error('CRITICAL: SCRAPINGBEE_API_KEY environment variable is not set.');
    return NextResponse.json({ error: 'Scraping service is not configured on the server.' }, { status: 500 });
  }

  console.log(`Attempting to scrape URL: ${url} with ScrapingBee...`);

  try {
    // Construct the ScrapingBee URL for a powerful request
    const scraperUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=true&premium_proxy=true`;

    // Make the request using axios
    const response = await axios.get(scraperUrl, { timeout: 110000 }); // 110-second timeout

    // Parse the HTML response and extract content
    const result = parseHtmlAndExtractContent(response.data, url);
    
    console.log(`Scraping successful for: ${result.title}`);
    return NextResponse.json(result);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during scraping.';
    console.error('SCRAPING FAILED:', errorMessage);
    
    // Check if the error is from axios to provide more specific details
    if (axios.isAxiosError(error) && error.response) {
        console.error('Axios response error:', error.response.data);
        return NextResponse.json({
            error: 'The scraping service returned an error.',
            details: `Status ${error.response.status}: ${error.response.statusText}`,
        }, { status: 500 });
    }

    return NextResponse.json({
      error: 'Failed to process the URL.',
      details: errorMessage,
    }, { status: 500 });
  }
}