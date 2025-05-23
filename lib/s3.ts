import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!;

export async function uploadFileToS3(file: File, prefix: string = 'listings/'): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${prefix}${uuidv4()}.${fileExtension}`;

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: uint8Array,
    ContentType: file.type,
  });

  await s3Client.send(command);
  return fileName;
}

export async function getSignedFileUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
}

export async function uploadMultipleFilesToS3(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFileToS3(file));
  return await Promise.all(uploadPromises);
} 