import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/client';
import BlogContent from '@/models/BlogContent';

export async function POST(req: NextRequest) {
  try {
    const { url, content } = await req.json();

    if (!url || !content) {
      return NextResponse.json(
        { error: 'URL and content are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Create new blog content document
    const blogContent = await BlogContent.create({
      url,
      content,
    });

    return NextResponse.json(blogContent, { status: 201 });
  } catch (error) {
    console.error('Error saving to MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
