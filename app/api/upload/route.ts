import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client (server-side only)
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  requestHandler: {
    requestTimeout: 15 * 60 * 1000, // 15 minutes
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!;

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const prefix = formData.get('prefix') as string || 'uploads/';
    
    // Check if this is a marketing asset upload
    if (prefix.startsWith('marketing/')) {
      // Only admins can upload marketing assets
      if (session.user.role !== 'admin') {
        return NextResponse.json({ error: "Only admins can upload marketing assets" }, { status: 403 });
      }
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a unique filename with the original extension
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop()?.toLowerCase() || '';
    const fileName = `${prefix}${uuidv4()}.${fileExtension}`;

    console.log(`Server uploading: ${originalName} (${file.size} bytes) to ${fileName}`);

    // Convert file to buffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set up the S3 upload command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        'original-name': encodeURIComponent(originalName),
        'uploaded-by': session.user.email || 'unknown',
        'upload-type': prefix.split('/')[0]
      }
    });

    // Upload to S3 with retry logic
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
      try {
        await s3Client.send(command);
        console.log(`Successfully uploaded ${fileName} to S3`);
        
        // Return appropriate response based on upload type
        if (prefix.startsWith('marketing/')) {
          return NextResponse.json({ 
            success: true, 
            fileKey: fileName,
            fileUrl: `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`
          });
        } else {
          return NextResponse.json({ success: true, fileKey: fileName });
        }
      } catch (uploadError) {
        retries++;
        if (retries > maxRetries) {
          console.error("S3 upload error:", uploadError);
          return NextResponse.json({ 
            error: `Failed to upload file after ${maxRetries} attempts` 
          }, { status: 500 });
        }
        console.log(`Upload attempt ${retries} failed, retrying...`);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }
    
    return NextResponse.json({ error: "Upload failed after multiple retries" }, { status: 500 });
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json({ 
      error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser as we're handling multipart form data
  },
}; 