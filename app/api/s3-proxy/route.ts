import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSignedFileUrl } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const authToken = request.headers.get("authorization")?.split(' ')[1];
    const isContractDocument = key?.startsWith('contracts/');
    const isCourseContent = key?.startsWith('courses/');
    
    if (!key) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 });
    }
    
    // Allow access to contract documents with authorization token or for authenticated users
    // For course content and other files, require authentication
    if (!isContractDocument) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (isContractDocument && !authToken) {
      // For contract documents, check for internal API token if no session
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id && authToken !== process.env.INTERNAL_API_TOKEN) {
        console.log("Unauthorized access attempt to contract document");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    
    console.log(`Accessing file via S3 proxy: ${key}`);
    
    // Get signed URL for the file
    const signedUrl = await getSignedFileUrl(key);
    
    // For contract documents, fetch and return the content directly
    if (isContractDocument) {
      const response = await fetch(signedUrl);
      
      if (!response.ok) {
        console.error(`Failed to fetch document: ${response.status} ${response.statusText}`);
        return NextResponse.json({ error: "Failed to fetch document" }, { status: response.status });
      }
      
      const contentType = response.headers.get('content-type');
      const data = await response.arrayBuffer();
      
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': contentType || 'application/pdf',
          'Content-Disposition': 'inline',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    // For course thumbnails, serve directly with appropriate caching
    if (isCourseContent && key.includes('thumbnails/')) {
      const response = await fetch(signedUrl);
      
      if (!response.ok) {
        console.error(`Failed to fetch thumbnail: ${response.status} ${response.statusText}`);
        return NextResponse.json({ error: "Failed to fetch thumbnail" }, { status: response.status });
      }
      
      const contentType = response.headers.get('content-type');
      const data = await response.arrayBuffer();
      
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        }
      });
    }
    
    // For other files, redirect to the signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Error proxying S3 file:", error);
    return NextResponse.json({ error: "Failed to access file" }, { status: 500 });
  }
} 