import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/contracts/[id] - Get a specific contract
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Corrected: params.id is directly accessible, no need to await
    const id = (await params).id; 
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Using type assertion to avoid TypeScript errors
    const prismaAny = prisma as any;
    
    const contract = await prismaAny.contract.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            signature: true,
          },
          orderBy: {
            pageNumber: 'asc',
          },
        },
        signatures: true,
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
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    );
  }
}

// POST /api/contracts/[id] - Sign a contract section
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Corrected: params.id is directly accessible, no need to await
    const id = params.id;
    const body = await request.json();
    const { sectionId, signatureData, signerName, signerEmail, signerRole } = body;
    
    if (!sectionId || !signatureData || !signerName || !signerEmail || !signerRole) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Using type assertion to avoid TypeScript errors
    const prismaAny = prisma as any;
    
    // Start a transaction
    const result = await prismaAny.$transaction(async (tx: any) => {
      // Create signature
      const signature = await tx.contractSignature.create({
        data: {
          contractId: id,
          sectionId,
          signatureData,
          signerName,
          signerEmail,
          signerRole,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      });

      // Update section status
      await tx.contractSection.update({
        where: { id: sectionId },
        data: {
          status: "SIGNED",
        },
      });

      // Check if all required sections are signed
      const contract = await tx.contract.findUnique({
        where: { id },
        include: {
          sections: true,
        },
      });

      // Update contract status based on signatures
      if (contract) {
        const allRequiredSections = contract.sections.filter((section: any) => section.required);
        const allRequiredSectionsSigned = allRequiredSections.every((section: any) => section.status === "SIGNED");
        
        const newStatus = allRequiredSectionsSigned 
          ? "FULLY_EXECUTED" 
          : "IN_PROGRESS";
        
        await tx.contract.update({
          where: { id },
          data: {
            status: newStatus,
          },
        });
      }

      return signature;
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error signing contract section:", error);
    return NextResponse.json(
      { error: "Failed to sign contract section" },
      { status: 500 }
    );
  }
}

