import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  try {
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
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get token',
      message: (error as Error).message
    }, { status: 500 });
  }
} 