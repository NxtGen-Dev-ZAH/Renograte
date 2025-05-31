import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getSignedFileUrl } from '@/lib/s3';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    
    // Decode the token to get contractId
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [contractId] = decoded.split(':');
      
      if (!contractId) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 400 }
        );
      }
      
      // Get the contract to verify it exists and get the document key
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        select: { documentUrl: true }
      });
      
      if (!contract || !contract.documentUrl) {
        return NextResponse.json(
          { error: "Contract document not found" },
          { status: 404 }
        );
      }
      
      // Get signed URL for the document
      const signedUrl = await getSignedFileUrl(contract.documentUrl);
      
      // Redirect to the signed URL
      return NextResponse.redirect(signedUrl);
    } catch (error) {
      console.error("Error decoding token:", error);
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error accessing contract document:", error);
    return NextResponse.json(
      { error: "Failed to access document" },
      { status: 500 }
    );
  }
} 