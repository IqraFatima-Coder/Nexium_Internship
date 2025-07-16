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
    console.log('Request body received:', {
      hasUrl: !!body.url,
      contentLength: body.content?.length,
      url: body.url,
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

    // Verify existing content
    const existingContent = await BlogContent.findOne({ url });
    if (existingContent) {
      console.log('Content already exists for URL:', url);
    }

    // Create new document
    console.log('Creating new BlogContent document...');
    const blogContent = await BlogContent.create({
      url,
      content,
      createdAt: new Date(),
    });

    console.log('Document created successfully:', {
      id: blogContent._id,
      url: blogContent.url,
      contentLength: blogContent.content.length,
      createdAt: blogContent.createdAt,
    });

    // Verify the save by reading it back
    const savedContent = await BlogContent.findById(blogContent._id);
    console.log('Verified saved content:', {
      found: !!savedContent,
      id: savedContent?._id,
      contentLength: savedContent?.content.length,
    });

    return NextResponse.json(
      {
        success: true,
        id: blogContent._id,
        url: blogContent.url,
        createdAt: blogContent.createdAt,
      },
      { status: 201 }
    );
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
