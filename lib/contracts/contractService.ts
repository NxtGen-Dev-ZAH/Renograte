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
export async function generateSigningLink(contractId: string, role: ContractRole): Promise<string> {
  // Create a token by encoding the contractId and role
  const token = Buffer.from(`${contractId}:${role}`).toString('base64');
  
  // Return the signing URL path
  return `/sign/${token}`;
}

// Get contract by signing token
export async function getContractBySigningToken(token: string) {
  try {
    // Decode the token to get contractId and role
    const decoded = Buffer.from(token, 'base64').toString();
    const [contractId, role] = decoded.split(':');
    
    if (!contractId) {
      throw new Error('Invalid token');
    }
    
    return {
      contractId,
      role: role as ContractRole | undefined
    };
  } catch (error) {
    throw new Error('Invalid token format');
  }
} 