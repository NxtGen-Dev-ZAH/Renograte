"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Search,
  Plus,
  Download,
  Eye,
  Clock,
  Filter,
  Check,
  AlertTriangle,
  FileEdit,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PDFViewer } from "@/components/PDFViewer";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contracts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }
      
      const contractsData = await response.json();
      setContracts(contractsData);
    } catch (error) {
      console.error("Error loading contracts:", error);
      toast({
        title: "Error",
        description: "Failed to load contracts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Templates data (enhanced with more details and preview URLs)
  const templates = [
    {
      id: 1,
      name: "Standard Purchase Agreement",
      description: "Basic template for property purchases",
      category: "purchase",
      downloads: 128,
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
      downloads: 95,
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
      downloads: 76,
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
      downloads: 64,
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
      downloads: 52,
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

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = !searchQuery || 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || contract.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "FULLY_EXECUTED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatusText = (status: string) => {
    return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const getSignatureProgress = (contract: any) => {
    const totalSections = contract.sections.length;
    const signedSections = contract.sections.filter((section: any) => section.status === "SIGNED").length;
    
    if (totalSections === 0) return "0%";
    return `${Math.round((signedSections / totalSections) * 100)}%`;
  };

  const handleViewContract = (id: string) => {
    router.push(`/contracts/${id}`);
  };

  const handleCreateFromTemplate = (template: any) => {
    setSelectedTemplate(template);
    router.push(`/contracts/create?templateId=${template.id}`);
  };

  const handlePreviewTemplate = (template: any) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Contracts</h2>
        <p className="text-muted-foreground">
          Manage your contracts and legal documents
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Contracts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contracts..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="FULLY_EXECUTED">Fully Executed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => router.push('/contracts/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Contract
            </Button>
          </div>

          {/* Contracts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10">
                <p>Loading contracts...</p>
              </div>
            ) : filteredContracts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <FileText className="h-10 w-10 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No contracts found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery || selectedStatus !== "all"
                      ? "Try adjusting your search or filter"
                      : "Create your first contract to get started"}
                  </p>
                  <Button onClick={() => router.push('/contracts/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Contract
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredContracts.map((contract) => (
                <Card key={contract.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <FileText className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{contract.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{getSignatureProgress(contract)} completed</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(contract.status)}`}>
                          {formatStatusText(contract.status)}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewContract(contract.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Contract Templates</h3>
              <p className="text-sm text-muted-foreground">
                Start from a pre-made template
              </p>
            </div>
            <Button onClick={() => router.push('/contracts/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Contract
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
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
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium capitalize">{template.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sections:</span>
                        <span className="font-medium">{template.sections.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {template.downloads} downloads
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleCreateFromTemplate(template)}
                        >
                          <FileEdit className="mr-2 h-4 w-4" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archive" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Archived Contracts</h3>
              <p className="text-sm text-muted-foreground">
                Access your completed and expired contracts
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Placeholder for archived contracts */}
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <FileText className="mx-auto h-8 w-8 mb-2" />
              <p>No archived contracts yet</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {previewTemplate && (
              <>
                <div className="h-[500px] overflow-auto border rounded-md">
                  <PDFViewer url={previewTemplate.previewUrl} />
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Template Sections</h4>
                  <div className="grid gap-2">
                    {previewTemplate.sections.map((section: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{section.title}</p>
                          <p className="text-sm text-muted-foreground">Page {section.pageNumber}</p>
                        </div>
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {section.role}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => {
                      setShowPreview(false);
                      handleCreateFromTemplate(previewTemplate);
                    }}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      Use This Template
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 