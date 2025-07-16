import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Set maximum execution time to 60 seconds
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  console.log(`🔍 Starting to scrape: ${url}`);

  try {
    // Use Scrapingdog API which has a free tier (up to 1000 requests/month)
    // Replace with your free API key from https://www.scrapingdog.com/
    const scrapingdogUrl = `https://api.scrapingdog.com/scrape?api_key=68775d0abe4586f955b7560a&url=${encodeURIComponent(url)}&dynamic=false`;
    
    console.log('Using ScrapingDog API');
    const response = await fetch(scrapingdogUrl, { 
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`ScrapingDog API failed with status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, .ads, iframe').remove();

    // Get title
    const title = $('title').first().text() || 
                 $('h1').first().text() || 
                 'Untitled Article';

    // Try multiple selectors for content
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

    // Fallback to paragraphs if no content found
    if (!content || content.length < 200) {
      content = $('p').map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 20)
        .join('\n\n');
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    if (!content || content.length < 100) {
      throw new Error('Could not extract meaningful content');
    }

    console.log(`Successfully scraped: ${title} (${content.length} chars)`);

    return NextResponse.json({
      title: title.trim(),
      content,
      url
    });

  } catch (error) {
    console.error('First method failed:', error);
    
    try {
      // Try an alternative API as fallback
      const allorigins = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      console.log('Trying allorigins API');
      
      const response = await fetch(allorigins);
      
      if (!response.ok) {
        throw new Error(`AllOrigins API failed with status: ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      $('script, style, nav, footer, header, .ads').remove();
      
      const title = $('title').first().text() || $('h1').first().text() || 'Untitled';
      
      // Try to get content
      let content = '';
      
      // Try article tag first
      if ($('article').length) {
        content = $('article').text().trim();
      } 
      // Then try main content areas
      else if ($('main').length) {
        content = $('main').text().trim();
      } 
      // Finally just get paragraphs
      else {
        content = $('p').map((_, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 20)
          .join('\n\n');
      }
      
      if (!content || content.length < 100) {
        throw new Error('Not enough content found in page');
      }
      
      console.log(`AllOrigins method succeeded for: ${title}`);
      
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