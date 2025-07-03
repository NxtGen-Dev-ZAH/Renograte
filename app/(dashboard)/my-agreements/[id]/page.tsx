"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Share2, Clock, Mail, FileText } from "lucide-react";
import ContractSignatureFlow from "@/components/ContractSignatureFlow";
import { ContractRole } from "@/lib/contracts/contractService";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params with React.use() to properly access id
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
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
          router.push("/my-agreements");
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
      // Send signing link via API with PDF attachment
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
          attachPdf: true // Include PDF attachment in email
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send signing link');
      }
      
      const data = await response.json();
      
      toast({
        title: "Signing Link Generated",
        description: `A link has been sent to ${email} with the contract document attached.`,
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

  const handleSendDocumentEmail = async () => {
    if (!contract || !recipientEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide a recipient email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingEmail(true);
      
      const response = await fetch('/api/contracts/send-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract.id,
          documentUrl: contract.documentUrl,
          recipientEmail,
          recipientName,
          contractTitle: contract.title,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send document via email');
      }
      
      setEmailDialogOpen(false);
      toast({
        title: "Email Sent",
        description: `The document has been sent to ${recipientEmail}.`,
      });
    } catch (error) {
      console.error("Error sending document via email:", error);
      toast({
        title: "Error",
        description: "Failed to send the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!contract) {
      toast({
        title: "Error",
        description: "Contract data not available",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Preparing Document",
        description: "Generating PDF with signatures...",
      });

      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add title page with contract information
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("SIGNED AGREEMENT", pageWidth / 2, 40, { align: 'center' });
      
      doc.setFontSize(18);
      doc.text(contract.title, pageWidth / 2, 60, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 75, { align: 'center' });
      
      // Add contract details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Contract Details:", 20, 100);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${contract.id}`, 20, 110);
      doc.text(`Status: ${contract.status === "FULLY_EXECUTED" ? "Fully Executed" : contract.status}`, 20, 120);
      doc.text(`Created: ${new Date(contract.createdAt).toLocaleDateString()}`, 20, 130);
      
      // Add a page for each signature
      if (contract.sections && contract.sections.length > 0) {
        const signedSections = contract.sections.filter((section: any) => 
          section.status === "SIGNED" && section.signature && section.signature.signatureData
        );
        
        if (signedSections.length > 0) {
          // Add signature page
          doc.addPage();
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.text("SIGNATURES", pageWidth / 2, 30, { align: 'center' });
          
          let yPos = 50;
          
          // Add each signature with details
          for (const section of signedSections) {
            // Check if we need a new page
            if (yPos > pageHeight - 80) {
              doc.addPage();
              yPos = 50;
            }
            
            // Add section title and role
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`${section.role} Signature - ${section.title}`, 20, yPos);
            yPos += 10;
            
            // Add signature box
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(252, 252, 252);
            doc.roundedRect(20, yPos, 170, 50, 3, 3, 'FD');
            
            // Add signature image
            try {
              doc.addImage(section.signature.signatureData, "PNG", 30, yPos + 10, 100, 30);
            } catch (error) {
              console.error("Error adding signature image:", error);
              doc.text("(Signature unavailable)", 30, yPos + 25);
            }
            
            // Add signature metadata
            yPos += 60;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${section.signature.signerName}`, 20, yPos);
            yPos += 7;
            
            if (section.signature.signerEmail) {
              doc.text(`Email: ${section.signature.signerEmail}`, 20, yPos);
              yPos += 7;
            }
            
            if (section.signature.signedAt) {
              const signedDate = new Date(section.signature.signedAt).toLocaleDateString();
              const signedTime = new Date(section.signature.signedAt).toLocaleTimeString();
              doc.text(`Signed on: ${signedDate} at ${signedTime}`, 20, yPos);
              yPos += 7;
            }
            
            // Add section info
            doc.text(`Section: ${section.title} (Page ${section.pageNumber})`, 20, yPos);
            yPos += 20;
          }
        }
      }
      
      // If there's a document URL, add a reference page
      if (contract.documentUrl) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("ORIGINAL DOCUMENT", pageWidth / 2, 30, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text("The original document is available online in your agreements dashboard.", 20, 50);
        
        // Add QR code for the document URL (if needed)
        // This would require a QR code library
        
        // Add instructions for accessing the original
        doc.setFontSize(12);
        doc.text("To access the original document:", 20, 70);
        doc.text("1. Log in to your Renograte account", 25, 85);
        doc.text("2. Navigate to My Agreements", 25, 95);
        doc.text("3. Open this agreement", 25, 105);
        doc.text("4. Click 'Download Original Document'", 25, 115);
        
        // Add a note about the document
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text("This signed PDF serves as an official record of signatures for the agreement.", 20, 140);
        doc.text("The original document with these signatures is stored securely in the Renograte system.", 20, 150);
      }
      
      // Add footer with page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('Renograte® Agreement Document', 20, pageHeight - 10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      }
      
      // Save the PDF with a meaningful filename
      doc.save(`${contract.title.replace(/\s+/g, "_")}_signed.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your signed agreement has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
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
          onClick={() => router.push("/my-agreements")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Agreements
        </Button>
        <div className="flex gap-2">
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Email Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Document via Email</DialogTitle>
                <DialogDescription>
                  Enter the recipient's details to send the document as an email attachment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Recipient Name</Label>
                  <Input
                    id="name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient's name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Recipient Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter recipient's email"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setEmailDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendDocumentEmail}
                  disabled={sendingEmail || !recipientEmail}
                >
                  {sendingEmail ? "Sending..." : "Send Document"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Agreement PDF
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
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={contract.documentUrl}
                  className="w-full h-[400px]"
                  title="Document Preview"
                />
                <div className="p-4 bg-gray-50 border-t flex justify-center">
                  <Button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Document
                  </Button>
                </div>
              </div>
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
                                    {section.signature.createdAt ? 
                                      format(new Date(section.signature.createdAt), "MMM d, yyyy") : 
                                      "Hover to view details"}
                                  </p>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p>Signed by: {section.signature.signerName}</p>
                                <p>Email: {section.signature.signerEmail}</p>
                                <p>Date: {section.signature.signedAt ? 
                                  format(new Date(section.signature.signedAt), "MMM d, yyyy h:mm a") : 
                                  "Date unavailable"}
                                </p>
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