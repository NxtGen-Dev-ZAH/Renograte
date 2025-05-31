import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/contracts/sign - Sign a contract section from a token
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, sectionId, signatureData, signerName, signerEmail } = body;
    
    if (!token || !sectionId || !signatureData || !signerName || !signerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Decode the token to get contractId and role
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [contractId, signerRole] = decoded.split(':');
      
      if (!contractId || !signerRole) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 400 }
        );
      }
      
      // Check if this token has already been used for this section
      const existingSignature = await prisma.contractSignature.findFirst({
        where: {
          contractId,
          sectionId,
          signerRole,
        },
      });
      
      if (existingSignature) {
        return NextResponse.json(
          { error: "This section has already been signed", alreadySigned: true },
          { status: 400 }
        );
      }
      
      // Start a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create signature
        const signature = await tx.contractSignature.create({
          data: {
            contractId,
            sectionId,
            signatureData,
            signerName,
            signerEmail,
            signerRole,
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
            // Token is tracked in the application logic, not in the database
          },
        });

        // Update section status
        await tx.contractSection.update({
          where: { id: sectionId },
          data: {
            status: "SIGNED",
            updatedAt: new Date(),
          },
        });

        // Check if all required sections are signed
        const contract = await tx.contract.findUnique({
          where: { id: contractId },
          include: {
            sections: true,
          },
        });

        // Update contract status based on signatures
        if (contract) {
          const allRequiredSections = contract.sections.filter(section => section.required);
          const allRequiredSectionsSigned = allRequiredSections.every(section => section.status === "SIGNED");
          
          const newStatus = allRequiredSectionsSigned 
            ? "FULLY_EXECUTED" 
            : "IN_PROGRESS";
          
          await tx.contract.update({
            where: { id: contractId },
            data: {
              status: newStatus,
              updatedAt: new Date(),
            },
          });
        }

        return signature;
      });
      
      return NextResponse.json({
        ...result,
        success: true,
        message: "Signature saved successfully"
      });
    } catch (error) {
      console.error("Error decoding token:", error);
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error signing contract section:", error);
    return NextResponse.json(
      { error: "Failed to sign contract section" },
      { status: 500 }
    );
  }
} 