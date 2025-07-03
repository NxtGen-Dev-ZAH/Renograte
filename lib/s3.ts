import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Only create the S3 client on the server side
const s3Client = typeof window === 'undefined' ? new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Increase timeouts for large file uploads
  requestHandler: {
    requestTimeout: 15 * 60 * 1000, // 15 minutes
  },
}) : null;

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!;

export async function uploadFileToS3(file: File, prefix: string = 'listings/'): Promise<string> {
  try {
    // Generate a unique filename with the original extension
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop()?.toLowerCase() || '';
    const fileName = `${prefix}${uuidv4()}.${fileExtension}`;

    console.log(`Starting upload for file: ${originalName} (${file.size} bytes) to ${fileName}`);
    
    // Client-side: Use the API endpoint to handle the upload
    if (typeof window !== 'undefined') {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prefix', prefix);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }
      
      const data = await response.json();
      return data.fileKey;
    }
    
    // Server-side: Direct S3 upload (this code only runs on the server)
    if (!s3Client) {
      throw new Error('S3 client is not available on the client side');
    }
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Set up the S3 upload command with appropriate content type
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: uint8Array,
      ContentType: file.type,
      // Add metadata to track original filename
      Metadata: {
        'original-name': encodeURIComponent(originalName)
      }
    });

    // Upload to S3 with retry logic
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
      try {
        await s3Client.send(command);
        console.log(`Successfully uploaded ${fileName} to S3`);
        return fileName;
      } catch (uploadError) {
        retries++;
        if (retries > maxRetries) {
          throw uploadError;
        }
        console.log(`Upload attempt ${retries} failed, retrying...`);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }
    
    throw new Error("Upload failed after multiple retries");
  } catch (error) {
    console.error("Error in uploadFileToS3:", error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSignedFileUrl(fileKey: string): Promise<string> {
  try {
    console.log(`Generating signed URL for file: ${fileKey}`);
    
    // If the fileKey is already a URL (starts with http or /api), return it as is
    if (fileKey.startsWith('http') || fileKey.startsWith('/api')) {
      console.log('File key is already a URL, returning as is');
      return fileKey;
    }
    
    // If on client side, use the API endpoint
    if (typeof window !== 'undefined') {
      return `/api/s3-proxy?key=${encodeURIComponent(fileKey)}`;
    }
    
    if (!s3Client) {
      throw new Error('S3 client is not available');
    }
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    // Increase expiration time to 24 hours for better reliability
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 86400 });
    
    console.log(`Successfully generated signed URL with 24-hour expiration`);
    return signedUrl;
  } catch (error) {
    console.error(`Error generating signed URL for ${fileKey}:`, error);
    throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadMultipleFilesToS3(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFileToS3(file));
  return await Promise.all(uploadPromises);
} 