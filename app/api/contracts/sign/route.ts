import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getContractBySigningToken } from "@/lib/contracts/contractService";

const prisma = new PrismaClient();

// Type for the extended transaction that includes contractSigningToken
type ExtendedTransaction = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> & {
  contractSigningToken: {
    update: Function;
  }
};

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
    
    try {
      // URL decode the token first
      const decodedToken = decodeURIComponent(token);
      
      // Get contract info from token
      const tokenInfo = await getContractBySigningToken(decodedToken);
      
      // Check if this section has already been signed
      const existingSignature = await prisma.contractSignature.findFirst({
        where: {
          contractId: tokenInfo.contractId,
          sectionId,
          signerRole: tokenInfo.role,
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
            contractId: tokenInfo.contractId,
            sectionId,
            signatureData,
            signerName,
            signerEmail,
            signerRole: tokenInfo.role,
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
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

        // Mark token as used
        await (tx as ExtendedTransaction).contractSigningToken.update({
          where: { token: decodedToken },
          data: { isUsed: true }
        });

        // Check if all required sections are signed
        const contract = await tx.contract.findUnique({
          where: { id: tokenInfo.contractId },
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
            where: { id: tokenInfo.contractId },
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
      console.error("Error processing token:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
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