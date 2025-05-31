import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSignedFileUrl } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    
    if (!key) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 });
    }
    
    // Get signed URL for the file
    const signedUrl = await getSignedFileUrl(key);
    
    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Error proxying S3 file:", error);
    return NextResponse.json({ error: "Failed to access file" }, { status: 500 });
  }
} 