import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Create a safe version of auth options without sensitive data
    const safeAuthOptions = {
      adapter: !!authOptions.adapter ? 'PrismaAdapter (configured)' : 'Not configured',
      providers: authOptions.providers.map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type
      })),
      session: {
        strategy: authOptions.session?.strategy || 'default',
        maxAge: authOptions.session?.maxAge || 'default'
      },
      cookies: {
        sessionToken: {
          name: authOptions.cookies?.sessionToken?.name || 'default',
          options: {
            httpOnly: authOptions.cookies?.sessionToken?.options?.httpOnly,
            sameSite: authOptions.cookies?.sessionToken?.options?.sameSite,
            path: authOptions.cookies?.sessionToken?.options?.path,
            secure: authOptions.cookies?.sessionToken?.options?.secure,
            domain: authOptions.cookies?.sessionToken?.options?.domain || 'not set',
            maxAge: authOptions.cookies?.sessionToken?.options?.maxAge || 'default'
          }
        }
      },
      pages: authOptions.pages,
      debug: authOptions.debug,
      // Include basic callback structure without exposing logic
      callbacks: {
        session: !!authOptions.callbacks?.session ? 'Configured' : 'Not configured',
        jwt: !!authOptions.callbacks?.jwt ? 'Configured' : 'Not configured'
      }
    };
    
    return NextResponse.json({
      authConfig: safeAuthOptions,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set'
      }
    });
  } catch (error) {
    console.error('Debug auth config error:', error);
    return NextResponse.json({ 
      error: 'Failed to get auth config',
      message: (error as Error).message
    }, { status: 500 });
  }
} 