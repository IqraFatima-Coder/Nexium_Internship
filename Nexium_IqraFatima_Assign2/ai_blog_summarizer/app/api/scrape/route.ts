import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Use MicroLink API which is specifically designed for web scraping
    const scrapeUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false`;
    
    const response = await fetch(scrapeUrl);
    
    if (!response.ok) {
      throw new Error(`Scraping API failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.status !== 'success') {
      throw new Error('Scraping API returned unsuccessful response');
    }
    
    // Extract content from the API response
    const title = data.data?.title || 'Untitled Article';
    const description = data.data?.description || '';
    
    // Get the main content - combine all available text content
    let content = '';
    
    if (data.data?.content) {
      content = data.data.content;
    } else if (description) {
      content = description;
    } else {
      throw new Error('No content found in scraped data');
    }
    
    // Clean up content
    content = content.trim();
    
    if (!content || content.length < 100) {
      throw new Error('Could not extract meaningful content');
    }
    
    return NextResponse.json({
      title: title.trim(),
      content,
      url
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    
    // Try alternative method as fallback
    try {
      console.log("Trying fallback method with LinkPreview API...");
      
      // Use linkpreview.net as fallback
      const fallbackUrl = `https://api.linkpreview.net/?key=123456789&q=${encodeURIComponent(url)}`;
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback API failed with status: ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackData || !fallbackData.title) {
        throw new Error('Fallback API returned invalid data');
      }
      
      const title = fallbackData.title;
      const description = fallbackData.description || '';
      
      if (description.length < 100) {
        throw new Error('Not enough content in fallback response');
      }
      
      return NextResponse.json({
        title,
        content: description,
        url
      });
      
    } catch (fallbackError) {
      // If all methods fail
      return NextResponse.json({ 
        error: 'All scraping methods failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error',
        url
      }, { status: 500 });
    }
  }
}