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

interface LeaseOptionFormData {
  // Parties Information
  landlordName: string;
  landlordAddress: string;
  tenantName: string;
  tenantAddress: string;
  
  // Property Information
  propertyAddress: string;
  
  // Lease Terms
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: string;
  securityDeposit: string;
  
  // Option Terms
  optionPeriod: string;
  purchasePrice: string;
  optionFee: string;
  rentCredit: string;
  
  // Agreement Details
  agreementDate: string;
  agreementId: string;
  
  // Signatures
  landlordSignature: string;
  landlordSignDate: string;
  tenantSignature: string;
  tenantSignDate: string;
  witnessSignature: string;
  witnessSignDate: string;
}

export default function CreateLeaseOptionAgreement() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<LeaseOptionFormData>({
    landlordName: "",
    landlordAddress: "",
    tenantName: "",
    tenantAddress: "",
    propertyAddress: "",
    leaseStartDate: "",
    leaseEndDate: "",
    monthlyRent: "",
    securityDeposit: "",
    optionPeriod: "",
    purchasePrice: "",
    optionFee: "",
    rentCredit: "",
    agreementDate: new Date().toISOString().split('T')[0],
    agreementId: `LOA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    landlordSignature: "",
    landlordSignDate: "",
    tenantSignature: "",
    tenantSignDate: "",
    witnessSignature: "",
    witnessSignDate: "",
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
      doc.text("RENOGRATE® LEASE OPTION AGREEMENT", pageWidth/2, y, { align: "center" });
      y += 20;
      
      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      y = 50;

      // Agreement ID and Date
      addText(`Agreement ID: ${formData.agreementId}`, 10);
      addText(`Date: ${formData.agreementDate}`, 10);
      y += 10;

      // Add agreement content sections
      addText("1. PARTIES", 14, true);
      addText(`This Lease Option Agreement is made between ${formData.landlordName} ("Landlord") and ${formData.tenantName} ("Tenant").`);

      addText("2. PROPERTY", 14, true);
      addText(`The property subject to this agreement is located at: ${formData.propertyAddress}`);

      addText("3. LEASE TERMS", 14, true);
      addText(`Lease Period: ${formData.leaseStartDate} to ${formData.leaseEndDate}`);
      addText(`Monthly Rent: $${formData.monthlyRent}`);
      addText(`Security Deposit: $${formData.securityDeposit}`);

      addText("4. OPTION TERMS", 14, true);
      addText(`Option Period: ${formData.optionPeriod} months`);
      addText(`Purchase Price: $${formData.purchasePrice}`);
      addText(`Option Fee: $${formData.optionFee}`);
      addText(`Rent Credit: $${formData.rentCredit} per month`);
      
      // Add more comprehensive sections to the agreement
      addText("5. LEASE PROVISIONS", 14, true);
      addText("5.1 Tenant agrees to pay rent on time and maintain the property in good condition.");
      addText("5.2 Tenant is responsible for utilities, minor repairs, and routine maintenance.");
      addText("5.3 Landlord is responsible for major repairs and structural maintenance.");
      addText("5.4 Tenant may not make alterations without written consent from Landlord.");
      addText("5.5 Tenant must comply with all applicable laws, regulations, and HOA rules.");
      
      addText("6. OPTION TO PURCHASE", 14, true);
      addText("6.1 Tenant has the exclusive right to purchase the property during the option period.");
      addText("6.2 To exercise the option, Tenant must provide written notice to Landlord.");
      addText("6.3 The option fee is non-refundable but will be applied to the purchase price.");
      addText("6.4 A portion of each monthly rent payment will be credited toward the purchase price.");
      addText("6.5 If Tenant does not exercise the option, all option fees and rent credits are forfeited.");
      
      addText("7. PURCHASE TERMS", 14, true);
      addText("7.1 Upon exercise of the option, parties will enter into a standard purchase agreement.");
      addText("7.2 Closing must occur within 60 days of option exercise.");
      addText("7.3 Tenant is responsible for obtaining financing if needed.");
      addText("7.4 Landlord will provide clear title and standard seller disclosures.");
      addText("7.5 Closing costs will be allocated according to local custom.");
      
      addText("8. DEFAULT", 14, true);
      addText("8.1 If Tenant defaults on the lease, the option rights are terminated.");
      addText("8.2 If Landlord defaults, Tenant may seek specific performance or damages.");
      addText("8.3 Late rent payments may result in late fees and potential loss of rent credits.");
      
      addText("9. ASSIGNMENT", 14, true);
      addText("Tenant may not assign this agreement without written consent from Landlord.");
      
      addText("10. ENTIRE AGREEMENT", 14, true);
      addText("This document constitutes the entire agreement between the parties regarding this lease option arrangement.");

      // Add signatures
      y += 20;
      
      // Check if we need to add a new page for signatures
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 20;
      }
      
      addText("SIGNATURES", 14, true);
      
      // Add signature lines
      const signatureY = y;
      doc.line(margin, y, margin + 80, y);
      doc.text("Landlord Signature", margin, y + 5);
      doc.text(`Date: ${formData.landlordSignDate}`, margin + 100, y + 5);
      if (formData.landlordSignature) {
        try {
          doc.addImage(formData.landlordSignature, "PNG", margin, y - 20, 80, 20);
        } catch (error) {
          console.error("Error adding landlord signature image:", error);
          doc.text("(Signature)", margin, y - 5);
        }
      }
      
      y += 30;
      doc.line(margin, y, margin + 80, y);
      doc.text("Tenant Signature", margin, y + 5);
      doc.text(`Date: ${formData.tenantSignDate}`, margin + 100, y + 5);
      if (formData.tenantSignature) {
        try {
          doc.addImage(formData.tenantSignature, "PNG", margin, y - 20, 80, 20);
        } catch (error) {
          console.error("Error adding tenant signature image:", error);
          doc.text("(Signature)", margin, y - 5);
        }
      }
      
      y += 30;
      doc.line(margin, y, margin + 80, y);
      doc.text("Witness Signature", margin, y + 5);
      doc.text(`Date: ${formData.witnessSignDate}`, margin + 100, y + 5);
      if (formData.witnessSignature) {
        try {
          doc.addImage(formData.witnessSignature, "PNG", margin, y - 20, 80, 20);
        } catch (error) {
          console.error("Error adding witness signature image:", error);
          doc.text("(Signature)", margin, y - 5);
        }
      }

      // Footer with corrected page numbers
      // Get the actual number of pages
      const totalPages = doc.internal.pages.length-1;
      
      // Now add the footer to each page
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `RENOGRATE® Lease Option Agreement - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      doc.save("renograte_lease_option_agreement.pdf");
      
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
        templateId: "lease-option",
        name: `Lease Option Agreement - ${formData.propertyAddress}`,
        propertyAddress: formData.propertyAddress,
        partyOne: formData.landlordName,
        partyTwo: formData.tenantName,
        date: formData.agreementDate,
        terms: `Lease from ${formData.leaseStartDate} to ${formData.leaseEndDate}`,
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
            type: "lease-option",
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
        <h2 className="text-2xl font-bold tracking-tight">Create Lease Option Agreement</h2>
        <p className="text-muted-foreground">
          Create a new lease agreement with an option to purchase
        </p>
      </div>

      <AgreementTemplate />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Landlord Information */}
          <Card>
            <CardHeader>
              <CardTitle>Landlord Information</CardTitle>
              <CardDescription>Enter the landlord's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="landlordName">Landlord Name</Label>
                <Input
                  id="landlordName"
                  placeholder="Enter landlord's full name"
                  value={formData.landlordName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landlordAddress">Landlord Address</Label>
                <Input
                  id="landlordAddress"
                  placeholder="Enter landlord's address"
                  value={formData.landlordAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Tenant Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
              <CardDescription>Enter the tenant's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenantName">Tenant Name</Label>
                <Input
                  id="tenantName"
                  placeholder="Enter tenant's full name"
                  value={formData.tenantName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantAddress">Tenant Address</Label>
                <Input
                  id="tenantAddress"
                  placeholder="Enter tenant's address"
                  value={formData.tenantAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Information */}
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
            </CardContent>
          </Card>

          {/* Lease Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Lease Terms</CardTitle>
              <CardDescription>Enter the lease details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaseStartDate">Lease Start Date</Label>
                <Input
                  id="leaseStartDate"
                  type="date"
                  value={formData.leaseStartDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseEndDate">Lease End Date</Label>
                <Input
                  id="leaseEndDate"
                  type="date"
                  value={formData.leaseEndDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent (USD)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="Enter monthly rent amount"
                  value={formData.monthlyRent}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security Deposit (USD)</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  placeholder="Enter security deposit amount"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Option Terms */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Option Terms</CardTitle>
              <CardDescription>Enter the purchase option details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="optionPeriod">Option Period (Months)</Label>
                <Input
                  id="optionPeriod"
                  type="number"
                  placeholder="Enter option period in months"
                  value={formData.optionPeriod}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="Enter purchase price"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionFee">Option Fee (USD)</Label>
                <Input
                  id="optionFee"
                  type="number"
                  placeholder="Enter option fee"
                  value={formData.optionFee}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentCredit">Monthly Rent Credit (USD)</Label>
                <Input
                  id="rentCredit"
                  type="number"
                  placeholder="Enter monthly rent credit amount"
                  value={formData.rentCredit}
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
                label="Landlord Signature"
                signatureData={formData.landlordSignature}
                dateValue={formData.landlordSignDate}
                onSignatureChange={(value: string) => setFormData(prev => ({ ...prev, landlordSignature: value }))}
                onDateChange={(value: string) => setFormData(prev => ({ ...prev, landlordSignDate: value }))}
              />
              <SignatureBox
                label="Tenant Signature"
                signatureData={formData.tenantSignature}
                dateValue={formData.tenantSignDate}
                onSignatureChange={(value: string) => setFormData(prev => ({ ...prev, tenantSignature: value }))}
                onDateChange={(value: string) => setFormData(prev => ({ ...prev, tenantSignDate: value }))}
              />
              <SignatureBox
                label="Witness Signature"
                signatureData={formData.witnessSignature}
                dateValue={formData.witnessSignDate}
                onSignatureChange={(value: string) => setFormData(prev => ({ ...prev, witnessSignature: value }))}
                onDateChange={(value: string) => setFormData(prev => ({ ...prev, witnessSignDate: value }))}
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
        <CardTitle>Lease Option Agreement Template</CardTitle>
        <CardDescription>Please review the agreement template before filling out the form</CardDescription>
      </CardHeader>
      <CardContent className="prose max-w-none">
        <div className="space-y-4 text-sm">
          <h1 className="text-2xl font-bold text-center">Renograte® Lease Option Agreement</h1>
          
          <p className="text-muted-foreground">
            {`This Lease Option Agreement ("Agreement") is entered into by and between the Property Owner ("Landlord") and the Prospective Buyer ("Tenant"). This Agreement establishes the terms and conditions for leasing the property with an option to purchase.`}
          </p>

          <div className="border-b pb-2">
            <p className="font-semibold">Property Address: _________________________</p>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="font-semibold">1. Lease Terms</h3>
              <p>The Landlord agrees to lease the Property to the Tenant under the following terms:</p>
              <ul className="list-disc pl-6">
                <li>Monthly Rent: $_____________</li>
                <li>Security Deposit: $_____________</li>
                <li>Lease Start Date: _____________</li>
                <li>Lease End Date: _____________</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">2. Option to Purchase</h3>
              <p>The Landlord grants the Tenant the exclusive right and option to purchase the Property under these terms:</p>
              <ul className="list-disc pl-6">
                <li>Purchase Price: $_____________</li>
                <li>Option Fee: $_____________</li>
                <li>Option Period: _____________ months</li>
                <li>Monthly Rent Credit: $_____________</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">3. Exercise of Option</h3>
              <p>The Tenant may exercise the option to purchase by providing written notice to the Landlord during the Option Period. The Option Fee shall be credited toward the purchase price at closing.</p>
            </section>

            <section>
              <h3 className="font-semibold">4. Rent Credits</h3>
              <p>A portion of each monthly rent payment shall be credited toward the purchase price if the option is exercised. The total credit shall not exceed the agreed Monthly Rent Credit multiplied by the number of months the lease has been in effect.</p>
            </section>

            <section>
              <h3 className="font-semibold">5. Property Maintenance</h3>
              <p>During the lease term:</p>
              <ul className="list-disc pl-6">
                <li>Tenant is responsible for routine maintenance and repairs under $500</li>
                <li>Landlord remains responsible for major repairs and structural issues</li>
                <li>Any improvements made by the Tenant must have prior written approval</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">6. Default and Termination</h3>
              <p>This Agreement may terminate under the following conditions:</p>
              <ul className="list-disc pl-6">
                <li>Failure to pay rent or other required payments</li>
                <li>Violation of lease terms</li>
                <li>Failure to exercise the option within the specified period</li>
                <li>Mutual agreement between parties</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">7. Insurance and Taxes</h3>
              <p>The Landlord shall maintain property insurance and pay property taxes during the lease term. The Tenant shall maintain renter's insurance for personal property and liability coverage.</p>
            </section>

            <section>
              <h3 className="font-semibold">8. Assignment and Subletting</h3>
              <p>The Tenant shall not assign this Agreement or sublease the Property without the Landlord's written consent. Any unauthorized assignment or sublease shall void the option to purchase.</p>
            </section>

            <section>
              <h3 className="font-semibold">9. Closing and Purchase</h3>
              <p>Upon exercise of the option:</p>
              <ul className="list-disc pl-6">
                <li>A standard purchase agreement shall be executed</li>
                <li>Closing shall occur within 60 days of option exercise</li>
                <li>Option Fee and Rent Credits shall be applied to purchase price</li>
                <li>Standard closing costs shall be allocated per local custom</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">10. Governing Law</h3>
              <p>This Agreement shall be governed by and construed in accordance with the laws of the state where the Property is located.</p>
            </section>

            <section>
              <h3 className="font-semibold">11. Signatures</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p>Landlord Signature: _________________________</p>
                  <p>Date: _________________________</p>
                </div>
                <div>
                  <p>Tenant Signature: _________________________</p>
                  <p>Date: _________________________</p>
                </div>
                <div>
                  <p>Witness Signature: _________________________</p>
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