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

interface JointVentureFormData {
  // Partner Information
  partner1Name: string;
  partner1Address: string;
  partner1Contribution: string;
  partner1Percentage: string;
  partner2Name: string;
  partner2Address: string;
  partner2Contribution: string;
  partner2Percentage: string;
  
  // Project Information
  projectName: string;
  projectAddress: string;
  projectDescription: string;
  startDate: string;
  estimatedCompletionDate: string;
  
  // Financial Details
  totalInvestment: string;
  profitSplitRatio: string;
  
  // Agreement Details
  agreementDate: string;
  agreementId: string;
  
  // Signatures
  partner1Signature: string;
  partner1SignDate: string;
  partner2Signature: string;
  partner2SignDate: string;
  witnessSignature: string;
  witnessSignDate: string;
}

export default function CreateJointVentureAgreement() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<JointVentureFormData>({
    partner1Name: "",
    partner1Address: "",
    partner1Contribution: "",
    partner1Percentage: "",
    partner2Name: "",
    partner2Address: "",
    partner2Contribution: "",
    partner2Percentage: "",
    projectName: "",
    projectAddress: "",
    projectDescription: "",
    startDate: "",
    estimatedCompletionDate: "",
    totalInvestment: "",
    profitSplitRatio: "",
    agreementDate: new Date().toISOString().split('T')[0],
    agreementId: `JVA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    partner1Signature: "",
    partner1SignDate: "",
    partner2Signature: "",
    partner2SignDate: "",
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
          // You would typically use a proper image URL or base64 string here
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
      doc.text("RENOGRATE® JOINT VENTURE AGREEMENT", pageWidth/2, y, { align: "center" });
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
      addText(`This Joint Venture Agreement is made between ${formData.partner1Name} ("Partner 1") and ${formData.partner2Name} ("Partner 2"), collectively referred to as "Partners".`);

      addText("2. PROJECT DETAILS", 14, true);
      addText(`Project Name: ${formData.projectName}`);
      addText(`Project Address: ${formData.projectAddress}`);
      addText(`Project Description: ${formData.projectDescription}`);
      addText(`Start Date: ${formData.startDate}`);
      addText(`Estimated Completion Date: ${formData.estimatedCompletionDate}`);

      addText("3. CONTRIBUTIONS", 14, true);
      addText(`Partner 1 Contribution: $${formData.partner1Contribution}`);
      addText(`Partner 1 Ownership Percentage: ${formData.partner1Percentage}%`);
      addText(`Partner 2 Contribution: $${formData.partner2Contribution}`);
      addText(`Partner 2 Ownership Percentage: ${formData.partner2Percentage}%`);
      addText(`Total Investment: $${formData.totalInvestment}`);

      addText("4. PROFIT SHARING", 14, true);
      addText(`The profits and losses of the Joint Venture shall be distributed according to the following ratio: ${formData.profitSplitRatio}`);
      
      // Add more comprehensive sections to the agreement
      addText("5. PURPOSE OF THE JOINT VENTURE", 14, true);
      addText("The purpose of this Joint Venture is to collaborate on the renovation and/or development of the property identified above, with the intention of selling or leasing the property upon completion for mutual profit.");
      
      addText("6. TERM OF AGREEMENT", 14, true);
      addText(`6.1 This Joint Venture shall commence on ${formData.startDate} and continue until the project is completed and all profits or losses are distributed, or until terminated by mutual agreement of the Partners.`);
      addText(`6.2 The estimated completion date is ${formData.estimatedCompletionDate}, but may be extended by mutual written agreement.`);
      
      addText("7. MANAGEMENT AND CONTROL", 14, true);
      addText("7.1 All decisions affecting the Joint Venture shall require unanimous consent of the Partners.");
      addText("7.2 Each Partner shall have equal authority in the day-to-day operations of the Joint Venture.");
      addText("7.3 Neither Partner may bind the Joint Venture to any obligation exceeding $5,000 without the written consent of the other Partner.");
      addText("7.4 The Partners shall meet regularly, at least monthly, to review progress and make decisions.");
      
      addText("8. CAPITAL ACCOUNTS", 14, true);
      addText("8.1 A separate capital account shall be maintained for each Partner.");
      addText("8.2 Initial contributions shall be credited to each Partner's capital account.");
      addText("8.3 Additional contributions may be made as needed, subject to mutual agreement.");
      addText("8.4 No interest shall be paid on capital contributions.");
      
      addText("9. BANKING", 14, true);
      addText("9.1 A separate bank account shall be established for the Joint Venture.");
      addText("9.2 Both Partners shall have signing authority on the account.");
      addText("9.3 All project-related income and expenses shall flow through this account.");
      
      addText("10. ACCOUNTING AND RECORDS", 14, true);
      addText("10.1 Complete and accurate books of account shall be maintained.");
      addText("10.2 Each Partner shall have full access to all books and records at all reasonable times.");
      addText("10.3 Financial statements shall be prepared monthly and distributed to both Partners.");
      addText("10.4 A year-end financial statement shall be prepared within 60 days of the end of each calendar year.");
      
      addText("11. EXPENSES AND LIABILITIES", 14, true);
      addText("11.1 All expenses related to the project shall be paid from Joint Venture funds.");
      addText("11.2 Partners shall be reimbursed for reasonable out-of-pocket expenses incurred on behalf of the Joint Venture.");
      addText("11.3 Neither Partner shall be liable for the debts or obligations of the other Partner outside this Joint Venture.");
      
      addText("12. INSURANCE", 14, true);
      addText("The Joint Venture shall maintain appropriate insurance coverage, including property, liability, and workers' compensation insurance as required by law.");
      
      addText("13. DISPUTE RESOLUTION", 14, true);
      addText("13.1 The Partners shall attempt to resolve any disputes through good-faith negotiation.");
      addText("13.2 If negotiation fails, disputes shall be submitted to mediation before any legal action is taken.");
      addText("13.3 If mediation fails, disputes shall be resolved through binding arbitration.");
      
      addText("14. DISSOLUTION", 14, true);
      addText("14.1 The Joint Venture shall be dissolved upon completion of the project and distribution of profits/losses.");
      addText("14.2 The Joint Venture may be dissolved earlier by mutual written agreement.");
      addText("14.3 Upon dissolution, assets shall be liquidated and distributed according to the profit-sharing ratio after all liabilities are paid.");
      
      addText("15. ASSIGNMENT", 14, true);
      addText("Neither Partner may assign their interest in the Joint Venture without the written consent of the other Partner.");
      
      addText("16. ENTIRE AGREEMENT", 14, true);
      addText("This document constitutes the entire agreement between the Partners with respect to this Joint Venture. Any amendments must be in writing and signed by both Partners.");

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
      doc.text("Partner 1 Signature", margin, y + 5);
      doc.text(`Date: ${formData.partner1SignDate}`, margin + 100, y + 5);
      if (formData.partner1Signature) {
        try {
          doc.addImage(formData.partner1Signature, "PNG", margin, y - 20, 80, 20);
        } catch (error) {
          console.error("Error adding partner 1 signature image:", error);
          doc.text("(Signature)", margin, y - 5);
        }
      }
      
      y += 30;
      doc.line(margin, y, margin + 80, y);
      doc.text("Partner 2 Signature", margin, y + 5);
      doc.text(`Date: ${formData.partner2SignDate}`, margin + 100, y + 5);
      if (formData.partner2Signature) {
        try {
          doc.addImage(formData.partner2Signature, "PNG", margin, y - 20, 80, 20);
        } catch (error) {
          console.error("Error adding partner 2 signature image:", error);
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
          `RENOGRATE® Joint Venture Agreement - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      doc.save("renograte_joint_venture_agreement.pdf");
      
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
        templateId: "joint-venture",
        name: `Joint Venture Agreement - ${formData.projectName}`,
        propertyAddress: formData.projectAddress,
        partyOne: formData.partner1Name,
        partyTwo: formData.partner2Name,
        date: formData.agreementDate,
        terms: formData.projectDescription,
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
            type: "joint-venture",
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
        <h2 className="text-2xl font-bold tracking-tight">Create Joint Venture Agreement</h2>
        <p className="text-muted-foreground">
          Create a new joint venture partnership agreement
        </p>
      </div>

      <AgreementTemplate />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Partner 1 Information */}
          <Card>
            <CardHeader>
              <CardTitle>Partner 1 Information</CardTitle>
              <CardDescription>Enter the first partner's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partner1Name">Partner Name</Label>
                <Input
                  id="partner1Name"
                  placeholder="Enter partner's full name"
                  value={formData.partner1Name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner1Address">Partner Address</Label>
                <Input
                  id="partner1Address"
                  placeholder="Enter partner's address"
                  value={formData.partner1Address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner1Contribution">Initial Contribution (USD)</Label>
                <Input
                  id="partner1Contribution"
                  type="number"
                  placeholder="Enter contribution amount"
                  value={formData.partner1Contribution}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner1Percentage">Ownership Percentage</Label>
                <Input
                  id="partner1Percentage"
                  type="number"
                  placeholder="Enter ownership percentage"
                  value={formData.partner1Percentage}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Partner 2 Information */}
          <Card>
            <CardHeader>
              <CardTitle>Partner 2 Information</CardTitle>
              <CardDescription>Enter the second partner's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partner2Name">Partner Name</Label>
                <Input
                  id="partner2Name"
                  placeholder="Enter partner's full name"
                  value={formData.partner2Name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner2Address">Partner Address</Label>
                <Input
                  id="partner2Address"
                  placeholder="Enter partner's address"
                  value={formData.partner2Address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner2Contribution">Initial Contribution (USD)</Label>
                <Input
                  id="partner2Contribution"
                  type="number"
                  placeholder="Enter contribution amount"
                  value={formData.partner2Contribution}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner2Percentage">Ownership Percentage</Label>
                <Input
                  id="partner2Percentage"
                  type="number"
                  placeholder="Enter ownership percentage"
                  value={formData.partner2Percentage}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Enter the project details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectAddress">Project Address</Label>
                <Input
                  id="projectAddress"
                  placeholder="Enter project address"
                  value={formData.projectAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Enter project description"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Enter the project schedule</CardDescription>
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

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
              <CardDescription>Enter the financial information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalInvestment">Total Investment (USD)</Label>
                <Input
                  id="totalInvestment"
                  type="number"
                  placeholder="Enter total investment amount"
                  value={formData.totalInvestment}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profitSplitRatio">Profit Split Ratio</Label>
                <Input
                  id="profitSplitRatio"
                  placeholder="e.g., 50/50, 60/40"
                  value={formData.profitSplitRatio}
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
                label="Partner 1 Signature"
                signatureData={formData.partner1Signature}
                dateValue={formData.partner1SignDate}
                onSignatureChange={(value: string) => setFormData(prev => ({ ...prev, partner1Signature: value }))}
                onDateChange={(value: string) => setFormData(prev => ({ ...prev, partner1SignDate: value }))}
              />
              <SignatureBox
                label="Partner 2 Signature"
                signatureData={formData.partner2Signature}
                dateValue={formData.partner2SignDate}
                onSignatureChange={(value: string) => setFormData(prev => ({ ...prev, partner2Signature: value }))}
                onDateChange={(value: string) => setFormData(prev => ({ ...prev, partner2SignDate: value }))}
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
        <CardTitle>Joint Venture Agreement Template</CardTitle>
        <CardDescription>Please review the agreement template before filling out the form</CardDescription>
      </CardHeader>
      <CardContent className="prose max-w-none">
        <div className="space-y-4 text-sm">
          <h1 className="text-2xl font-bold text-center">Renograte® Joint Venture Agreement</h1>
          
          <p className="text-muted-foreground">
            {`This Joint Venture Agreement ("Agreement") is entered into by and between the parties identified below, collectively referred to as "Partners". This Agreement establishes the terms and conditions for a joint venture partnership in real estate investment and development.`}
          </p>

          <div className="border-b pb-2">
            <p className="font-semibold">Project Name: _________________________</p>
            <p className="font-semibold">Project Address: _________________________</p>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="font-semibold">1. Formation and Purpose</h3>
              <p>The Partners hereby form a Joint Venture for the purpose of:</p>
              <ul className="list-disc pl-6">
                <li>Acquiring, developing, and/or renovating the specified property</li>
                <li>Managing the property improvement process</li>
                <li>Marketing and selling the property</li>
                <li>Sharing profits according to the agreed-upon terms</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">2. Capital Contributions</h3>
              <p>The Partners shall make the following initial capital contributions:</p>
              <ul className="list-disc pl-6">
                <li>Partner 1 Contribution: $_____________</li>
                <li>Partner 1 Ownership Percentage: ______________%</li>
                <li>Partner 2 Contribution: $_____________</li>
                <li>Partner 2 Ownership Percentage: ______________%</li>
              </ul>
              <p>Total Project Investment: $_____________</p>
            </section>

            <section>
              <h3 className="font-semibold">3. Profit and Loss Sharing</h3>
              <p>Profits and losses shall be distributed according to the following ratio: _____________</p>
              <p>Distribution of profits shall occur:</p>
              <ul className="list-disc pl-6">
                <li>Upon sale of the property</li>
                <li>After repayment of all project expenses and capital contributions</li>
                <li>According to the agreed profit-sharing ratio</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">4. Management and Control</h3>
              <p>The Partners shall have the following responsibilities:</p>
              <ul className="list-disc pl-6">
                <li>Joint decision-making on major project aspects</li>
                <li>Regular project status meetings and updates</li>
                <li>Shared access to project documentation and financial records</li>
                <li>Equal voting rights on major decisions</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">5. Project Timeline</h3>
              <p>The project shall adhere to the following schedule:</p>
              <ul className="list-disc pl-6">
                <li>Start Date: _____________</li>
                <li>Estimated Completion Date: _____________</li>
                <li>Key milestones to be documented in project plan</li>
                <li>Regular progress reviews and timeline updates</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">6. Expenses and Accounting</h3>
              <p>Project expenses shall be managed as follows:</p>
              <ul className="list-disc pl-6">
                <li>Separate project bank account</li>
                <li>Detailed expense tracking and documentation</li>
                <li>Monthly financial reporting</li>
                <li>Shared access to financial records</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">7. Exit Strategy</h3>
              <p>The Joint Venture shall terminate upon:</p>
              <ul className="list-disc pl-6">
                <li>Sale of the property</li>
                <li>Mutual agreement of Partners</li>
                <li>Achievement of project objectives</li>
                <li>Legal dissolution requirements</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">8. Dispute Resolution</h3>
              <p>Any disputes shall be resolved through:</p>
              <ul className="list-disc pl-6">
                <li>Good faith negotiation between Partners</li>
                <li>Mediation if necessary</li>
                <li>Binding arbitration as a last resort</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">9. Insurance and Liability</h3>
              <p>The Joint Venture shall maintain appropriate insurance coverage for:</p>
              <ul className="list-disc pl-6">
                <li>Property damage</li>
                <li>General liability</li>
                <li>Workers' compensation</li>
                <li>Other necessary coverage</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">10. Signatures</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p>Partner 1 Signature: _________________________</p>
                  <p>Date: _________________________</p>
                </div>
                <div>
                  <p>Partner 2 Signature: _________________________</p>
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