"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText, Upload, Plus, Trash2, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PDFViewer } from "@/components/PDFViewer";
import { ContractRole } from "@/lib/contracts/contractService";

interface ContractSection {
  title: string;
  description?: string;
  pageNumber: number;
  role: ContractRole;
  required: boolean;
}

interface ContractTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  previewUrl: string;
  sections: {
    title: string;
    role: string;
    pageNumber: number;
  }[];
}

export default function CreateContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState("template");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sections, setSections] = useState<ContractSection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

  // Templates data (same as in the contracts page)
  const templates = [
    {
      id: 1,
      name: "Standard Purchase Agreement",
      description: "Basic template for property purchases",
      category: "purchase",
      previewUrl: "/sample-contracts/purchase-agreement.pdf",
      sections: [
        { title: "Buyer Information", role: "BUYER", pageNumber: 1 },
        { title: "Seller Information", role: "SELLER", pageNumber: 1 },
        { title: "Property Details", role: "AGENT", pageNumber: 2 },
        { title: "Purchase Terms", role: "BUYER", pageNumber: 3 },
        { title: "Buyer Signature", role: "BUYER", pageNumber: 5 },
        { title: "Seller Signature", role: "SELLER", pageNumber: 5 },
      ]
    },
    { 
      id: 2,
      name: "Renovation Contract",
      description: "Template for renovation projects",
      category: "renovation",
      previewUrl: "/sample-contracts/renovation-contract.pdf",
      sections: [
        { title: "Client Information", role: "BUYER", pageNumber: 1 },
        { title: "Contractor Information", role: "CONTRACTOR", pageNumber: 1 },
        { title: "Project Scope", role: "CONTRACTOR", pageNumber: 2 },
        { title: "Cost Breakdown", role: "CONTRACTOR", pageNumber: 3 },
        { title: "Client Signature", role: "BUYER", pageNumber: 4 },
        { title: "Contractor Signature", role: "CONTRACTOR", pageNumber: 4 },
      ]
    },
    {
      id: 3,
      name: "Property Management Agreement",
      description: "Template for property management services",
      category: "management",
      previewUrl: "/sample-contracts/property-management.pdf",
      sections: [
        { title: "Owner Information", role: "SELLER", pageNumber: 1 },
        { title: "Manager Information", role: "AGENT", pageNumber: 1 },
        { title: "Property Details", role: "AGENT", pageNumber: 2 },
        { title: "Fee Structure", role: "AGENT", pageNumber: 3 },
        { title: "Owner Signature", role: "SELLER", pageNumber: 4 },
        { title: "Manager Signature", role: "AGENT", pageNumber: 4 },
      ]
    },
    {
      id: 4,
      name: "Lease Option Agreement",
      description: "Template for lease-to-own arrangements",
      category: "lease",
      previewUrl: "/sample-contracts/lease-option.pdf",
      sections: [
        { title: "Tenant Information", role: "BUYER", pageNumber: 1 },
        { title: "Landlord Information", role: "SELLER", pageNumber: 1 },
        { title: "Property Details", role: "AGENT", pageNumber: 2 },
        { title: "Option Terms", role: "AGENT", pageNumber: 3 },
        { title: "Tenant Signature", role: "BUYER", pageNumber: 5 },
        { title: "Landlord Signature", role: "SELLER", pageNumber: 5 },
      ]
    },
    {
      id: 5,
      name: "Joint Venture Agreement",
      description: "Template for real estate partnership ventures",
      category: "partnership",
      previewUrl: "/sample-contracts/joint-venture.pdf",
      sections: [
        { title: "Partner 1 Information", role: "BUYER", pageNumber: 1 },
        { title: "Partner 2 Information", role: "SELLER", pageNumber: 1 },
        { title: "Project Details", role: "AGENT", pageNumber: 2 },
        { title: "Profit Sharing", role: "AGENT", pageNumber: 3 },
        { title: "Partner 1 Signature", role: "BUYER", pageNumber: 6 },
        { title: "Partner 2 Signature", role: "SELLER", pageNumber: 6 },
      ]
    },
  ];

  // Load template if templateId is provided
  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id.toString() === templateId);
      if (template) {
        setSelectedTemplate(template);
        setTitle(`${template.name} - ${new Date().toLocaleDateString()}`);
        setDescription(template.description);
        setPreviewUrl(template.previewUrl);
        
        // Convert template sections to contract sections
        const contractSections = template.sections.map(section => ({
          title: section.title,
          pageNumber: section.pageNumber,
          role: section.role as ContractRole,
          required: true,
        }));
        
        setSections(contractSections);
        setSelectedTab("details");
      }
    }
  }, [templateId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size on client side (max 1MB)
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a PDF file smaller than 1MB.",
          variant: "destructive",
        });
        // Reset the file input
        e.target.value = '';
        return;
      }
      
      setUploadedFile(file);
      
      // Create a temporary URL for preview
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      // Set document name as title if not already set
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setTitle(`${template.name} - ${new Date().toLocaleDateString()}`);
    setDescription(template.description);
    setPreviewUrl(template.previewUrl);
    
    // Convert template sections to contract sections
    const contractSections = template.sections.map(section => ({
      title: section.title,
      pageNumber: section.pageNumber,
      role: section.role as ContractRole,
      required: true,
    }));
    
    setSections(contractSections);
    setSelectedTab("details");
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: "",
        pageNumber: 1,
        role: "BUYER",
        required: true,
      },
    ]);
  };

  const updateSection = (index: number, field: keyof ContractSection, value: any) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value,
    };
    setSections(updatedSections);
  };

  const removeSection = (index: number) => {
    const updatedSections = [...sections];
    updatedSections.splice(index, 1);
    setSections(updatedSections);
  };

  const handleSubmit = async () => {
    if (!title) {
      toast({
        title: "Missing Information",
        description: "Please provide a contract title.",
        variant: "destructive",
      });
      return;
    }

    if (!previewUrl) {
      toast({
        title: "Missing Document",
        description: "Please upload a document or select a template.",
        variant: "destructive",
      });
      return;
    }

    if (sections.length === 0) {
      toast({
        title: "Missing Sections",
        description: "Please add at least one signature section.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      let finalDocumentUrl = previewUrl;

      if (uploadedFile) {
        try {
          // Upload the file to S3
          const formData = new FormData();
          formData.append('file', uploadedFile);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload file');
          }
          
          const data = await response.json();
          finalDocumentUrl = `/api/s3-proxy?key=${data.fileKey}`;
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            title: 'Error',
            description: 'Failed to upload document. Please try again.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Create contract in the database
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          documentUrl: finalDocumentUrl,
          sections,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create contract');
      }

      const contract = await response.json();

      toast({
        title: "Contract Created",
        description: "Your contract has been created successfully.",
      });

      // Redirect to the contract page
      router.push(`/contracts/${contract.id}`);
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/contracts")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Button>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Create New Contract</h2>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="template">1. Choose Template</TabsTrigger>
          <TabsTrigger value="details">2. Contract Details</TabsTrigger>
          <TabsTrigger value="sections">3. Signature Sections</TabsTrigger>
          <TabsTrigger value="review">4. Review & Create</TabsTrigger>
        </TabsList>

        {/* Step 1: Choose Template */}
        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select a Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer overflow-hidden transition-all ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-0">
                      <div className="bg-gray-50 p-4 border-b">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <FileText className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-sm mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sections:</span>
                            <span className="font-medium">{template.sections.length}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <p className="text-muted-foreground mb-4">Or upload your own document</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="document-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF (max 1MB)</p>
                      </div>
                      <Input
                        id="document-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </Label>
                  </div>
                  {uploadedFile && (
                    <div className="flex-1">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gray-100">
                              <FileText className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{uploadedFile.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {Math.round(uploadedFile.size / 1024)} KB
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setSelectedTab("details")}
                  disabled={!selectedTemplate && !uploadedFile}
                >
                  Next: Contract Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Contract Details */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Contract Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter contract title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter contract description"
                    rows={3}
                  />
                </div>
                
                {previewUrl && (
                  <div className="space-y-2">
                    <Label>Document Preview</Label>
                    <div className="border rounded-md h-[300px] overflow-hidden">
                      <PDFViewer url={previewUrl} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setSelectedTab("template")}>
                  Back
                </Button>
                <Button onClick={() => setSelectedTab("sections")}>
                  Next: Signature Sections
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Signature Sections */}
        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Signature Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Section {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`section-title-${index}`}>Title</Label>
                        <Input
                          id={`section-title-${index}`}
                          value={section.title}
                          onChange={(e) => updateSection(index, "title", e.target.value)}
                          placeholder="e.g., Buyer Signature"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`section-page-${index}`}>Page Number</Label>
                        <Input
                          id={`section-page-${index}`}
                          type="number"
                          min="1"
                          value={section.pageNumber}
                          onChange={(e) => updateSection(index, "pageNumber", parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`section-role-${index}`}>Signer Role</Label>
                        <Select
                          value={section.role}
                          onValueChange={(value) => updateSection(index, "role", value)}
                        >
                          <SelectTrigger id={`section-role-${index}`}>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BUYER">Buyer</SelectItem>
                            <SelectItem value="SELLER">Seller</SelectItem>
                            <SelectItem value="AGENT">Agent</SelectItem>
                            <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`section-required-${index}`}>Required</Label>
                        <Select
                          value={section.required ? "yes" : "no"}
                          onValueChange={(value) => updateSection(index, "required", value === "yes")}
                        >
                          <SelectTrigger id={`section-required-${index}`}>
                            <SelectValue placeholder="Is this required?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addSection} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Signature Section
                </Button>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setSelectedTab("details")}>
                  Back
                </Button>
                <Button onClick={() => setSelectedTab("review")}>
                  Next: Review & Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Review & Create */}
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Contract</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Contract Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Title:</span>
                        <p className="font-medium">{title}</p>
                      </div>
                      {description && (
                        <div>
                          <span className="text-sm text-muted-foreground">Description:</span>
                          <p>{description}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-muted-foreground">Template:</span>
                        <p>{selectedTemplate ? selectedTemplate.name : "Custom Document"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Signature Sections</h3>
                    <div className="space-y-2">
                      {sections.map((section, index) => (
                        <div key={index} className="border rounded-md p-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{section.title}</span>
                            <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                              Page {section.pageNumber}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {section.role} • {section.required ? "Required" : "Optional"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {previewUrl && (
                  <div>
                    <h3 className="font-medium mb-2">Document Preview</h3>
                    <div className="border rounded-md h-[400px] overflow-hidden">
                      <PDFViewer url={previewUrl} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setSelectedTab("sections")}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Contract"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 