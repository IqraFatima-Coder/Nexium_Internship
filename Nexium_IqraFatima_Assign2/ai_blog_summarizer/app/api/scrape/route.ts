import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios'; // Using axios as requested

export const maxDuration = 120; // Increased duration for robust scraping

// Helper function to parse HTML content, remains the same
const parseHtml = (html: string, url: string) => {
  if (!html || typeof html !== 'string' || !html.includes('<html')) {
    throw new Error('Invalid or empty HTML content received.');
  }

  const $ = cheerio.load(html);
  $('script, style, nav, footer, header, aside, .ads, iframe, link, meta, noscript').remove();
  const title = $('title').first().text().trim() || $('h1').first().text().trim() || 'Untitled';

  let bestContent = '';
  $('article, main, .post, .story, [role="main"]').each((i, element) => {
    const elementText = $(element).text().trim();
    if (elementText.length > bestContent.length) {
      bestContent = elementText;
    }
  });

  if (bestContent.length < 200) {
    bestContent = $('body').text().trim();
  }

  const content = bestContent.replace(/\s\s+/g, ' ').trim();

  if (content.length < 100) {
    throw new Error('Could not extract sufficient readable content from the page.');
  }

  return { title, content, url };
};

// --- Scraping Services using AXIOS ---

// Service 1: ScrapingBee with axios
const scrapeWithScrapingBee = async (url: string, apiKey: string) => {
  console.log('Attempting to scrape with ScrapingBee using axios...');
  const scraperUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=true&premium_proxy=true`;
  const response = await axios.get(scraperUrl, { timeout: 110000 }); // 110-second timeout
  return parseHtml(response.data, url);
};

// Service 2: ScrapingDog with axios
const scrapeWithScrapingDog = async (url: string, apiKey: string) => {
  console.log('Attempting to scrape with ScrapingDog using axios...');
  const scraperUrl = `https://api.scrapingdog.com/scrape?api_key=${apiKey}&url=${encodeURIComponent(url)}&dynamic=true`;
  const response = await axios.get(scraperUrl, { timeout: 110000 });
  return parseHtml(response.data, url);
};


// --- Main API Route Handler ---

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required.' }, { status: 400 });
  }

  const scrapingBeeApiKey = process.env.SCRAPINGBEE_API_KEY;
  const scrapingDogApiKey = process.env.SCRAPINGDOG_API_KEY;

  if (!scrapingBeeApiKey && !scrapingDogApiKey) {
    console.error('CRITICAL: No scraping API keys are set in environment variables.');
    return NextResponse.json({ error: 'Scraping service is not configured on the server.' }, { status: 500 });
  }

  console.log(`Scraping URL: ${url}`);

  // --- Try ScrapingBee First ---
  if (scrapingBeeApiKey) {
    try {
      const result = await scrapeWithScrapingBee(url, scrapingBeeApiKey);
      return NextResponse.json(result);
    } catch (error) {
      console.warn('ScrapingBee failed:', error instanceof Error ? error.message : String(error));
    }
  }

  // --- Fallback to ScrapingDog ---
  if (scrapingDogApiKey) {
    try {
      const result = await scrapeWithScrapingDog(url, scrapingDogApiKey);
      return NextResponse.json(result);
    } catch (error) {
      console.error('ScrapingDog (fallback) also failed:', error instanceof Error ? error.message : String(error));
      return NextResponse.json({
        error: 'All scraping attempts failed.',
        details: error instanceof Error ? error.message : 'An unknown error occurred.',
      }, { status: 500 });
    }
  }
  
  return NextResponse.json({
    error: 'Failed to process the URL with the configured scraping service.',
    details: 'Primary scraping service failed, and no fallback is configured.',
  }, { status: 500 });
}