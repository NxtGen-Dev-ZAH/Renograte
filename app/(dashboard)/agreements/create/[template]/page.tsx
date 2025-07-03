"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contractTemplates, getTemplateById } from "@/lib/contracts/templates";
import { saveTermSheet } from "@/lib/contracts/service";
import { use } from "react";

// Template-specific form fields
const templateFields = {
  "service-provider": [
    { id: "startDate", label: "Start Date", type: "date" },
    { id: "completionDate", label: "Estimated Completion Date", type: "date" },
    { id: "scopeOfWork", label: "Scope of Work", type: "textarea" },
    { id: "contractPrice", label: "Contract Price", type: "number" },
    { id: "downPayment", label: "Down Payment", type: "number" },
    { id: "progressPayments", label: "Progress Payments", type: "text" },
    { id: "finalPayment", label: "Final Payment", type: "number" },
    { id: "warrantyPeriod", label: "Warranty Period", type: "text" },
  ],
  "option-contract": [
    { id: "date", label: "Date", type: "date" },
    { id: "sellerName", label: "Seller Name", type: "text" },
    { id: "sellerAddress", label: "Seller Address", type: "text" },
    { id: "buyerName", label: "Buyer Name", type: "text" },
    { id: "buyerAddress", label: "Buyer Address", type: "text" },
    { id: "arvSalePrice", label: "ARV Sale Price", type: "number" },
    { id: "earnestMoney", label: "Earnest Money Deposit", type: "number" },
    { id: "mortgageAllowance", label: "Mortgage Expense Allowance", type: "number" },
    { id: "mortgageMonths", label: "Mortgage Allowance Months", type: "number" },
    { id: "terms", label: "Additional Terms", type: "textarea" },
  ],
  "joint-venture": [
    { id: "purpose", label: "Purpose of Joint Venture", type: "textarea" },
    { id: "contributionOne", label: "First Party Contribution", type: "number" },
    { id: "percentageOne", label: "First Party Percentage", type: "number" },
    { id: "contributionTwo", label: "Second Party Contribution", type: "number" },
    { id: "percentageTwo", label: "Second Party Percentage", type: "number" },
    { id: "profitOne", label: "First Party Profit %", type: "number" },
    { id: "profitTwo", label: "Second Party Profit %", type: "number" },
    { id: "startDate", label: "Start Date", type: "date" },
    { id: "endDate", label: "End Date", type: "date" },
    { id: "management", label: "Management Structure", type: "textarea" },
  ],
  "lease-option": [
    { id: "leaseTerm", label: "Lease Term", type: "text" },
    { id: "leaseStart", label: "Lease Start Date", type: "date" },
    { id: "leaseEnd", label: "Lease End Date", type: "date" },
    { id: "monthlyRent", label: "Monthly Rent", type: "number" },
    { id: "rentDueDay", label: "Rent Due Day", type: "number" },
    { id: "optionStart", label: "Option Start Date", type: "date" },
    { id: "optionEnd", label: "Option End Date", type: "date" },
    { id: "purchasePrice", label: "Purchase Price", type: "number" },
    { id: "optionFee", label: "Option Fee", type: "number" },
    { id: "rentCredit", label: "Rent Credit", type: "text" },
    { id: "exerciseDeadline", label: "Exercise Deadline", type: "date" },
  ],
};

export default function CreateContractPage({ params }: { params: Promise<{ template: string }> }) {
  const resolvedParams = use(params);
  const templateId = resolvedParams.template;
  const [templateInfo, setTemplateInfo] = useState<any>(null);
  const [documentName, setDocumentName] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({
    propertyAddress: "",
    partyOne: "",
    partyTwo: "",
    date: new Date().toISOString().split("T")[0],
    terms: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const template = getTemplateById(templateId);
    if (template) {
      setTemplateInfo(template);
      setDocumentName(`${template.name} - New`);
    } else {
      toast({
        title: "Invalid Template",
        description: "The requested template could not be found.",
        variant: "destructive",
      });
      router.push("/agreements");
    }
  }, [templateId, router, toast]);

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const renderTemplateFields = () => {
    if (!templateId || !templateFields[templateId as keyof typeof templateFields]) {
      return null;
    }

    // Special handling for Renograte Service Provider Agreement
    if (templateId === "service-provider") {
      return (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-md border">
            <h3 className="font-bold text-lg mb-4">Renograte® Service Provider Agreement</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Agreement Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input
                  id="propertyAddress"
                  value={formData.propertyAddress || ""}
                  onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                  placeholder="Enter property address"
                />
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="partyOne">Seller Name</Label>
                <Input
                  id="partyOne"
                  value={formData.partyOne || ""}
                  onChange={(e) => handleInputChange("partyOne", e.target.value)}
                  placeholder="Enter seller name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partyTwo">Buyer Name</Label>
                <Input
                  id="partyTwo"
                  value={formData.partyTwo || ""}
                  onChange={(e) => handleInputChange("partyTwo", e.target.value)}
                  placeholder="Enter buyer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractor">Contractor Name</Label>
                <Input
                  id="contractor"
                  value={formData.contractor || ""}
                  onChange={(e) => handleInputChange("contractor", e.target.value)}
                  placeholder="Enter contractor name"
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-4">
              <h4 className="font-medium">1. Scope of Work</h4>
              <div className="space-y-2">
                <Label htmlFor="scopeOfWork">Description of Work</Label>
                <Textarea
                  id="scopeOfWork"
                  value={formData.scopeOfWork || ""}
                  onChange={(e) => handleInputChange("scopeOfWork", e.target.value)}
                  rows={3}
                  placeholder="Detailed description of renovation services"
                />
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completionDate">Estimated Completion Date</Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={formData.completionDate || ""}
                  onChange={(e) => handleInputChange("completionDate", e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-4">
              <h4 className="font-medium">3. Compensation and Payment Terms</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contractPrice">Contract Price ($)</Label>
                  <Input
                    id="contractPrice"
                    type="number"
                    value={formData.contractPrice || ""}
                    onChange={(e) => handleInputChange("contractPrice", e.target.value)}
                    placeholder="Total contract amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downPayment">Down Payment ($)</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={formData.downPayment || ""}
                    onChange={(e) => handleInputChange("downPayment", e.target.value)}
                    placeholder="Initial payment amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="finalPayment">Final Payment ($)</Label>
                  <Input
                    id="finalPayment"
                    type="number"
                    value={formData.finalPayment || ""}
                    onChange={(e) => handleInputChange("finalPayment", e.target.value)}
                    placeholder="Final payment amount"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="progressPayments">Progress Payment Schedule</Label>
                <Textarea
                  id="progressPayments"
                  value={formData.progressPayments || ""}
                  onChange={(e) => handleInputChange("progressPayments", e.target.value)}
                  rows={2}
                  placeholder="Describe the payment schedule (e.g., '30% at framing, 30% at drywall')"
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Label htmlFor="warrantyPeriod">5. Warranty Period</Label>
              <Input
                id="warrantyPeriod"
                value={formData.warrantyPeriod || ""}
                onChange={(e) => handleInputChange("warrantyPeriod", e.target.value)}
                placeholder="e.g., '1 year from completion'"
              />
            </div>
            
            <div className="mt-4 space-y-2">
              <Label htmlFor="terms">Additional Terms</Label>
              <Textarea
                id="terms"
                value={formData.terms || ""}
                onChange={(e) => handleInputChange("terms", e.target.value)}
                rows={3}
                placeholder="Any additional terms or special conditions"
              />
            </div>
          </div>
        </div>
      );
    }
    
    // Special handling for Renograte Option Contract
    if (templateId === "option-contract") {
      return (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-md border">
            <h3 className="font-bold text-lg mb-4">Renograte® Option Agreement to Renovate Real Estate</h3>
            
            <div className="space-y-2">
              <Label htmlFor="date">Agreement Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ""}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </div>
            
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Seller Information</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerName">Seller Name</Label>
                    <Input
                      id="sellerName"
                      value={formData.sellerName || ""}
                      onChange={(e) => handleInputChange("sellerName", e.target.value)}
                      placeholder="Enter seller name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerAddress">Seller Address</Label>
                    <Input
                      id="sellerAddress"
                      value={formData.sellerAddress || ""}
                      onChange={(e) => handleInputChange("sellerAddress", e.target.value)}
                      placeholder="Enter seller address"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Buyer Information</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyerName">Buyer Name</Label>
                    <Input
                      id="buyerName"
                      value={formData.buyerName || ""}
                      onChange={(e) => handleInputChange("buyerName", e.target.value)}
                      placeholder="Enter buyer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyerAddress">Buyer Address</Label>
                    <Input
                      id="buyerAddress"
                      value={formData.buyerAddress || ""}
                      onChange={(e) => handleInputChange("buyerAddress", e.target.value)}
                      placeholder="Enter buyer address"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input
                id="propertyAddress"
                value={formData.propertyAddress || ""}
                onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                placeholder="Enter property address"
              />
            </div>
            
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="arvSalePrice">ARV Sale Price ($)</Label>
                <Input
                  id="arvSalePrice"
                  type="number"
                  value={formData.arvSalePrice || ""}
                  onChange={(e) => handleInputChange("arvSalePrice", e.target.value)}
                  placeholder="After Renovation Value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="earnestMoney">Earnest Money Deposit ($)</Label>
                <Input
                  id="earnestMoney"
                  type="number"
                  value={formData.earnestMoney || ""}
                  onChange={(e) => handleInputChange("earnestMoney", e.target.value)}
                  placeholder="EMD amount"
                />
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mortgageAllowance">Mortgage Expense Allowance ($)</Label>
                <Input
                  id="mortgageAllowance"
                  type="number"
                  value={formData.mortgageAllowance || ""}
                  onChange={(e) => handleInputChange("mortgageAllowance", e.target.value)}
                  placeholder="Optional mortgage allowance"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mortgageMonths">Mortgage Allowance Months</Label>
                <Input
                  id="mortgageMonths"
                  type="number"
                  value={formData.mortgageMonths || ""}
                  onChange={(e) => handleInputChange("mortgageMonths", e.target.value)}
                  placeholder="Number of months"
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Label htmlFor="terms">Additional Terms</Label>
              <Textarea
                id="terms"
                value={formData.terms || ""}
                onChange={(e) => handleInputChange("terms", e.target.value)}
                rows={3}
                placeholder="Any additional terms or special conditions"
              />
            </div>
          </div>
        </div>
      );
    }

    // Default rendering for other templates
    return templateFields[templateId as keyof typeof templateFields].map((field) => (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id}>{field.label}</Label>
        {field.type === "textarea" ? (
          <Textarea
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            rows={3}
          />
        ) : (
          <Input
            id={field.id}
            type={field.type}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        )}
      </div>
    ));
  };

  const handleCreateTermSheet = async () => {
    if (!templateId || !documentName || !formData.propertyAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get the template function
      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // Generate the document content using the template
      const documentContent = template.template(formData);

      // Create a PDF from the HTML content (this would normally be done server-side)
      // For this example, we'll simulate it by uploading the content to S3
      let documentUrl = "";

      try {
        // In a real implementation, you would generate a PDF here
        // For now, we'll use the template's preview URL
        if (templateId === "service-provider") {
          documentUrl = "/Renograte_Service_Provider_Agreement.pdf";
        } else if (templateId === "option-contract") {
          documentUrl = "/Renograte_Option_Agreement_Final.pdf";
        } else {
          // For other templates, use a sample URL
          documentUrl = `/sample-contracts/${templateId}.pdf`;
        }

        // In a real implementation, you would upload the generated PDF to S3
        // const formData = new FormData();
        // formData.append('file', pdfBlob);
        // const response = await fetch('/api/upload', {
        //   method: 'POST',
        //   body: formData,
        // });
        // const data = await response.json();
        // documentUrl = `/api/s3-proxy?key=${data.fileKey}`;
      } catch (error) {
        console.error('Error creating/uploading PDF:', error);
        throw new Error('Failed to create document');
      }

      // Create new term sheet
      const newSheet = saveTermSheet({
        templateId: templateId,
        name: documentName,
        propertyAddress: formData.propertyAddress,
        partyOne: formData.partyOne || formData.sellerName,
        partyTwo: formData.partyTwo || formData.buyerName,
        date: formData.date,
        terms: formData.terms,
        documentUrl: documentUrl,
        data: { ...formData },
      });

      toast({
        title: "Agreement Created",
        description: "Your agreement has been created successfully.",
      });

      // Navigate to the term sheet view
      router.push(`/agreements/${newSheet.id}`);
    } catch (error) {
      console.error("Error creating agreement:", error);
      toast({
        title: "Error",
        description: "Failed to create agreement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!templateInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/agreements")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agreements
          </Button>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{templateInfo.name}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create {templateInfo.name}</CardTitle>
          <CardDescription>
            Fill in the details to create your {templateInfo.name.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              placeholder="Enter document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="date"
                type="date"
                className="pl-9"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Property Address</Label>
            <Input
              id="propertyAddress"
              placeholder="Enter property address"
              value={formData.propertyAddress}
              onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partyOne">
                {templateId === "purchase" ? "Seller" : 
                 templateId === "renovation" ? "Property Owner" :
                 templateId === "joint-venture" ? "First Party" :
                 templateId === "lease-option" ? "Landlord" : "Party One"}
              </Label>
              <Input
                id="partyOne"
                placeholder="Enter name"
                value={formData.partyOne}
                onChange={(e) => handleInputChange("partyOne", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partyTwo">
                {templateId === "purchase" ? "Buyer" : 
                 templateId === "renovation" ? "Contractor" :
                 templateId === "joint-venture" ? "Second Party" :
                 templateId === "lease-option" ? "Tenant" : "Party Two"}
              </Label>
              <Input
                id="partyTwo"
                placeholder="Enter name"
                value={formData.partyTwo}
                onChange={(e) => handleInputChange("partyTwo", e.target.value)}
              />
            </div>
          </div>

          {/* Template-specific fields */}
          <div className="grid gap-6 md:grid-cols-2">
            {renderTemplateFields()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Additional Terms</Label>
            <Textarea
              id="terms"
              placeholder="Enter additional terms and conditions"
              rows={4}
              value={formData.terms}
              onChange={(e) => handleInputChange("terms", e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleCreateTermSheet}
            >
              <Save className="mr-2 h-4 w-4" />
              Create Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 