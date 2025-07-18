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

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required.' }, { status: 400 });
  }

  console.log(`Attempting to scrape URL: ${url} using direct Axios + Cheerio approach`);

  try {
    // Set appropriate headers to mimic a browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.google.com/',
      'Connection': 'keep-alive'
    };

    // Make the direct request using axios
    const response = await axios.get(url, { 
      headers, 
      timeout: 30000,
      maxRedirects: 5
    });

    // Parse the HTML response and extract content
    const result = parseHtmlAndExtractContent(response.data, url);
    
    console.log(`Scraping successful for: ${result.title}`);
    return NextResponse.json(result);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during scraping.';
    console.error('SCRAPING FAILED:', errorMessage);
    
    // Check if the error is from axios to provide more specific details
    if (axios.isAxiosError(error)) {
      // Provide more specific error based on response status
      if (error.response) {
        // Server responded with non-200 status
        console.error(`Server error ${error.response.status}: ${error.response.statusText}`);
        
        if (error.response.status === 403) {
          return NextResponse.json({
            error: 'Access to this website is forbidden.',
            details: 'This website may be blocking web scraping. Try another URL.',
          }, { status: 403 });
        }
        
        return NextResponse.json({
          error: 'Failed to access the website.',
          details: `The server returned status ${error.response.status}: ${error.response.statusText}`,
        }, { status: 502 });
      } else if (error.request) {
        // Request made but no response received
        return NextResponse.json({
          error: 'Website did not respond.',
          details: 'The request was sent but no response was received. The website may be down.',
        }, { status: 504 });
      }
    }

    return NextResponse.json({
      error: 'Failed to process the URL.',
      details: errorMessage,
    }, { status: 500 });
  }
}