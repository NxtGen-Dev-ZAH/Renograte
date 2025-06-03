import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  try {
    // Extract headers directly from request
    const requestHeaders = {
      host: request.headers.get('host') || '',
      userAgent: request.headers.get('user-agent') || '',
      referer: request.headers.get('referer') || '',
      cookie: request.headers.get('cookie') || '',
      forwardedFor: request.headers.get('x-forwarded-for') || '',
      forwardedProto: request.headers.get('x-forwarded-proto') || '',
      realIp: request.headers.get('x-real-ip') || ''
    };

    // Extract cookies for debugging
    const cookieHeader = requestHeaders.cookie;
    
    // Parse cookie header
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=');
        cookies[key] = value;
      }
    });
    
    // Check for both secure and non-secure cookie names
    const hasSessionCookie = 
      !!cookies['next-auth.session-token'] || 
      !!cookies['__Secure-next-auth.session-token'];
    
    // Get token with detailed options
    const tokenOptions = {
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    };
    
    console.log('Getting token with options:', JSON.stringify(tokenOptions, null, 2));
    
    const token = await getToken(tokenOptions);
    
    // Get all environment variables (excluding secrets)
    const safeEnvVars: Record<string, string> = {};
    Object.keys(process.env).forEach(key => {
      if (!key.toLowerCase().includes('secret') && 
          !key.toLowerCase().includes('password') && 
          !key.toLowerCase().includes('key')) {
        safeEnvVars[key] = process.env[key] || '';
      } else {
        safeEnvVars[key] = '[REDACTED]';
      }
    });
    
    // Get URL information
    const url = new URL(request.url);
    
    return NextResponse.json({ 
      tokenExists: !!token,
      tokenContent: token || {},
      requestInfo: {
        method: request.method,
        url: request.url,
        urlParts: {
          protocol: url.protocol,
          host: url.host,
          hostname: url.hostname,
          pathname: url.pathname,
          search: url.search
        }
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set',
        allEnvVars: safeEnvVars
      },
      cookies: {
        hasSessionCookie,
        cookieHeader,
        parsedCookies: cookies,
        securePrefix: !!cookies['__Secure-next-auth.session-token']
      },
      headers: requestHeaders
    });
  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json({ 
      error: 'Failed to get token',
      message: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
} 