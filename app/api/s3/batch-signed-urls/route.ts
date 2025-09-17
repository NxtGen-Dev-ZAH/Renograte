import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getSignedFileUrl } from '../../../../lib/s3';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number = 50, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = `batch-s3:${identifier}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access files' },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(session.user.id, 50, 60000)) { // 50 requests per minute
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { keys } = await request.json();

    if (!keys || !Array.isArray(keys)) {
      return NextResponse.json(
        { error: 'Keys array is required' },
        { status: 400 }
      );
    }

    // Validate keys format and limit
    if (keys.length === 0) {
      return NextResponse.json(
        { error: 'At least one key is required' },
        { status: 400 }
      );
    }

    if (keys.length > 20) {
      return NextResponse.json(
        { error: 'Too many keys requested. Maximum 20 allowed.' },
        { status: 400 }
      );
    }

    // Validate key format (basic security check)
    const validKeyPattern = /^[a-zA-Z0-9\/\-_\.]+$/;
    for (const key of keys) {
      if (typeof key !== 'string' || !validKeyPattern.test(key)) {
        return NextResponse.json(
          { error: 'Invalid key format detected' },
          { status: 400 }
        );
      }
    }

    // Generate signed URLs for all keys in parallel with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
    });

    const signedUrlsPromise = Promise.all(
      keys.map(async (key: string) => {
        try {
          const signedUrl = await getSignedFileUrl(key);
          return { key, url: signedUrl, success: true };
        } catch (error) {
          console.error(`Error generating signed URL for key ${key}:`, error);
          return { 
            key, 
            url: '', 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      })
    );

    const signedUrls = await Promise.race([signedUrlsPromise, timeoutPromise]) as any[];

    // Check if any URLs failed
    const failedCount = signedUrls.filter(url => !url.success).length;
    const successCount = signedUrls.length - failedCount;

    return NextResponse.json({
      success: true,
      signedUrls,
      stats: {
        total: signedUrls.length,
        successful: successCount,
        failed: failedCount
      }
    });

  } catch (error) {
    console.error('Error in batch signed URL generation:', error);
    
    // Handle timeout specifically
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Request timeout. Please try again with fewer keys.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate signed URLs' },
      { status: 500 }
    );
  }
}
