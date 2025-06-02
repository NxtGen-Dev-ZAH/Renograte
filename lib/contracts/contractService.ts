import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";

// Contract role and status types
export type ContractRole = "BUYER" | "SELLER" | "CONTRACTOR" | "AGENT";
export type ContractStatus = "PENDING" | "IN_PROGRESS" | "FULLY_EXECUTED";
export type SectionStatus = "PENDING" | "SIGNED";

// Contract interface
export interface Contract {
  id: string;
  title: string;
  description?: string;
  documentUrl: string;
  status: ContractStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  sections: ContractSection[];
  signatures: ContractSignature[];
}

// Contract section interface
export interface ContractSection {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  pageNumber: number;
  role: ContractRole;
  required: boolean;
  status: SectionStatus;
  createdAt: Date;
  updatedAt: Date;
  signature?: ContractSignature;
}

// Contract signature interface
export interface ContractSignature {
  id: string;
  contractId: string;
  sectionId: string;
  signatureData: string;
  signerName: string;
  signerEmail: string;
  signerRole: ContractRole;
  signedAt: Date;
  ipAddress?: string;
}

// Create a new contract
export async function createContract(data: {
  title: string;
  description?: string;
  documentUrl: string;
  createdBy: string;
  sections: {
    title: string;
    description?: string;
    pageNumber: number;
    role: ContractRole;
    required?: boolean;
  }[];
}) {
  // Implementation of createContract function
}

// Get contract by ID with sections and signatures
export async function getContractById(id: string) {
  // Implementation of getContractById function
}

// Get all contracts
export async function getAllContracts() {
  // Implementation of getAllContracts function
}

// Sign a contract section
export async function signContractSection(data: {
  contractId: string;
  sectionId: string;
  signatureData: string;
  signerName: string;
  signerEmail: string;
  signerRole: ContractRole;
  ipAddress?: string;
}) {
  // Implementation of signContractSection function
}

// Generate signing link for a specific role
export async function generateSigningLink(
  contractId: string, 
  role: ContractRole,
  email?: string,
  name?: string
): Promise<string> {
  // Create a random token
  const randomToken = uuidv4();
  
  // Store token in the database with expiration date (7 days)
  await prisma.contractSigningToken.create({
    data: {
      token: randomToken,
      contractId,
      role,
      email,
      name,
      expiresAt: addDays(new Date(), 7),
    }
  });
  
  // Return the signing URL path with the token
  return `/sign/${encodeURIComponent(randomToken)}`;
}

// Get contract by signing token
export async function getContractBySigningToken(token: string) {
  try {
    // URL decode the token first
    const decodedToken = decodeURIComponent(token);
    
    // Find the token in the database
    const tokenRecord = await prisma.contractSigningToken.findUnique({
      where: { token: decodedToken },
      include: { contract: true }
    });
    
    if (!tokenRecord) {
      throw new Error('Invalid or expired token');
    }
    
    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new Error('Token has expired');
    }
    
    return {
      contractId: tokenRecord.contractId,
      role: tokenRecord.role as ContractRole,
      email: tokenRecord.email,
      name: tokenRecord.name,
      isUsed: tokenRecord.isUsed
    };
  } catch (error) {
    throw new Error('Invalid token format or expired token');
  }
} 