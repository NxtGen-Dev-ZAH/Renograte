import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSignedFileUrl } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const authToken = request.headers.get("authorization")?.split(' ')[1];
    const isContractDocument = key?.startsWith('contracts/');
    const isListingFile = key?.startsWith('listings/');
    const isRenovationPlan = key?.startsWith('renovation-plans/');
    const isRenovationQuote = key?.startsWith('renovation-quotes/');
    const isCourseContent = key?.startsWith('courses/');
    const isMarketingAsset = key?.startsWith('marketing/');
    
    if (!key) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 });
    }
    
    // For contract documents, listing files, renovation plans, and quotes, allow access with authorization token
    if ((isContractDocument || isListingFile || isRenovationPlan || isRenovationQuote) && authToken) {
      // If there's an auth token, check if it's the internal API token
      if (process.env.INTERNAL_API_TOKEN && authToken === process.env.INTERNAL_API_TOKEN) {
        console.log(`Authorized access to ${key} with API token`);
        // Continue with the request
      } else {
        // Check for user session as fallback
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
          console.log("Unauthorized access attempt - invalid token");
          return NextResponse.json({ error: "Unauthorized - invalid token" }, { status: 401 });
        }
      }
    } else if (!isContractDocument && !isListingFile && !isRenovationPlan && !isRenovationQuote && !isMarketingAsset) {
      // For other files, require user authentication
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized - authentication required" }, { status: 401 });
      }
    } else if (isMarketingAsset) {
      // For marketing assets, check user permissions
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized - authentication required" }, { status: 401 });
      }
      
      // Only admin, member, agent, contractor can access marketing assets
      if (!['admin', 'member', 'agent', 'contractor'].includes(session.user.role || '')) {
        return NextResponse.json({ error: "Forbidden - insufficient permissions" }, { status: 403 });
      }
    }
    
    console.log(`Accessing file via S3 proxy: ${key}`);
    
    // Get signed URL for the file
    const signedUrl = await getSignedFileUrl(key);
    
    // For contract documents, listing files, renovation plans, and quotes, fetch and return the content directly
    if (isContractDocument || isListingFile || isRenovationPlan || isRenovationQuote) {
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
          'Content-Type': contentType || (isRenovationPlan ? 'image/png' : 'application/pdf'),
          'Content-Disposition': 'inline',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    // For marketing assets, serve directly with appropriate content type
    if (isMarketingAsset) {
      const response = await fetch(signedUrl);
      
      if (!response.ok) {
        console.error(`Failed to fetch marketing asset: ${response.status} ${response.statusText}`);
        return NextResponse.json({ error: "Failed to fetch marketing asset" }, { status: response.status });
      }
      
      const contentType = response.headers.get('content-type');
      const data = await response.arrayBuffer();
      
      // Determine appropriate content type and disposition based on file type
      let responseContentType = contentType;
      let contentDisposition = 'inline';
      
      if (!responseContentType) {
        // Try to determine content type from file extension
        if (key.endsWith('.pdf')) {
          responseContentType = 'application/pdf';
        } else if (key.endsWith('.doc') || key.endsWith('.docx')) {
          responseContentType = 'application/msword';
        } else if (key.endsWith('.ppt') || key.endsWith('.pptx')) {
          responseContentType = 'application/vnd.ms-powerpoint';
        } else if (key.endsWith('.xls') || key.endsWith('.xlsx')) {
          responseContentType = 'application/vnd.ms-excel';
        } else if (key.endsWith('.mp4')) {
          responseContentType = 'video/mp4';
        } else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) {
          responseContentType = 'image/jpeg';
        } else if (key.endsWith('.png')) {
          responseContentType = 'image/png';
        } else if (key.endsWith('.gif')) {
          responseContentType = 'image/gif';
        } else {
          responseContentType = 'application/octet-stream';
        }
      }
      
      // For PDFs, add specific headers for better browser display
      const headers: HeadersInit = {
        'Content-Type': responseContentType,
        'Content-Disposition': contentDisposition,
        'Cache-Control': 'public, max-age=3600',
        'X-Frame-Options': 'SAMEORIGIN',
        'Access-Control-Allow-Origin': '*'
      };

      // For PDFs, add headers to ensure proper embedding in iframes
      if (key.endsWith('.pdf')) {
        headers['X-Content-Type-Options'] = 'nosniff';
        headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
        headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
      }
      
      // For email templates, add specific headers
      if (key.includes('/email_templates/') || key.includes('/email-templates/')) {
        headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
      }
      
      return new NextResponse(data, {
        status: 200,
        headers
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