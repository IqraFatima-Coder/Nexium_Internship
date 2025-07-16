import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/client';
import BlogContent from '@/models/BlogContent';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting MongoDB save operation...');

    // Connect to MongoDB first
    await connectToDatabase();
    console.log('MongoDB connected successfully');

    // Parse request body
    const body = await req.json();
    console.log('Received request body:', {
      hasUrl: !!body.url,
      contentLength: body.content?.length,
    });

    const { url, content } = body;

    if (!url || !content) {
      console.log('Missing required fields:', {
        hasUrl: !!url,
        hasContent: !!content,
      });
      return NextResponse.json(
        { error: 'URL and content are required' },
        { status: 400 }
      );
    }

    // Create new document
    console.log('Creating new BlogContent document...');
    const blogContent = await BlogContent.create({
      url,
      content,
    });

    console.log('Document created successfully:', {
      id: blogContent._id,
      url: blogContent.url,
    });

    return NextResponse.json(blogContent, { status: 201 });
  } catch (error) {
    console.error('MongoDB save error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save content to MongoDB',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
