import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getContractBySigningToken } from "@/lib/contracts/contractService";

const prisma = new PrismaClient();

// GET /api/contracts/token/[token] - Get contract data from a token
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    // Get token from params
    const token = params.token;
    
    // URL decode the token first
    const decodedToken = decodeURIComponent(token);
    
    try {
      // Get contract info from token
      const tokenInfo = await getContractBySigningToken(decodedToken);
      
      // Get the contract with sections for the specific role
      const contract = await prisma.contract.findUnique({
        where: { id: tokenInfo.contractId },
        include: {
          sections: {
            where: tokenInfo.role ? { role: tokenInfo.role } : undefined,
            include: {
              signature: true,
            },
            orderBy: {
              pageNumber: 'asc',
            },
          },
        },
      });
      
      if (!contract) {
        return NextResponse.json(
          { error: "Contract not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        ...contract,
        signerEmail: tokenInfo.email,
        signerName: tokenInfo.name,
      });
    } catch (error) {
      console.error("Error processing token:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching contract from token:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    );
  }
} 