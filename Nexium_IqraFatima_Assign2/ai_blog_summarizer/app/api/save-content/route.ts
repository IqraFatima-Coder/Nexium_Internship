import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import connectToDatabase from '@/lib/mongodb/client';
import BlogContent from '@/models/BlogContent';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting MongoDB save operation...');

    // Get user from Supabase auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();
    console.log('MongoDB connected successfully');

    // Parse request body
    const body = await req.json();
    console.log('Request body received:', {
      hasUrl: !!body.url,
      contentLength: body.content?.length,
      url: body.url,
      userId: user.id
    });

    const { url, content, title, summary, tags, isSaved = true } = body;

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

    // Check if content already exists for this user
    const existingContent = await BlogContent.findOne({ url, userId: user.id });
    
    if (existingContent) {
      // Update existing content
      console.log('Updating existing content for user:', user.id);
      const updatedContent = await BlogContent.findByIdAndUpdate(
        existingContent._id,
        {
          content,
          title,
          summary,
          tags,
          isSaved,
          updatedAt: new Date()
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Content updated successfully',
        id: updatedContent._id,
        url: updatedContent.url,
        action: 'updated'
      });
    }

    // Create new document for user
    console.log('Creating new BlogContent document for user:', user.id);
    const blogContent = await BlogContent.create({
      url,
      content,
      title,
      summary,
      tags,
      isSaved,
      userId: user.id,
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
