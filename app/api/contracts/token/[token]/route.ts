import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/contracts/token/[token] - Get contract data from a token
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    
    // Decode the token to get contractId and role
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [contractId, role] = decoded.split(':');
      
      if (!contractId) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 400 }
        );
      }
      
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
          sections: {
            where: role ? { role } : undefined,
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
      
      return NextResponse.json(contract);
    } catch (error) {
      console.error("Error decoding token:", error);
      return NextResponse.json(
        { error: "Invalid token format" },
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