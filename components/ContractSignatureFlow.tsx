"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pen, Mail, Check, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SignatureDialog from "@/components/SignatureDialog";
import { ContractRole } from "@/lib/contracts/contractService";

interface ContractSection {
  id: string;
  title: string;
  description?: string;
  pageNumber: number;
  role: ContractRole;
  required: boolean;
  status: "PENDING" | "SIGNED";
  signature?: {
    id: string;
    signerName: string;
    signerEmail: string;
    signerRole: ContractRole;
    signedAt: Date;
  };
}

interface Contract {
  id: string;
  title: string;
  description?: string;
  documentUrl: string;
  status: "PENDING" | "IN_PROGRESS" | "FULLY_EXECUTED";
  createdAt: Date;
  sections: ContractSection[];
}

interface SigningParty {
  role: ContractRole;
  name: string;
  email: string;
}

interface ContractSignatureFlowProps {
  contract: Contract;
  onSignSection: (sectionId: string, signatureData: string) => Promise<void>;
  onSendSigningLink: (role: ContractRole, email: string, name: string) => Promise<string>;
  currentUserRole?: ContractRole;
  isAgent?: boolean;
}

export default function ContractSignatureFlow({
  contract,
  onSignSection,
  onSendSigningLink,
  currentUserRole,
  isAgent = false,
}: ContractSignatureFlowProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string>("");
  const [signingParties, setSigningParties] = useState<Record<ContractRole, SigningParty>>({
    BUYER: { role: "BUYER", name: "", email: "" },
    SELLER: { role: "SELLER", name: "", email: "" },
    CONTRACTOR: { role: "CONTRACTOR", name: "", email: "" },
    AGENT: { role: "AGENT", name: "", email: "" },
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sentEmails, setSentEmails] = useState<Record<ContractRole, boolean>>({
    BUYER: false,
    SELLER: false,
    CONTRACTOR: false,
    AGENT: false,
  });
  const { toast } = useToast();

  // Group sections by role
  const sectionsByRole = contract.sections.reduce((acc, section) => {
    if (!acc[section.role]) {
      acc[section.role] = [];
    }
    acc[section.role].push(section);
    return acc;
  }, {} as Record<ContractRole, ContractSection[]>);

  // Calculate signature progress
  const totalRequiredSections = contract.sections.filter(s => s.required).length;
  const signedRequiredSections = contract.sections.filter(s => s.required && s.status === "SIGNED").length;
  const progressPercentage = totalRequiredSections > 0 
    ? Math.round((signedRequiredSections / totalRequiredSections) * 100) 
    : 0;

  // Handle opening signature dialog
  const handleSignatureOpen = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setSignatureDialogOpen(true);
  };

  // Handle saving signature
  const handleSignatureSave = async (signatureData: string) => {
    try {
      await onSignSection(currentSectionId, signatureData);
      toast({
        title: "Signature Saved",
        description: "Your signature has been added to the document.",
      });
    } catch (error) {
      console.error("Error saving signature:", error);
      toast({
        title: "Error",
        description: "Failed to save signature. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle sending signing link
  const handleSendSigningLink = async (role: ContractRole) => {
    const party = signingParties[role];
    
    if (!party.email || !party.name) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and email for the signing party.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSendingEmail(true);
      await onSendSigningLink(role, party.email, party.name);
      
      setSentEmails(prev => ({
        ...prev,
        [role]: true,
      }));
      
      toast({
        title: "Signing Link Sent",
        description: `A signing link has been sent to ${party.email}`,
      });
    } catch (error) {
      console.error("Error sending signing link:", error);
      toast({
        title: "Error",
        description: "Failed to send signing link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Update signing party information
  const updateSigningParty = (role: ContractRole, field: "name" | "email", value: string) => {
    setSigningParties(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signing">Signing</TabsTrigger>
          {isAgent && <TabsTrigger value="manage">Manage Signers</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{contract.title}</h3>
                  {contract.description && (
                    <p className="text-sm text-muted-foreground mt-1">{contract.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={contract.status === "FULLY_EXECUTED" ? "default" : "outline"}>
                    {contract.status.replace("_", " ")}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created on {new Date(contract.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Signature Progress</h4>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {signedRequiredSections} of {totalRequiredSections} required signatures completed ({progressPercentage}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(sectionsByRole).map(([role, sections]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {role.charAt(0) + role.slice(1).toLowerCase()} Sections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sections.map(section => (
                      <div key={section.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{section.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Page {section.pageNumber}
                            {section.required ? " (Required)" : " (Optional)"}
                          </p>
                        </div>
                        {section.status === "SIGNED" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <Check className="h-3 w-3 mr-1" />
                            Signed
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="signing" className="space-y-6">
          {currentUserRole ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Signature Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sectionsByRole[currentUserRole]?.map(section => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{section.title}</h3>
                          {section.description && (
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                          )}
                          <p className="text-sm mt-2">Page {section.pageNumber}</p>
                        </div>
                        <div>
                          {section.status === "SIGNED" ? (
                            <div className="border border-gray-200 rounded-md p-2">
                              <Image
                                src={section.signature?.id ? `data:image/png;base64,${section.signature.id}` : "/placeholder-signature.png"}
                                alt="Signature"
                                width={200}
                                height={64}
                                className="max-h-16"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Signed on {section.signature?.signedAt ? new Date(section.signature.signedAt).toLocaleDateString() : ""}
                              </p>
                            </div>
                          ) : (
                            <Button onClick={() => handleSignatureOpen(section.id)}>
                              <Pen className="mr-2 h-4 w-4" />
                              Sign Document
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!sectionsByRole[currentUserRole] || sectionsByRole[currentUserRole].length === 0) && (
                    <div className="text-center py-8">
                      <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p>No signature sections assigned to your role.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Role Assigned</h3>
              <p className="text-muted-foreground">
                You don&apos;t have a role assigned for this contract.
                {isAgent && " Please assign yourself a role in the Manage Signers tab."}
              </p>
            </div>
          )}
        </TabsContent>

        {isAgent && (
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Signing Parties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {Object.entries(sectionsByRole).map(([role, sections]) => {
                    // Only show roles that have pending signatures
                    const hasPendingSignatures = sections.some(section => section.status === "PENDING");
                    if (!hasPendingSignatures) return null;
                    
                    const party = signingParties[role as ContractRole];
                    return (
                      <div key={role} className="space-y-4">
                        <h3 className="font-medium">{role.charAt(0) + role.slice(1).toLowerCase()}</h3>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`${role}-name`}>Name</Label>
                            <Input
                              id={`${role}-name`}
                              value={party.name}
                              onChange={(e) => updateSigningParty(party.role, "name", e.target.value)}
                              placeholder={`${role.charAt(0) + role.slice(1).toLowerCase()} name`}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`${role}-email`}>Email</Label>
                            <Input
                              id={`${role}-email`}
                              type="email"
                              value={party.email}
                              onChange={(e) => updateSigningParty(party.role, "email", e.target.value)}
                              placeholder={`${role.charAt(0) + role.slice(1).toLowerCase()} email`}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleSendSigningLink(party.role)}
                            disabled={!party.email || !party.name || sendingEmail || sentEmails[party.role]}
                            variant={sentEmails[party.role] ? "outline" : "default"}
                          >
                            {sentEmails[party.role] ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Link Sent
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Signing Link
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-2">Assigned Sections</h4>
                          <div className="space-y-2">
                            {sections.map(section => (
                              <div key={section.id} className="flex items-center justify-between text-sm p-2 border rounded-md">
                                <span>{section.title} (Page {section.pageNumber})</span>
                                {section.status === "SIGNED" ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <Check className="h-3 w-3 mr-1" />
                                    Signed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <SignatureDialog
        isOpen={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onSave={handleSignatureSave}
        title="Sign Document"
        description="Please sign below to complete this section of the document"
      />
    </div>
  );
} 