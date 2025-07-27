import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';

// Configure for Vercel serverless functions
export const config = {
  runtime: 'edge',
  regions: ['iad1'], // Use US East (N. Virginia) for better reliability
};

export const maxDuration = 60; // Set reasonable timeout for Vercel

// Function to safely check if a string is HTML
const isHtml = (text: string): boolean => {
  return typeof text === 'string' && 
    (text.includes('<html') || text.includes('<body') || text.includes('<!doctype html'));
};

// Helper function to parse HTML content
const parseHtmlAndExtractContent = (html: string, url: string) => {
  if (!html || !isHtml(html)) {
    throw new Error('Invalid or empty HTML content received.');
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

  console.log(`[Vercel Lambda] Attempting to scrape URL: ${url}`);

  try {
    // Try to use a simple GET request first without axios - better for Vercel Edge functions
    let html: string;
    let responseContentType: string | null = null;

    try {
      // First attempt: Using native fetch (works better in Edge Runtime)
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
        },
        redirect: 'follow',
      });
      
      responseContentType = fetchResponse.headers.get('content-type');
      
      // Check if response is HTML
      if (!responseContentType || !responseContentType.includes('text/html')) {
        throw new Error(`Response is not HTML: ${responseContentType}`);
      }
      
      html = await fetchResponse.text();
      console.log(`[Vercel Lambda] Native fetch successful, received ${html.length} bytes`);
    } catch (fetchError) {
      console.log(`[Vercel Lambda] Native fetch failed, falling back to axios: ${fetchError}`);
      
      // Fallback: Using axios if native fetch fails
      const axiosResponse = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/',
        },
        timeout: 25000,
        maxRedirects: 5
      });
      
      html = axiosResponse.data;
      responseContentType = axiosResponse.headers['content-type'];
    }

    // Verify we have HTML content before processing
    if (!isHtml(html)) {
      console.error(`[Vercel Lambda] Response doesn't appear to be HTML. Content type: ${responseContentType}`);
      console.error(`[Vercel Lambda] First 100 chars of response: ${html.substring(0, 100)}`);
      return NextResponse.json({
        error: 'Invalid response format',
        details: 'The website did not return proper HTML content.',
      }, { status: 415 });
    }

    // Parse the HTML response and extract content
    const result = parseHtmlAndExtractContent(html, url);
    
    console.log(`[Vercel Lambda] Scraping successful for: ${result.title}`);
    
    // Important: Return a proper JSON response for Vercel
    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during scraping.';
    console.error('[Vercel Lambda] SCRAPING FAILED:', errorMessage);
    
    // Check if the error is from axios to provide more specific details
    if (axios.isAxiosError(error)) {
      // Provide more specific error based on response status
      if (error.response) {
        // Server responded with non-200 status
        console.error(`[Vercel Lambda] Server error ${error.response.status}: ${error.response.statusText}`);
        
        if (error.response.status === 403) {
          return new NextResponse(JSON.stringify({
            error: 'Access to this website is forbidden.',
            details: 'This website may be blocking web scraping. Try another URL.',
          }), { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new NextResponse(JSON.stringify({
          error: 'Failed to access the website.',
          details: `The server returned status ${error.response.status}: ${error.response.statusText}`,
        }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (error.request) {
        // Request made but no response received
        return new NextResponse(JSON.stringify({
          error: 'Website did not respond.',
          details: 'The request was sent but no response was received. The website may be down.',
        }), {
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Generic error response
    return new NextResponse(JSON.stringify({
      error: 'Failed to process the URL.',
      details: errorMessage,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}