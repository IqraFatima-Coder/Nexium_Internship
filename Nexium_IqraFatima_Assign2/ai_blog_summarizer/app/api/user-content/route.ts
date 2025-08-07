import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import connectToDatabase from '@/lib/mongodb/client';
import BlogContent from '@/models/BlogContent';

export async function GET(req: NextRequest) {
  try {
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const savedOnly = searchParams.get('savedOnly') === 'true';
    const search = searchParams.get('search') || '';

    // Build query
    interface QueryFilter {
      userId: string;
      isSaved?: boolean;
      $or?: Array<{
        title?: { $regex: string; $options: string };
        url?: { $regex: string; $options: string };
        tags?: { $in: RegExp[] };
      }>;
    }
    
    const query: QueryFilter = { userId: user.id };
    
    if (savedOnly) {
      query.isSaved = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await BlogContent.countDocuments(query);

    // Get paginated results
    const contents = await BlogContent.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .select('url title summary createdAt isSaved tags') // Don't return full content for list view
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: contents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      },
      filters: {
        savedOnly,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching user content:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
