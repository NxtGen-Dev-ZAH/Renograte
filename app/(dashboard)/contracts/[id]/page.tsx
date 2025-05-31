"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Download, Share2, Check, Clock, AlertTriangle } from "lucide-react";
import ContractSignatureFlow from "@/components/ContractSignatureFlow";
import { ContractRole } from "@/lib/contracts/contractService";
import { Skeleton } from "@/components/ui/skeleton";
import { PDFViewer } from "@/components/PDFViewer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params with React.use() to properly access id
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<ContractRole | undefined>("AGENT"); // Hardcoded for demo, should be based on auth
  const [isAgent, setIsAgent] = useState(true); // Hardcoded for demo, should be based on auth

  useEffect(() => {
    if (id) {
      loadContract();
    }
  }, [id]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contracts/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Not Found",
            description: "The requested contract could not be found.",
            variant: "destructive",
          });
          router.push("/contracts");
          return;
        }
        throw new Error('Failed to fetch contract');
      }
      
      const contractData = await response.json();
      setContract(contractData);
    } catch (error) {
      console.error("Error loading contract:", error);
      toast({
        title: "Error",
        description: "Failed to load contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignSection = async (sectionId: string, signatureData: string) => {
    try {
      if (!currentUserRole) {
        throw new Error("No role assigned");
      }
      
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId,
          signatureData,
          signerName: "Current User", // Should be from auth
          signerEmail: "user@example.com", // Should be from auth
          signerRole: currentUserRole,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign contract section');
      }
      
      // Reload contract to get updated data
      await loadContract();
      
      toast({
        title: "Success",
        description: "Contract section signed successfully.",
      });
    } catch (error) {
      console.error("Error signing section:", error);
      toast({
        title: "Error",
        description: "Failed to sign contract section. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSendSigningLink = async (role: ContractRole, email: string, name: string) => {
    try {
      // Send signing link via API
      const response = await fetch('/api/contracts/send-signing-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: id,
          role,
          email,
          name,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send signing link');
      }
      
      const data = await response.json();
      
      toast({
        title: "Signing Link Generated",
        description: `A link has been sent to ${email}.`,
      });
      
      return data.signingLink;
    } catch (error) {
      console.error("Error generating signing link:", error);
      toast({
        title: "Error",
        description: "Failed to send signing link. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDownloadPDF = () => {
    if (!contract || !contract.documentUrl) {
      toast({
        title: "Error",
        description: "Document URL not available",
        variant: "destructive",
      });
      return;
    }

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = contract.documentUrl;
    link.target = '_blank';
    link.download = `${contract.title.replace(/\s+/g, '_')}.pdf`;
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Contract not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/contracts")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const url = `${window.location.origin}/contracts/${id}`;
              navigator.clipboard.writeText(url);
              toast({
                title: "Link Copied",
                description: "Contract link copied to clipboard",
              });
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Preview */}
        <Card>
          <CardContent className="p-6">
            {contract.documentUrl ? (
              <PDFViewer url={contract.documentUrl} />
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                <p className="text-muted-foreground">No document available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature Flow */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Status</CardTitle>
              <CardDescription>
                Current status: {' '}
                <Badge variant={
                  contract.status === "FULLY_EXECUTED" 
                    ? "secondary" 
                    : contract.status === "IN_PROGRESS" 
                    ? "outline" 
                    : "default"
                }>
                  {contract.status === "FULLY_EXECUTED" 
                    ? "Fully Executed" 
                    : contract.status === "IN_PROGRESS" 
                    ? "In Progress" 
                    : "Draft"}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract.sections.map((section: any) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{section.title}</h4>
                          <Badge variant={
                            section.status === "SIGNED" 
                              ? "secondary" 
                              : "outline"
                          }>
                            {section.status === "SIGNED" ? "Signed" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.description || `Signature required from ${section.role}`}
                        </p>
                      </div>
                      {section.status === "SIGNED" && section.signature ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {section.signature.signerName.split(' ').map((n: string) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <p className="font-medium">{section.signature.signerName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(section.signature.createdAt), "MMM d, yyyy")}
                                  </p>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p>Signed by: {section.signature.signerName}</p>
                                <p>Email: {section.signature.signerEmail}</p>
                                <p>Date: {format(new Date(section.signature.createdAt), "MMM d, yyyy h:mm a")}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Awaiting signature</span>
                        </div>
                      )}
                    </div>
                    {section.status === "SIGNED" && section.signature && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-sm font-medium mb-2">Signature</p>
                        <div className="bg-gray-50 p-2 rounded-md">
                          <img 
                            src={section.signature.signatureData} 
                            alt="Signature" 
                            className="max-h-16"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <ContractSignatureFlow
            contract={contract}
            onSignSection={handleSignSection}
            onSendSigningLink={handleSendSigningLink}
            currentUserRole={currentUserRole}
            isAgent={isAgent}
          />
        </div>
      </div>
    </div>
  );
} 