"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import SignatureBox from "@/components/SignatureBox";
import { saveTermSheet } from "@/lib/contracts/service";

interface ServiceProviderFormData {
  // Parties Information
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  contractorName: string;
  contractorAddress: string;
  
  // Property Information
  propertyAddress: string;
  
  // Work Schedule
  startDate: string;
  estimatedCompletionDate: string;
  
  // Agreement Details
  agreementDate: string;
  agreementId: string;
  
  // Signatures
  sellerSignature: string;
  sellerSignDate: string;
  buyerSignature: string;
  buyerSignDate: string;
  contractorSignature: string;
  contractorSignDate: string;
}

interface AgreementHistory {
  formData: ServiceProviderFormData;
  timestamp: string;
}

export default function CreateServiceProviderAgreement() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [agreementHistory, setAgreementHistory] = useState<AgreementHistory[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<ServiceProviderFormData>({
    sellerName: "",
    sellerAddress: "",
    buyerName: "",
    buyerAddress: "",
    contractorName: "",
    contractorAddress: "",
    propertyAddress: "",
    startDate: "",
    estimatedCompletionDate: "",
    agreementDate: new Date().toISOString().split('T')[0],
    agreementId: `SPA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    sellerSignature: "",
    sellerSignDate: "",
    buyerSignature: "",
    buyerSignDate: "",
    contractorSignature: "",
    contractorSignDate: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const generatePDF = () => {
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = 40; // Start lower to accommodate logo
      
      // Helper function to add logo to each page
      const addLogoToPage = () => {
        // Add Renograte logo to top left of the page
        try {
          // Using a placeholder for logo - in production this should be a proper image path
          doc.addImage("/logo.png", "PNG", margin, 10, 40, 15);
        } catch (error) {
          console.error("Error adding logo:", error);
          // Fallback text if image fails
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("RENOGRATE®", margin, 15);
        }
      };
      
      // Add logo to first page
      addLogoToPage();
      
      // Helper function for adding text with proper wrapping and page breaks
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, contentWidth);
        
        // Check if we need to add a new page
        if (y + (lines.length * fontSize * 0.352778) > pageHeight - margin) {
          doc.addPage();
          y = 40; // Reset y position for new page with space for logo
          addLogoToPage(); // Add logo to new page
        }
        
        doc.text(lines, margin, y);
        y += (lines.length * fontSize * 0.352778) + 5;
      };
      
      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("RENOGRATE® SERVICE PROVIDER AGREEMENT", pageWidth/2, y, { align: "center" });
      y += 20;
      
      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      y = 50;

      // Introduction
      const introText = 'This Service Provider Agreement (\"Agreement\") is entered into by and between the Contractor or Service Provider (\"Contractor\"), the Property Owner (\"Seller\"), and/or the Prospective Buyer (\"Buyer\") of the real property listed below. This Agreement governs the scope of work, payment terms, warranties, and legal protections for renovation services performed prior to or during the sale process of the identified property.';
      addText(introText, 10);
      y += 10;

      // Property Address
      addText(`Property Address: ${formData.propertyAddress}`, 12);
      y += 10;

      // Work Schedule
      addText("Work Schedule", 12, true);
      addText("Start Date: " + formData.startDate);
      addText("Estimated Completion Date: " + formData.estimatedCompletionDate);

      // Sections
      addText("1. Scope of Work", 12, true);
      addText("The Contractor shall provide renovation services as agreed upon in a separate, signed Work Order approved by the Buyer and Seller before work begins.");

      addText("2. Work Schedule", 12, true);
      addText("Start Date: " + formData.startDate);
      addText("Estimated Completion Date: " + formData.estimatedCompletionDate);

      addText("3. Compensation and Payment Terms", 12, true);
      addText("Contractor shall be paid in full at the closing of the sale using proceeds from the transaction. An agreed portion of the Earnest Money Deposit (EMD) up to 50% may be released to the Contractor as a down payment if authorized through escrow instructions.");

      addText("4. Approval and Quality Assurance", 12, true);
      addText("Buyer may inspect and approve all completed work prior to closing. Contractor must address any deficiencies promptly.");

      addText("5. Warranties & Insurance", 12, true);
      addText("Contractor warrants that all work will be performed in a professional, workmanlike manner and compliant with applicable codes. Contractor affirms possession of proper licensing, general liability insurance, and workers' compensation coverage, and shall provide proof upon request.");

      addText("6. Independent Contractor Status", 12, true);
      addText("Contractor is not an employee or agent of Renograte LLC or any real estate professional. Contractor is solely responsible for legal and tax obligations.");

      addText("7. Hold Harmless and Indemnification", 12, true);
      addText("All Parties agree to hold harmless and indemnify Renograte LLC, the brokerage, and any licensed real estate agents involved from any claim arising out of renovation work, including but not limited to property damage, injury, delays, or disputes over payments or workmanship.");

      addText("8. Contingency Events", 12, true);
      addText("If the Buyer defaults on the Option Agreement or Purchase and Sale Agreement:");
      addText("- The Seller shall become liable to pay the Contractor the full amount for all renovation work performed, due either:");
      addText("  - At the time of the next sale of the Property to a new buyer, or");
      addText("  - At closing if the Seller re-lists and sells the Property.");
      addText("- The Seller shall retain the Earnest Money Deposit (EMD) from the defaulting Buyer, which may be used to offset Contractor payment.");
      addText("- Contractor may file a mechanic's lien as permitted by local law.");
      
      addText("If the Seller cancels or breaches the sale without Buyer fault:");
      addText("- Seller is immediately liable for full payment to the Contractor.");
      addText("- Contractor may pursue collection and lien rights.");
      
      addText("If both Parties mutually terminate:");
      addText("- Contractor is paid from escrowed funds if available.");
      addText("- Any balance becomes the Seller's liability and may be paid at the next closing.");
      addText("- Contractor may pursue lien rights for unpaid work.");
      
      addText("9. Legal Review and Acknowledgment", 12, true);
      addText("Each Party acknowledges that they have reviewed and understand this Agreement and had an opportunity to seek legal advice.");
      
      // Signatures
      y += 10;
      addText("10. Signatures", 12, true);
      y += 10;
      
      // Check if we need to add a new page for signatures
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 40;
        addLogoToPage();
      }
      
      // Add signature lines
      const signatureY = y;
      doc.line(margin, y, margin + 80, y);
      doc.text("Seller Signature", margin, y + 5);
      doc.text(`Date: ${formData.sellerSignDate}`, margin + 100, y + 5);
      if (formData.sellerSignature) {
        try {
          doc.addImage(formData.sellerSignature, "PNG", margin, y - 20, 80, 20);
        } catch (error) {
          console.error("Error adding seller signature image:", error);
          doc.text("(Signature)", margin, y - 5);
        }
      }
      
      y += 30;
      doc.line(margin, y, margin + 80, y);
      doc.text("Buyer Signature", margin, y + 5);
      doc.text(`Date: ${formData.buyerSignDate}`, margin + 100, y + 5);
      if (formData.buyerSignature) {
        try {
          doc.addImage(formData.buyerSignature, "PNG", margin, y - 20, 80, 20);
        } catch (error) {
          console.error("Error adding buyer signature image:", error);
          doc.text("(Signature)", margin, y - 5);
        }
      }
      
      y += 30;
      doc.line(margin, y, margin + 80, y);
      doc.text("Contractor Signature", margin, y + 5);
      doc.text(`Date: ${formData.contractorSignDate}`, margin + 100, y + 5);
      if (formData.contractorSignature) {
        try {
          doc.addImage(formData.contractorSignature, "PNG", margin, y - 20, 80, 20);
        } catch (error) {
          console.error("Error adding contractor signature image:", error);
          doc.text("(Signature)", margin, y - 5);
        }
      }

      // Footer with corrected page numbers
      // Get the actual number of pages
      const totalPages = doc.internal.pages.length;
      
      // Now add the footer to each page
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `RENOGRATE® Service Provider Agreement - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }
      
      // Save the PDF
      doc.save("renograte_service_provider_agreement.pdf");
      
      toast({
        title: "PDF Generated",
        description: "Your agreement has been saved as a PDF.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save the term sheet to local storage
      const termSheetData = {
        templateId: "service-provider",
        name: `Service Provider Agreement - ${formData.propertyAddress}`,
        propertyAddress: formData.propertyAddress,
        partyOne: formData.sellerName,
        partyTwo: formData.buyerName,
        date: formData.agreementDate,
        terms: "Standard service provider terms",
        data: formData,
      };
      
      saveTermSheet(termSheetData);
      
      // Optional: API call if you want to save to backend as well
      try {
        const response = await fetch("/api/agreements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "service-provider",
            data: formData,
          }),
        });
      } catch (apiError) {
        console.error("API error (non-blocking):", apiError);
        // Continue even if API fails since we saved to local storage
      }

      toast({
        title: "Success!",
        description: "Your agreement has been created successfully.",
      });

      router.push("/agreements");
    } catch (error) {
      console.error("Error submitting agreement:", error);
      toast({
        title: "Error",
        description: "Failed to submit agreement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Service Provider Agreement</h2>
        <p className="text-muted-foreground">
          Create a new agreement between property owner, buyer, and contractor
        </p>
      </div>

      <AgreementTemplate />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Parties Information */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
              <CardDescription>Enter the seller's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sellerName">Seller Name</Label>
                <Input
                  id="sellerName"
                  placeholder="Enter seller's full name"
                  value={formData.sellerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerAddress">Seller Address</Label>
                <Input
                  id="sellerAddress"
                  placeholder="Enter seller's address"
                  value={formData.sellerAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buyer Information</CardTitle>
              <CardDescription>Enter the buyer's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buyerName">Buyer Name</Label>
                <Input
                  id="buyerName"
                  placeholder="Enter buyer's full name"
                  value={formData.buyerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerAddress">Buyer Address</Label>
                <Input
                  id="buyerAddress"
                  placeholder="Enter buyer's address"
                  value={formData.buyerAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contractor Information</CardTitle>
              <CardDescription>Enter the contractor's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractorName">Contractor Name</Label>
                <Input
                  id="contractorName"
                  placeholder="Enter contractor's full name"
                  value={formData.contractorName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractorAddress">Contractor Address</Label>
                <Input
                  id="contractorAddress"
                  placeholder="Enter contractor's address"
                  value={formData.contractorAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
              <CardDescription>Enter the property details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input
                  id="propertyAddress"
                  placeholder="Enter complete property address"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agreementDate">Agreement Date</Label>
                <Input
                  id="agreementDate"
                  type="date"
                  value={formData.agreementDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Schedule</CardTitle>
              <CardDescription>Enter the project timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCompletionDate">Estimated Completion Date</Label>
                <Input
                  id="estimatedCompletionDate"
                  type="date"
                  value={formData.estimatedCompletionDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Signatures */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
              <CardDescription>Sign in to Your Designated Panel Below and Upload the Generated PDF Agreement to the 'My Agreements' Page to Initiate the Contract Signing Workflow for the Respective Parties</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <SignatureBox
                label="Seller Signature"
                signatureData={formData.sellerSignature}
                dateValue={formData.sellerSignDate}
                onSignatureChange={(value: string) => setFormData(prev => ({ ...prev, sellerSignature: value }))}
                onDateChange={(value: string) => setFormData(prev => ({ ...prev, sellerSignDate: value }))}
              />
              <SignatureBox
                label="Buyer Signature"
                signatureData={formData.buyerSignature}
                dateValue={formData.buyerSignDate}
                onSignatureChange={(value: string) => setFormData(prev => ({ ...prev, buyerSignature: value }))}
                onDateChange={(value: string) => setFormData(prev => ({ ...prev, buyerSignDate: value }))}
              />
              <SignatureBox
                label="Contractor Signature"
                signatureData={formData.contractorSignature}
                dateValue={formData.contractorSignDate}
                onSignatureChange={(value: string) => setFormData(prev => ({ ...prev, contractorSignature: value }))}
                onDateChange={(value: string) => setFormData(prev => ({ ...prev, contractorSignDate: value }))}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="md:col-span-2 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={generatePDF}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate PDF
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0C71C3] hover:bg-[#0C71C3]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Agreement"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

const AgreementTemplate = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Service Provider Agreement Template</CardTitle>
        <CardDescription>Please review the agreement template before filling out the form</CardDescription>
      </CardHeader>
      <CardContent className="prose max-w-none">
        <div className="space-y-4 text-sm">
          <h1 className="text-2xl font-bold text-center">Renograte® Service Provider Agreement</h1>
          
          <p className="text-muted-foreground">
            {`This Service Provider Agreement ("Agreement") is entered into by and between the Contractor or Service Provider ("Contractor"), the Property Owner ("Seller"), and/or the Prospective Buyer ("Buyer") of the real property listed below. This Agreement governs the scope of work, payment terms, warranties, and legal protections for renovation services performed prior to or during the sale process of the identified property.`}
          </p>

          <div className="border-b pb-2">
            <p className="font-semibold">Property Address: _________________________</p>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="font-semibold">1. Scope of Work</h3>
              <p>The Contractor shall provide renovation services as agreed upon in a separate, signed Work 
              Order approved by the Buyer and Seller before work begins.</p>
            </section>

            <section>
              <h3 className="font-semibold">2. Work Schedule</h3>
              <p>Start Date: _________________________</p>
              <p>Estimated Completion Date: _________________________</p>
            </section>

            <section>
              <h3 className="font-semibold">3. Compensation and Payment Terms</h3>
              <p>Contractor shall be paid in full at the closing of the sale using proceeds from the transaction.
              An agreed portion of the Earnest Money Deposit (EMD) up to 50% may be released to the 
              Contractor as a down payment if authorized through escrow instructions.</p>
            </section>

            <section>
              <h3 className="font-semibold">4. Approval and Quality Assurance</h3>
              <p>Buyer may inspect and approve all completed work prior to closing. Contractor must 
              address any deficiencies promptly.</p>
            </section>

            <section>
              <h3 className="font-semibold">5. Warranties & Insurance</h3>
              <p>Contractor warrants that all work will be performed in a professional, workmanlike manner 
              and compliant with applicable codes. Contractor affirms possession of proper licensing, 
              general liability insurance, and workers' compensation coverage, and shall provide proof 
              upon request.</p>
            </section>

            <section>
              <h3 className="font-semibold">6. Independent Contractor Status</h3>
              <p>Contractor is not an employee or agent of Renograte LLC or any real estate professional.
              Contractor is solely responsible for legal and tax obligations.</p>
            </section>

            <section>
              <h3 className="font-semibold">7. Hold Harmless and Indemnification</h3>
              <p>All Parties agree to hold harmless and indemnify Renograte LLC, the brokerage, and any 
              licensed real estate agents involved from any claim arising out of renovation work, 
              including but not limited to property damage, injury, delays, or disputes over payments or 
              workmanship.</p>
            </section>

            <section>
              <h3 className="font-semibold">8. Contingency Events</h3>
              <p className="font-medium">If the Buyer defaults on the Option Agreement or Purchase and Sale Agreement:</p>
              <ul className="list-disc pl-6">
                <li>The Seller shall become liable to pay the Contractor the full amount for all renovation 
                work performed, due either:
                  <ul className="list-disc pl-6">
                    <li>At the time of the next sale of the Property to a new buyer, or</li>
                    <li>At closing if the Seller re-lists and sells the Property.</li>
                  </ul>
                </li>
                <li>The Seller shall retain the Earnest Money Deposit (EMD) from the defaulting Buyer, which 
                may be used to offset Contractor payment.</li>
                <li>Contractor may file a mechanic's lien as permitted by local law.</li>
              </ul>

              <p className="font-medium mt-2">If the Seller cancels or breaches the sale without Buyer fault:</p>
              <ul className="list-disc pl-6">
                <li>Seller is immediately liable for full payment to the Contractor.</li>
                <li>Contractor may pursue collection and lien rights.</li>
              </ul>

              <p className="font-medium mt-2">If both Parties mutually terminate:</p>
              <ul className="list-disc pl-6">
                <li>Contractor is paid from escrowed funds if available.</li>
                <li>Any balance becomes the Seller's liability and may be paid at the next closing.</li>
                <li>Contractor may pursue lien rights for unpaid work.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">9. Legal Review and Acknowledgment</h3>
              <p>Each Party acknowledges that they have reviewed and understand this Agreement and had 
              an opportunity to seek legal advice.</p>
            </section>

            <section>
              <h3 className="font-semibold">10. Signatures</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p>Seller Signature: _________________________</p>
                  <p>Date: _________________________</p>
                </div>
                <div>
                  <p>Buyer Signature: _________________________</p>
                  <p>Date: _________________________</p>
                </div>
                <div>
                  <p>Contractor Signature: _________________________</p>
                  <p>Date: _________________________</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 