import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getSignedFileUrl } from '@/lib/s3';
import { getContractBySigningToken } from '@/lib/contracts/contractService';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Get token from params and await it
    const token = params.token;
    console.log(`Document access request for token: ${token}`);
    
    // URL decode the token first
    const decodedToken = decodeURIComponent(token);
    console.log(`Decoded token: ${decodedToken}`);
    
    try {
      // Get contract info from token
      const tokenInfo = await getContractBySigningToken(decodedToken);
      console.log(`Contract ID from token: ${tokenInfo.contractId}`);
      
      // Get the contract to verify it exists and get the document key
      const contract = await prisma.contract.findUnique({
        where: { id: tokenInfo.contractId },
        select: { documentUrl: true }
      });
      
      if (!contract || !contract.documentUrl) {
        console.error(`Contract or document URL not found for ID: ${tokenInfo.contractId}`);
        return NextResponse.json(
          { error: "Contract document not found" },
          { status: 404 }
        );
      }
      
      console.log(`Document URL from contract: ${contract.documentUrl}`);
      
      // Handle different types of document URLs
      let finalUrl;
      if (contract.documentUrl.startsWith('/api/s3-proxy')) {
        // If it's a proxy URL, we need to call our own API
        const proxyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${contract.documentUrl}`, {
          headers: {
            // Add authorization if needed for the proxy
            'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN || ''}`
          }
        });
        
        if (!proxyResponse.ok) {
          console.error(`Failed to fetch document from proxy: ${proxyResponse.status} ${proxyResponse.statusText}`);
          return NextResponse.json(
            { error: "Failed to fetch document from proxy" },
            { status: proxyResponse.status }
          );
        }
        
        // Return the PDF data directly from the proxy
        const contentType = proxyResponse.headers.get('content-type');
        const data = await proxyResponse.arrayBuffer();
        
        return new NextResponse(data, {
          status: 200,
          headers: {
            'Content-Type': contentType || 'application/pdf',
            'Content-Disposition': 'inline',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      } else {
        // Get signed URL for the document if it's a direct S3 key
        const signedUrl = await getSignedFileUrl(contract.documentUrl);
        console.log(`Generated signed URL (first 50 chars): ${signedUrl.substring(0, 50)}...`);
        
        // Return the document content directly instead of redirecting
        // This avoids CORS issues and ensures the PDF is properly loaded
        const response = await fetch(signedUrl);
        
        if (!response.ok) {
          console.error(`Failed to fetch document from S3: ${response.status} ${response.statusText}`);
          return NextResponse.json(
            { error: "Failed to fetch document from storage" },
            { status: response.status }
          );
        }
        
        const contentType = response.headers.get('content-type');
        const data = await response.arrayBuffer();
        
        // Return the PDF data directly
        return new NextResponse(data, {
          status: 200,
          headers: {
            'Content-Type': contentType || 'application/pdf',
            'Content-Disposition': 'inline',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    } catch (error) {
      console.error("Error processing token:", error);
      return NextResponse.json(
        { error: "Invalid or expired token", details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error accessing contract document:", error);
    return NextResponse.json(
      { error: "Failed to access document", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 