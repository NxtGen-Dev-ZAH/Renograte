import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  try {
    // Extract cookies for debugging
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    return NextResponse.json({ 
      tokenExists: !!token,
      tokenContent: token || {},
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set'
      },
      debug: {
        hasSessionCookie: !!cookies['next-auth.session-token'],
        cookieNames: Object.keys(cookies),
        headers: {
          host: request.headers.get('host'),
          referer: request.headers.get('referer'),
          userAgent: request.headers.get('user-agent')
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get token',
      message: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
} 