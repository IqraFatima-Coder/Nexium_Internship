import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Try to sign in with a dummy password to check if user exists
    // This is a workaround since Supabase doesn't have a direct "check user exists" method
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'dummy-password-for-checking-123', // This will fail but tell us if user exists
    });

    if (error) {
      // If error is about invalid credentials, user exists
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json({
          exists: true,
          message: 'User with this email already exists'
        });
      }
      // If error is about email not confirmed, user exists but needs confirmation
      else if (error.message.includes('Email not confirmed')) {
        return NextResponse.json({
          exists: true,
          needsConfirmation: true,
          message: 'User exists but email needs confirmation'
        });
      }
      // Other errors might indicate user doesn't exist
      else {
        return NextResponse.json({
          exists: false,
          message: 'User does not exist'
        });
      }
    }

    // If no error (which is unlikely with dummy password), assume user exists
    return NextResponse.json({
      exists: true,
      message: 'User with this email already exists'
    });

  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
