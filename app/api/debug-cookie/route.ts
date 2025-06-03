import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Create a test cookie with various settings to see what works
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    // Create response with test cookies
    const response = NextResponse.json({
      success: true,
      message: 'Test cookies set',
      hostname,
      time: new Date().toISOString()
    });
    
    // Set a regular cookie
    response.cookies.set('test-cookie-regular', 'test-value', {
      path: '/',
      maxAge: 3600,
      httpOnly: true
    });
    
    // Set a secure cookie
    response.cookies.set('test-cookie-secure', 'test-value', {
      path: '/',
      maxAge: 3600,
      httpOnly: true,
      secure: true
    });
    
    // Set a cookie with domain
    response.cookies.set('test-cookie-domain', 'test-value', {
      path: '/',
      maxAge: 3600,
      httpOnly: true,
      secure: true,
      domain: hostname.startsWith('www.') ? hostname : undefined
    });
    
    // Set a cookie with domain including subdomain
    const rootDomain = hostname.replace(/^www\./, '');
    response.cookies.set('test-cookie-root-domain', 'test-value', {
      path: '/',
      maxAge: 3600,
      httpOnly: true,
      secure: true,
      domain: rootDomain
    });
    
    return response;
  } catch (error) {
    console.error('Debug cookie error:', error);
    return NextResponse.json({ 
      error: 'Failed to set test cookies',
      message: (error as Error).message
    }, { status: 500 });
  }
} 