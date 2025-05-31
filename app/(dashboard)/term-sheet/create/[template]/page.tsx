"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { contractTemplates, getTemplateById } from "@/lib/contracts/templates";
import { saveTermSheet } from "@/lib/contracts/service";
import { use } from "react";

// Template-specific form fields
const templateFields = {
  purchase: [
    { id: "purchasePrice", label: "Purchase Price", type: "number" },
    { id: "earnestMoney", label: "Earnest Money", type: "number" },
    { id: "balanceDue", label: "Balance Due", type: "number" },
    { id: "closingDate", label: "Closing Date", type: "date" },
    { id: "possessionDate", label: "Possession Date", type: "date" },
    { id: "inspectionDays", label: "Inspection Period (Days)", type: "number" },
    { id: "deedType", label: "Deed Type", type: "text" },
  ],
  renovation: [
    { id: "scopeOfWork", label: "Scope of Work", type: "textarea" },
    { id: "contractPrice", label: "Contract Price", type: "number" },
    { id: "downPayment", label: "Down Payment", type: "number" },
    { id: "progressPayments", label: "Progress Payments", type: "text" },
    { id: "finalPayment", label: "Final Payment", type: "number" },
    { id: "completionDate", label: "Completion Date", type: "date" },
    { id: "warrantyPeriod", label: "Warranty Period", type: "text" },
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
      router.push("/term-sheet");
    }
  }, [templateId, router, toast]);

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCreateTermSheet = () => {
    if (!templateId || !documentName || !formData.propertyAddress || !formData.partyOne || !formData.partyTwo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create new term sheet
      const newSheet = saveTermSheet({
        templateId: templateId,
        name: documentName,
        propertyAddress: formData.propertyAddress,
        partyOne: formData.partyOne,
        partyTwo: formData.partyTwo,
        date: formData.date,
        terms: formData.terms,
        data: { ...formData },
      });

      toast({
        title: "Term Sheet Created",
        description: "Your term sheet has been created successfully.",
      });

      // Navigate to the term sheet view
      router.push(`/term-sheet/${newSheet.id}`);
    } catch (error) {
      console.error("Error creating term sheet:", error);
      toast({
        title: "Error",
        description: "Failed to create term sheet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderTemplateFields = () => {
    if (!templateId || !templateFields[templateId as keyof typeof templateFields]) {
      return null;
    }

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
            onClick={() => router.push("/term-sheet")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Term Sheets
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