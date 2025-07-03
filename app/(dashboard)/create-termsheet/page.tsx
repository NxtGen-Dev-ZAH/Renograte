"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronDown, ChevronUp, FileDown } from "lucide-react";
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";

interface TermSheetFormData {
  // Property Information
  propertyAddress: string;
  propertyCondition: string;
  
  // Parties Involved
  sellerName: string;
  buyerName: string;
  realEstateAgent: string;
  proposedContractor: string;
  
  // Transaction Framework
  estimatedSalePrice: string;
  currentMarketValue: string;
  renovationAllowance: string;
  allowanceSource: string;
  renovationTimeline: string;
  targetClosingDate: string;
  
  // Option Structure
  optionFee: string;
  optionPeriod: string;
  propertyAccess: boolean;
  contingencyTerms: string;
  
  // Renovation Scope
  generalScope: string[];
  preliminaryEstimate: string;
  
  // Signatures
  buyerName_sign: string;
  sellerName_sign: string;
  agentName_sign: string;
  
  // Metadata
  dateIssued: string;
  termSheetId: string;
  otherAllowanceSource: string;
  otherGeneralScope: string;
}

interface TermSheetHistory {
  formData: TermSheetFormData;
  timestamp: string;
}

export default function CreateTermSheetPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [termSheetHistory, setTermSheetHistory] = useState<TermSheetHistory[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<TermSheetFormData>({
    propertyAddress: "",
    propertyCondition: "",
    sellerName: "",
    buyerName: "",
    realEstateAgent: "",
    proposedContractor: "",
    estimatedSalePrice: "",
    currentMarketValue: "",
    renovationAllowance: "",
    allowanceSource: "",
    renovationTimeline: "",
    targetClosingDate: "",
    optionFee: "",
    optionPeriod: "",
    propertyAccess: false,
    contingencyTerms: "",
    generalScope: [],
    preliminaryEstimate: "",
    buyerName_sign: "",
    sellerName_sign: "",
    agentName_sign: "",
    dateIssued: new Date().toISOString().split('T')[0],
    termSheetId: `TS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    otherAllowanceSource: "",
    otherGeneralScope: ""
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

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleScopeChange = (scope: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      generalScope: checked 
        ? [...prev.generalScope, scope]
        : prev.generalScope.filter(s => s !== scope)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement API endpoint for term sheets
      const response = await fetch("/api/term-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit term sheet");
      }

      toast({
        title: "Success!",
        description: "Your term sheet has been created successfully.",
        variant: "default",
      });

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error submitting term sheet:", error);
      toast({
        title: "Error",
        description: "Failed to submit term sheet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = () => {
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = 20;
      
      // Helper function for adding text with proper wrapping
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += (lines.length * fontSize * 0.352778) + 5; // Add spacing after text
      };
      
      // Helper function for adding section headers
      const addSectionHeader = (text: string, number: string) => {
        y += 5;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${number}. ${text}`, margin, y);
        y += 10;
      };

      // Add logo and title
      doc.setFillColor(0, 48, 87); // Dark blue header
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("RENOGRATE® TERM SHEET", pageWidth/2, 25, { align: "center" });
      
      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      y = 50;
      
      // Subtitle
      addText("Pre-Contract Summary of Terms for Renovation-Enabled Real Estate Transaction", 12, true);
      
      // Metadata
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, contentWidth, 25, "F");
      doc.line(margin, y, margin + contentWidth, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`Date Issued: ${formData.dateIssued}`, margin + 5, y);
      doc.text(`Term Sheet ID: ${formData.termSheetId}`, pageWidth - margin - 80, y);
      y += 20;
      
      // 1. Property Information
      addSectionHeader("PROPERTY INFORMATION", "1");
      addText(`Property Address: ${formData.propertyAddress}`);
      addText(`Current Property Condition: ${formData.propertyCondition}`);
      
      // 2. Parties Involved
      addSectionHeader("PARTIES INVOLVED", "2");
      addText(`Seller Name(s): ${formData.sellerName}`);
      addText(`Buyer Name(s): ${formData.buyerName}`);
      addText(`Real Estate Agent (If Any): ${formData.realEstateAgent || "N/A"}`);
      addText(`Contractor (Proposed): ${formData.proposedContractor || "N/A"}`);
      
      // 3. Transaction Framework
      addSectionHeader("TRANSACTION FRAMEWORK", "3");
      addText(`Estimated Sale Price (After Renovation Value / ARV): $${formData.estimatedSalePrice}`);
      addText(`Estimated Current Market Value (As-Is): $${formData.currentMarketValue}`);
      addText(`Proposed Renovation Allowance: $${formData.renovationAllowance}`);
      addText(`Source of Allowance: ${formData.allowanceSource}${formData.otherAllowanceSource ? ` (${formData.otherAllowanceSource})` : ""}`);
      addText(`Renovation Timeline (Estimated): ${formData.renovationTimeline} days`);
      addText(`Target Closing Date: ${formData.targetClosingDate}`);
      
      // Check if we need a new page
      if (y > doc.internal.pageSize.height - 60) {
        doc.addPage();
        y = 20;
      }
      
      // 4. Option Structure
      addSectionHeader("OPTION STRUCTURE", "4");
      addText(`Option Fee / Earnest Money Deposit (EMD): $${formData.optionFee}`);
      addText(`Option Period: ${formData.optionPeriod} days`);
      addText(`Right to Access Property During Option Period: ${formData.propertyAccess ? "Yes" : "No"}`);
      if (formData.contingencyTerms) {
        addText(`Contingency Terms:\n${formData.contingencyTerms}`);
      }
      
      // 5. Renovation Scope
      addSectionHeader("RENOVATION SCOPE", "5");
      addText("General Scope:");
      formData.generalScope.forEach(scope => {
        addText(`• ${scope}`, 11);
      });
      if (formData.otherGeneralScope) {
        addText(`• Other: ${formData.otherGeneralScope}`, 11);
      }
      addText(`Preliminary Estimate: $${formData.preliminaryEstimate}`);
      
      // Check if we need a new page for signatures
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 20;
      }
      
      // 6. Representations
      addSectionHeader("REPRESENTATIONS", "6");
      addText("• Buyer understands that this Term Sheet is non-binding and does not guarantee final sale.", 10);
      addText("• Seller agrees not to market the home to other parties during the agreed option period (once contract is executed).", 10);
      addText("• Parties agree to proceed in good faith toward executing a RENOGRATE® Option Contract and accompanying PSA.", 10);
      addText("• Renovations will not begin until the Renograte Option Contract and all necessary addenda are signed.", 10);
      
      // 7. Signatures
      addSectionHeader("SIGNATURES", "7");
      addText("For Acknowledgement Only — Not Legally Binding", 10, true);
      
      y += 10;
      // Buyer signature
      doc.line(margin, y, margin + 80, y);
      y += 5;
      doc.setFontSize(10);
      doc.text("Buyer Signature", margin, y);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin + 100, y);
      if (formData.buyerName_sign) {
        y += 15;
        doc.text(`Name: ${formData.buyerName_sign}`, margin, y);
      }
      
      y += 20;
      // Seller signature
      doc.line(margin, y, margin + 80, y);
      y += 5;
      doc.text("Seller Signature", margin, y);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin + 100, y);
      if (formData.sellerName_sign) {
        y += 15;
        doc.text(`Name: ${formData.sellerName_sign}`, margin, y);
      }
      
      y += 20;
      // Agent signature (if applicable)
      if (formData.agentName_sign) {
        doc.line(margin, y, margin + 80, y);
        y += 5;
        doc.text("Agent Signature", margin, y);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, margin + 100, y);
        y += 15;
        doc.text(`Name: ${formData.agentName_sign}`, margin, y);
      }
      
      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `RENOGRATE® Term Sheet - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }
      
      // Save the PDF
      doc.save("renograte_term_sheet.pdf");
      
      toast({
        title: "PDF Generated",
        description: "Your term sheet has been saved as a PDF.",
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

  const saveTermSheet = () => {
    const historyEntry: TermSheetHistory = {
      formData: { ...formData },
      timestamp: new Date().toISOString(),
    };

    setTermSheetHistory(prev => [historyEntry, ...prev]);
    
    toast({
      title: "Term Sheet Saved",
      description: "Your term sheet has been saved to history.",
    });
  };

  const loadTermSheet = (savedTermSheet: TermSheetHistory) => {
    setFormData(savedTermSheet.formData);
    
    toast({
      title: "Term Sheet Loaded",
      description: "Previous term sheet has been loaded successfully.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Term Sheet</h2>
        <p className="text-muted-foreground">
          Create a new RENOGRATE® Term Sheet for a renovation-enabled real estate transaction
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Term Sheet Information</CardTitle>
            <CardDescription>
              Basic information about this term sheet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateIssued">Date Issued</Label>
              <Input
                id="dateIssued"
                type="date"
                value={formData.dateIssued}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termSheetId">Term Sheet ID</Label>
              <Input
                id="termSheetId"
                value={formData.termSheetId}
                readOnly
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle>1. Property Information</CardTitle>
            <CardDescription>
              Enter the property details and current condition
            </CardDescription>
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
              <Label htmlFor="propertyCondition">Current Property Condition</Label>
              <Select
                value={formData.propertyCondition}
                onValueChange={(value) => handleSelectChange("propertyCondition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Livable">Livable</SelectItem>
                  <SelectItem value="Requires Renovation">Requires Renovation</SelectItem>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                  <SelectItem value="Distressed">Distressed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Parties Involved */}
        <Card>
          <CardHeader>
            <CardTitle>2. Parties Involved</CardTitle>
            <CardDescription>
              Enter information about all parties involved in the transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sellerName">Seller Name(s)</Label>
              <Input
                id="sellerName"
                placeholder="Enter seller name(s)"
                value={formData.sellerName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerName">Buyer Name(s)</Label>
              <Input
                id="buyerName"
                placeholder="Enter buyer name(s)"
                value={formData.buyerName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="realEstateAgent">Real Estate Agent (If Any)</Label>
              <Input
                id="realEstateAgent"
                placeholder="Enter agent name"
                value={formData.realEstateAgent}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedContractor">Contractor (Proposed)</Label>
              <Input
                id="proposedContractor"
                placeholder="Enter contractor name"
                value={formData.proposedContractor}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transaction Framework */}
        <Card>
          <CardHeader>
            <CardTitle>3. Transaction Framework</CardTitle>
            <CardDescription>
              Enter the financial and timeline details of the transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedSalePrice">Estimated Sale Price (ARV)</Label>
              <Input
                id="estimatedSalePrice"
                type="number"
                placeholder="Enter estimated ARV"
                value={formData.estimatedSalePrice}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentMarketValue">Current Market Value (As-Is)</Label>
              <Input
                id="currentMarketValue"
                type="number"
                placeholder="Enter current value"
                value={formData.currentMarketValue}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renovationAllowance">Proposed Renovation Allowance</Label>
              <Input
                id="renovationAllowance"
                type="number"
                placeholder="Enter renovation allowance"
                value={formData.renovationAllowance}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowanceSource">Source of Allowance</Label>
              <Select
                value={formData.allowanceSource}
                onValueChange={(value) => handleSelectChange("allowanceSource", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select allowance source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Seller Concession">Seller Concession</SelectItem>
                  <SelectItem value="Buyer Financing">Buyer Financing</SelectItem>
                  <SelectItem value="Combination">Combination</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.allowanceSource === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="otherAllowanceSource">Specify Other Source</Label>
                <Input
                  id="otherAllowanceSource"
                  placeholder="Enter other source"
                  value={formData.otherAllowanceSource}
                  onChange={handleInputChange}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="renovationTimeline">Renovation Timeline (Days)</Label>
              <Input
                id="renovationTimeline"
                type="number"
                placeholder="Enter estimated days"
                value={formData.renovationTimeline}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetClosingDate">Target Closing Date</Label>
              <Input
                id="targetClosingDate"
                type="date"
                value={formData.targetClosingDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Option Structure */}
        <Card>
          <CardHeader>
            <CardTitle>4. Option Structure</CardTitle>
            <CardDescription>
              Specify the option terms and contingencies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="optionFee">Option Fee / EMD</Label>
              <Input
                id="optionFee"
                type="number"
                placeholder="Enter option fee amount"
                value={formData.optionFee}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="optionPeriod">Option Period (Days)</Label>
              <Input
                id="optionPeriod"
                type="number"
                placeholder="Enter number of days"
                value={formData.optionPeriod}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="propertyAccess"
                  checked={formData.propertyAccess}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("propertyAccess", checked as boolean)
                  }
                />
                <Label htmlFor="propertyAccess">
                  Right to Access Property During Option Period
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contingencyTerms">Contingency Terms</Label>
              <Textarea
                id="contingencyTerms"
                placeholder="Enter contingency terms (e.g., Inspection, Appraisal)"
                value={formData.contingencyTerms}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Renovation Scope */}
        <Card>
          <CardHeader>
            <CardTitle>5. Renovation Scope</CardTitle>
            <CardDescription>
              Specify the preliminary renovation scope and estimate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>General Scope</Label>
              <div className="space-y-2">
                {[
                  "Cosmetic Upgrades",
                  "Kitchen/Bath Remodel",
                  "Flooring/Painting",
                  "Structural/Mechanical",
                  "Exterior/Landscaping",
                  "Other"
                ].map((scope) => (
                  <div key={scope} className="flex items-center space-x-2">
                    <Checkbox
                      id={`scope-${scope}`}
                      checked={formData.generalScope.includes(scope)}
                      onCheckedChange={(checked) => 
                        handleScopeChange(scope, checked as boolean)
                      }
                    />
                    <Label htmlFor={`scope-${scope}`}>{scope}</Label>
                  </div>
                ))}
              </div>
            </div>
            {formData.generalScope.includes("Other") && (
              <div className="space-y-2">
                <Label htmlFor="otherGeneralScope">Specify Other Scope</Label>
                <Input
                  id="otherGeneralScope"
                  placeholder="Enter other scope details"
                  value={formData.otherGeneralScope}
                  onChange={handleInputChange}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="preliminaryEstimate">Preliminary Estimate</Label>
              <Input
                id="preliminaryEstimate"
                type="number"
                placeholder="Enter preliminary estimate amount"
                value={formData.preliminaryEstimate}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Signatures */}
        <Card>
          <CardHeader>
            <CardTitle>7. Signatures</CardTitle>
            <CardDescription>
              Enter names for acknowledgement (not legally binding)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buyerName_sign">Buyer Name</Label>
              <Input
                id="buyerName_sign"
                placeholder="Enter buyer name"
                value={formData.buyerName_sign}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellerName_sign">Seller Name</Label>
              <Input
                id="sellerName_sign"
                placeholder="Enter seller name"
                value={formData.sellerName_sign}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentName_sign">Agent Name</Label>
              <Input
                id="agentName_sign"
                placeholder="Enter agent name"
                value={formData.agentName_sign}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Save Button at the bottom of the last card */}
        <div className="col-span-2 flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={saveTermSheet}
            className="bg-[#0C71C3] text-white hover:bg-[#0C71C3]/90"
          >
            Save Term Sheet
          </Button>
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
              "Submit Term Sheet"
            )}
          </Button>
        </div>

        {/* Term Sheet History */}
        <Card className="md:col-span-2 bg-white/95 backdrop-blur-sm border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0C71C3] font-bold">Term Sheet History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {termSheetHistory.map((entry, index) => (
                <div
                  key={entry.timestamp}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">Term Sheet {termSheetHistory.length - index}</p>
                    <p className="text-sm text-gray-500">
                      Property: {entry.formData.propertyAddress}
                    </p>
                    <p className="text-sm text-gray-500">
                      Seller: {entry.formData.sellerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Buyer: {entry.formData.buyerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      ARV: ${parseFloat(entry.formData.estimatedSalePrice).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTermSheet(entry)}
                      className="bg-[#0C71C3] text-white hover:bg-[#0C71C3]/90"
                    >
                      Load
                    </Button>
                  </div>
                </div>
              ))}
              {termSheetHistory.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No term sheet history yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
