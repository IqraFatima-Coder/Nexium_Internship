import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/client';
import BlogContent from '@/models/BlogContent';

export async function POST(req: NextRequest) {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Connect to MongoDB first
    const mongoose = await connectToDatabase();
    console.log('MongoDB connected successfully');

    // Parse request body
    const { url, content } = await req.json();

    console.log('Received data:', { url, contentLength: content?.length });

    if (!url || !content) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'URL and content are required' },
        { status: 400 }
      );
    }

    // Create new document
    console.log('Creating new document in MongoDB...');
    const blogContent = await BlogContent.create({
      url,
      content,
    });
    console.log('Document created successfully:', blogContent._id);

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
