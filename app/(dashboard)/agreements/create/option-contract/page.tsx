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

interface OptionContractFormData {
  // Parties Information
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  
  // Property Information
  propertyAddress: string;
  
  // Agreement Details
  agreementDate: string;
  agreementId: string;
  
  // Financial Details
  arvSalePrice: string;
  emdAmount: string;
  mortgageAllowanceAmount: string;
  mortgageAllowanceMonths: string;
  
  // Agent Information
  agentName: string;
  
  // Signatures
  sellerSignature: string;
  sellerSignDate: string;
  buyerSignature: string;
  buyerSignDate: string;
  agentSignature: string;
  agentSignDate: string;
}

interface AgreementHistory {
  formData: OptionContractFormData;
  timestamp: string;
}

const AgreementTemplate = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Option Agreement Template</CardTitle>
        <CardDescription>Please review the agreement template before filling out the form</CardDescription>
      </CardHeader>
      <CardContent className="prose max-w-none">
        <div className="space-y-4 text-sm">
          <h1 className="text-2xl font-bold text-center">RENOGRATE® OPTION AGREEMENT</h1>
          
          <div className="border-b pb-2">
            <p className="font-semibold">Agreement ID: _________________________</p>
            <p className="font-semibold">Date: _________________________</p>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="font-semibold">PARTIES TO THIS AGREEMENT:</h3>
              <p>Seller Name(s): _________________________</p>
              <p>Seller Address: _________________________</p>
              <p>Buyer Name(s): _________________________</p>
              <p>Buyer Address: _________________________</p>
            </section>

            <section>
              <h3 className="font-semibold">PROPERTY:</h3>
              <p>Property Address: _________________________</p>
            </section>

            <section>
              <h3 className="font-semibold">1. PURPOSE AND GRANT OF OPTION</h3>
              <p>The Seller grants the Buyer the right to access and control the Property prior to the closing date for the limited purpose of facilitating renovations as agreed upon by the Parties and their contractor, with the objective of achieving the mutually agreed After Renovation Value (ARV) of the Property.</p>
              <p>Upon completion of renovations:</p>
              <ul className="list-disc pl-6">
                <li>Buyer shall exercise the option to purchase the Property at the agreed ARV.</li>
                <li>A standard Real Estate Purchase and Sale Agreement (PSA) shall govern the final sale.</li>
              </ul>
              <p>Agreed ARV Sale Price: $_________________ USD</p>
            </section>

            <section>
              <h3 className="font-semibold">2. EARNEST MONEY DEPOSIT (EMD) & ESCROW</h3>
              <p>The Buyer agrees to deposit the sum of $_________________ USD as Earnest Money, held in escrow by a mutually agreed Title or Escrow Agent. This Agreement becomes binding upon confirmation of receipt of the EMD.</p>
              <p>Release & Forfeiture Terms:</p>
              <ul className="list-disc pl-6">
                <li>If Buyer fails to close: Buyer forfeits EMD.</li>
                <li>If Seller fails to complete sale post-renovation: Buyer is refunded EMD.</li>
                <li>If both Parties mutually terminate: Seller assumes liability for renovation costs; EMD refunded.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">3. RENOVATION, PAYMENT, AND APPRAISAL ADJUSTMENTS</h3>
              <p>Buyer shall pay the full ARV at closing.</p>
              <ul className="list-disc pl-6">
                <li>Contractor shall receive payment at closing as per the Renograte Service Provider Agreement.</li>
              </ul>
              <p>If the final appraisal is less than the agreed ARV:</p>
              <ul className="list-disc pl-6">
                <li>Parties may mutually agree to the lower value.</li>
                <li>A second appraisal may be requested (requesting party bears cost); the final value shall be the average of both.</li>
                <li>Parties may renegotiate terms per the PSA and relevant local laws.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">4. MORTGAGE EXPENSE ALLOWANCE</h3>
              <p>Where agreed, Buyer will provide Seller with a mortgage expense allowance of $_________________ USD for _______ month(s), either upfront or at closing, to cover the Seller's holding costs during renovations.</p>
            </section>

            <section>
              <h3 className="font-semibold">5. RENOGRATE® ROLE, FEES, AND LIABILITY</h3>
              <p>Renograte LLC shall receive a $499 USD transaction/administration fee at closing.</p>
              <p>Renograte LLC is not a party to this transaction beyond:</p>
              <ul className="list-disc pl-6">
                <li>Administrative coordination,</li>
                <li>Connection of Parties to licensed contractors and agents,</li>
                <li>Optional support or recommendations when requested.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">6. PROPERTY INSPECTION RIGHTS</h3>
              <p>Buyer shall have reasonable access to inspect the Property and may hire licensed professionals for inspection, including general, structural, and pest assessments.</p>
            </section>

            <section>
              <h3 className="font-semibold">7. ACCEPTANCE OF PROPERTY CONDITION</h3>
              <p>Following completion of this Agreement, Buyer accepts the Property as-is. The Seller is not responsible for further improvements, except those included in the agreed renovation scope.</p>
            </section>

            <section>
              <h3 className="font-semibold">8. BUSINESS PURPOSE AFFIDAVIT</h3>
              <p>Seller acknowledges that this transaction is conducted for business purposes, with full understanding of the associated risks (e.g., final sale price variance).</p>
            </section>

            <section>
              <h3 className="font-semibold">9. REALTOR PARTICIPATION & LISTING AGREEMENT</h3>
              <p>A licensed Realtor will:</p>
              <ul className="list-disc pl-6">
                <li>Execute a pre-sale listing agreement with the Seller,</li>
                <li>List the Property for the ARV post-renovation sale,</li>
                <li>Ensure that the Property cannot be listed at a higher price after renovations without consent from the Parties.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">10. LEGAL REVIEW AND ACKNOWLEDGEMENT</h3>
              <p>Each Party acknowledges that they have had the opportunity to review this Agreement, seek legal advice, and fully understand its terms.</p>
            </section>

            <section>
              <h3 className="font-semibold">SIGNATURES</h3>
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
                  <p>Real Estate Agent (Witness): _________________________</p>
                  <p>Date: _________________________</p>
                </div>
              </div>
            </section>

            <section className="text-xs text-muted-foreground">
              <p>Notes:</p>
              <p>This document is intended to be used with a Real Estate Purchase and Sale Agreement and a Renograte Service Provider Agreement.</p>
              <p>All parties are encouraged to review with counsel in the governing jurisdiction.</p>
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CreateOptionContract() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [agreementHistory, setAgreementHistory] = useState<AgreementHistory[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<OptionContractFormData>({
    sellerName: "",
    sellerAddress: "",
    buyerName: "",
    buyerAddress: "",
    propertyAddress: "",
    agreementDate: new Date().toISOString().split('T')[0],
    agreementId: `OC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    arvSalePrice: "",
    emdAmount: "",
    mortgageAllowanceAmount: "",
    mortgageAllowanceMonths: "",
    agentName: "",
    sellerSignature: "",
    sellerSignDate: "",
    buyerSignature: "",
    buyerSignDate: "",
    agentSignature: "",
    agentSignDate: "",
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
      doc.text("RENOGRATE® OPTION AGREEMENT", pageWidth/2, y, { align: "center" });
      y += 20;
      
      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      y = 50;

      // Agreement ID and Date
      addText(`Agreement ID: ${formData.agreementId}`, 10);
      addText(`Date: ${formData.agreementDate}`, 10);
      y += 10;

      // Parties Information
      addText("PARTIES TO THIS AGREEMENT:", 14, true);
      addText(`Seller Name(s): ${formData.sellerName}`);
      addText(`Seller Address: ${formData.sellerAddress}`);
      addText(`Buyer Name(s): ${formData.buyerName}`);
      addText(`Buyer Address: ${formData.buyerAddress}`);
      y += 10;

      // Property Information
      addText("PROPERTY:", 14, true);
      addText(`Property Address: ${formData.propertyAddress}`);
      y += 10;

      // Purpose and Grant of Option
      addText("1. PURPOSE AND GRANT OF OPTION", 14, true);
      addText("The Seller grants the Buyer the right to access and control the Property prior to the closing date for the limited purpose of facilitating renovations as agreed upon by the Parties and their contractor, with the objective of achieving the mutually agreed After Renovation Value (ARV) of the Property.");
      addText("Upon completion of renovations:");
      addText("• Buyer shall exercise the option to purchase the Property at the agreed ARV.");
      addText("• A standard Real Estate Purchase and Sale Agreement (PSA) shall govern the final sale.");
      addText(`Agreed ARV Sale Price: $${formData.arvSalePrice} USD`);

      // EMD and Escrow
      addText("2. EARNEST MONEY DEPOSIT (EMD) & ESCROW", 14, true);
      addText(`The Buyer agrees to deposit the sum of $${formData.emdAmount} USD as Earnest Money, held in escrow by a mutually agreed Title or Escrow Agent. This Agreement becomes binding upon confirmation of receipt of the EMD.`);
      addText("Release & Forfeiture Terms:");
      addText("• If Buyer fails to close: Buyer forfeits EMD.");
      addText("• If Seller fails to complete sale post-renovation: Buyer is refunded EMD.");
      addText("• If both Parties mutually terminate: Seller assumes liability for renovation costs; EMD refunded.");

      // Renovation and Payment
      addText("3. RENOVATION, PAYMENT, AND APPRAISAL ADJUSTMENTS", 14, true);
      addText("Buyer shall pay the full ARV at closing.");
      addText("• Contractor shall receive payment at closing as per the Renograte Service Provider Agreement.");
      addText("If the final appraisal is less than the agreed ARV:");
      addText("a. Parties may mutually agree to the lower value.");
      addText("b. A second appraisal may be requested (requesting party bears cost); the final value shall be the average of both.");
      addText("c. Parties may renegotiate terms per the PSA and relevant local laws.");

      // Mortgage Expense Allowance
      addText("4. MORTGAGE EXPENSE ALLOWANCE", 14, true);
      addText(`Where agreed, Buyer will provide Seller with a mortgage expense allowance of $${formData.mortgageAllowanceAmount} USD for ${formData.mortgageAllowanceMonths} month(s), either upfront or at closing, to cover the Seller's holding costs during renovations.`);

      // Renograte Role
      addText("5. RENOGRATE® ROLE, FEES, AND LIABILITY", 14, true);
      addText("Renograte LLC shall receive a $499 USD transaction/administration fee at closing.");
      addText("Renograte LLC is not a party to this transaction beyond:");
      addText("• Administrative coordination,");
      addText("• Connection of Parties to licensed contractors and agents,");
      addText("• Optional support or recommendations when requested.");

      // Property Inspection
      addText("6. PROPERTY INSPECTION RIGHTS", 14, true);
      addText("Buyer shall have reasonable access to inspect the Property and may hire licensed professionals for inspection, including general, structural, and pest assessments.");

      // Property Condition
      addText("7. ACCEPTANCE OF PROPERTY CONDITION", 14, true);
      addText("Following completion of this Agreement, Buyer accepts the Property as-is. The Seller is not responsible for further improvements, except those included in the agreed renovation scope.");

      // Business Purpose
      addText("8. BUSINESS PURPOSE AFFIDAVIT", 14, true);
      addText("Seller acknowledges that this transaction is conducted for business purposes, with full understanding of the associated risks (e.g., final sale price variance).");

      // Realtor Participation
      addText("9. REALTOR PARTICIPATION & LISTING AGREEMENT", 14, true);
      addText("A licensed Realtor will:");
      addText("• Execute a pre-sale listing agreement with the Seller,");
      addText("• List the Property for the ARV post-renovation sale,");
      addText("• Ensure that the Property cannot be listed at a higher price after renovations without consent from the Parties.");

      // Legal Review
      addText("10. LEGAL REVIEW AND ACKNOWLEDGEMENT", 14, true);
      addText("Each Party acknowledges that they have had the opportunity to review this Agreement, seek legal advice, and fully understand its terms.");
      
      // Signatures
      addText("SIGNATURES", 14, true);
      y += 10;
      
      // Check if we need to add a new page for signatures
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 40;
        addLogoToPage();
      }
      
      // Add signature lines
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
      doc.text("Real Estate Agent (Witness)", margin, y + 5);
      doc.text(`Date: ${formData.agentSignDate}`, margin + 100, y + 5);
      if (formData.agentSignature) {
        try {
          doc.addImage(formData.agentSignature, "PNG", margin, y - 20, 80, 20);
        } catch (error) {
          console.error("Error adding agent signature image:", error);
          doc.text("(Signature)", margin, y - 5);
        }
      }

      // Notes
      y += 40;
      
      // Check if we need to add a new page for notes
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 40;
        addLogoToPage();
      }
      
      addText("Notes:", 10, true);
      addText("This document is intended to be used with a Real Estate Purchase and Sale Agreement and a Renograte Service Provider Agreement.", 10);
      addText("All parties are encouraged to review with counsel in the governing jurisdiction.", 10);

      // Footer with corrected page numbers
      // Get the actual number of pages
      const totalPages = doc.internal.pages.length-1;
      
      // Now add the footer to each page
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `RENOGRATE® Option Agreement - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }
      
      // Save the PDF
      doc.save("renograte_option_agreement.pdf");
      
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
        templateId: "option-contract",
        name: `Option Agreement - ${formData.propertyAddress}`,
        propertyAddress: formData.propertyAddress,
        partyOne: formData.sellerName,
        partyTwo: formData.buyerName,
        date: formData.agreementDate,
        terms: "Standard option contract terms",
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
            type: "option-contract",
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
        <h2 className="text-2xl font-bold tracking-tight">Create Option Agreement</h2>
        <p className="text-muted-foreground">
          Create a new option agreement for property renovation
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
              <CardTitle>Financial Details</CardTitle>
              <CardDescription>Enter the financial terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="arvSalePrice">ARV Sale Price (USD)</Label>
                <Input
                  id="arvSalePrice"
                  type="number"
                  placeholder="Enter ARV sale price"
                  value={formData.arvSalePrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emdAmount">Earnest Money Deposit (USD)</Label>
                <Input
                  id="emdAmount"
                  type="number"
                  placeholder="Enter EMD amount"
                  value={formData.emdAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mortgageAllowanceAmount">Mortgage Expense Allowance (USD)</Label>
                <Input
                  id="mortgageAllowanceAmount"
                  type="number"
                  placeholder="Enter allowance amount"
                  value={formData.mortgageAllowanceAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mortgageAllowanceMonths">Allowance Period (Months)</Label>
                <Input
                  id="mortgageAllowanceMonths"
                  type="number"
                  placeholder="Enter number of months"
                  value={formData.mortgageAllowanceMonths}
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
                label="Agent Signature"
                signatureData={formData.agentSignature}
                dateValue={formData.agentSignDate}
                onSignatureChange={(value: string) => setFormData(prev => ({ ...prev, agentSignature: value }))}
                onDateChange={(value: string) => setFormData(prev => ({ ...prev, agentSignDate: value }))}
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