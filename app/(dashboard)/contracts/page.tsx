"use client";

import { useState } from "react";
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
} from "lucide-react";

const contracts = [
  {
    id: 1,
    name: "Purchase Agreement - 123 Main St",
    type: "purchase",
    status: "pending",
    date: "May 1, 2024",
    parties: ["John Doe", "Jane Smith"],
  },
  {
    id: 2,
    name: "Renovation Contract - 456 Oak Ave",
    type: "renovation",
    status: "signed",
    date: "April 28, 2024",
    parties: ["ABC Construction", "Property Owner"],
  },
  // Add more contracts as needed
];

const templates = [
  {
    id: 1,
    name: "Standard Purchase Agreement",
    description: "Basic template for property purchases",
    category: "purchase",
    downloads: 128,
  },
  {
    id: 2,
    name: "Renovation Contract",
    description: "Template for renovation projects",
    category: "renovation",
    downloads: 95,
  },
  {
    id: 3,
    name: "Property Management Agreement",
    description: "Template for property management services",
    category: "management",
    downloads: 76,
  },
  // Add more templates as needed
];

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredContracts = contracts.filter(contract => {
                            const matchesSearch = !searchQuery ||   
      contract.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || contract.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Contract
            </Button>
          </div>

          {/* Contracts List */}
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <Card key={contract.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{contract.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{contract.date}</span>
                          <span>•</span>
                          <span>{contract.parties.join(" & ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${contract.status === "signed" ? "bg-green-100 text-green-800" : ""}
                        ${contract.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${contract.status === "expired" ? "bg-red-100 text-red-800" : ""}
                        ${contract.status === "draft" ? "bg-gray-100 text-gray-800" : ""}
                      `}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
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
            ))}
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Template
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {template.downloads} downloads
                        </span>
                        <Button variant="outline" size="sm">
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
    </div>
  );
} 