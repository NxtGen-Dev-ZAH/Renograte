"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SignatureDialog from "@/components/SignatureDialog";
import { ContractRole } from "@/lib/contracts/contractService";
import { Pen, Check, Clock } from "lucide-react";

export default function SigningPage({ params }: { params: Promise<{ token: string }> }) {
  // Extract token safely with handling for Promise
  const [token, setToken] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string>("");
  const [signerRole, setSignerRole] = useState<ContractRole | null>(null);
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Extract token from params when component mounts
  useEffect(() => {
    async function getToken() {
      try {
        const resolvedParams = await params;
        setToken(resolvedParams.token);
      } catch (error) {
        console.error("Error resolving token:", error);
        toast({
          title: "Error",
          description: "Invalid signing link",
          variant: "destructive",
        });
      }
    }
    
    getToken();
  }, [params, toast]);

  useEffect(() => {
    if (token) {
      loadContract();
    }
  }, [token]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contracts/token/${token}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Invalid Link",
            description: "This signing link is invalid or has expired.",
            variant: "destructive",
          });
          return;
        }
        throw new Error('Failed to load contract');
      }
      
      const contractData = await response.json();
      setContract(contractData);
      
      // Auto-fill name and email if provided in the token
      if (contractData.signerName) {
        setSignerName(contractData.signerName);
      }
      
      if (contractData.signerEmail) {
        setSignerEmail(contractData.signerEmail);
      }
      
      // Extract role from token data
      if (contractData.sections && contractData.sections.length > 0) {
        setSignerRole(contractData.sections[0].role);
      }
    } catch (error) {
      console.error("Error loading contract:", error);
      toast({
        title: "Error",
        description: "Failed to load the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureOpen = (sectionId: string) => {
    if (!signerName || !signerEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email before signing.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentSectionId(sectionId);
    setSignatureDialogOpen(true);
  };

  const handleSignatureSave = async (signatureData: string) => {
    try {
      if (!signerRole) {
        throw new Error("No signer role identified");
      }
      
      if (!token) {
        throw new Error("Invalid signing token");
      }
      
      const response = await fetch('/api/contracts/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          sectionId: currentSectionId,
          signatureData,
          signerName,
          signerEmail,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (result.alreadySigned) {
          setAlreadySigned(true);
          toast({
            title: "Already Signed",
            description: "This section has already been signed.",
            variant: "destructive",
          });
        } else {
          throw new Error(result.error || 'Failed to save signature');
        }
        return;
      }
      
      // Reload contract to get updated data
      await loadContract();
      
      // Check if all sections for this role are signed
      const pendingSections = contract?.sections.filter((section: any) => 
        section.status === "PENDING" && section.role === signerRole
      );
      
      if (pendingSections?.length === 0) {
        setSignatureComplete(true);
      }
      
      toast({
        title: "Signature Saved",
        description: "Your signature has been successfully recorded.",
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

  if (loading) {
    return (
      <div className="container mx-auto py-10 space-y-6 my-12 h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading Document...</h1>
          <p className="text-muted-foreground">Please wait while we prepare your document for signing.</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-10 space-y-6 h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Document Not Found</h1>
          <p className="text-muted-foreground">This signing link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const pendingSections = contract.sections.filter((section: any) => section.status === "PENDING");
  const signedSections = contract.sections.filter((section: any) => section.status === "SIGNED");
  const allSectionsSigned = pendingSections.length === 0;

  return (
    <div className="container mx-auto py-10 space-y-6 my-12">
      <Card>
        <CardHeader>
          <CardTitle>{contract.title}</CardTitle>
          <CardDescription>
            Please review and sign the document below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!allSectionsSigned && (
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-medium">Your Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signerEmail}
                      onChange={(e) => setSignerEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Signature Sections */}
              <div className="space-y-6">
                <h3 className="font-medium">Signature Required</h3>
                
                {allSectionsSigned || signatureComplete ? (
                  <div className="text-center py-6 bg-green-50 rounded-lg border border-green-100">
                    <Check className="mx-auto h-12 w-12 text-green-500 mb-2" />
                    <h3 className="text-lg font-medium text-green-700">All Sections Signed</h3>
                    <p className="text-green-600">Thank you for completing all required signatures.</p>
                    <p className="text-green-600 mt-2">This signing session is now complete.</p>
                  </div>
                ) : alreadySigned ? (
                  <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-100">
                    <Clock className="mx-auto h-12 w-12 text-yellow-500 mb-2" />
                    <h3 className="text-lg font-medium text-yellow-700">Already Signed</h3>
                    <p className="text-yellow-600">This contract has already been signed with this link.</p>
                    <p className="text-yellow-600 mt-2">Please contact the sender if you need to make changes.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSections.map((section: any) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{section.title}</h4>
                            {section.description && (
                              <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                            )}
                            <p className="text-sm mt-2">Page {section.pageNumber}</p>
                          </div>
                          <Button onClick={() => handleSignatureOpen(section.id)}>
                            <Pen className="mr-2 h-4 w-4" />
                            Sign Here
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {signedSections.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-medium mb-4">Completed Signatures</h3>
                    <div className="space-y-4">
                      {signedSections.map((section: any) => (
                        <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{section.title}</h4>
                              <p className="text-sm mt-1">Page {section.pageNumber}</p>
                            </div>
                            <div className="flex items-center">
                              <Check className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-sm text-green-700">Signed</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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