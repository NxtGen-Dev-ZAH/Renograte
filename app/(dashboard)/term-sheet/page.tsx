"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { FileText, Download, Eye } from "lucide-react";

const termSheetTemplates = [
  { id: "purchase", name: "Purchase Agreement" },
  { id: "renovation", name: "Renovation Contract" },
  { id: "joint-venture", name: "Joint Venture Agreement" },
  { id: "lease-option", name: "Lease Option Agreement" },
];

export default function TermSheetPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Term Sheet</h2>
        <p className="text-muted-foreground">
          Create and manage property term sheets and agreements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Template Selection and Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Term Sheet</CardTitle>
            <CardDescription>Select a template and fill in the details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template Type</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {termSheetTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">Property Address</Label>
                  <Input id="propertyAddress" placeholder="Enter property address" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="partyOne">Party One (Seller)</Label>
                    <Input id="partyOne" placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partyTwo">Party Two (Buyer)</Label>
                    <Input id="partyTwo" placeholder="Enter name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms">Key Terms</Label>
                  <Textarea
                    id="terms"
                    placeholder="Enter the main terms and conditions"
                    rows={4}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
            <CardDescription>Preview and download your term sheet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate ? (
              <>
                <div className="rounded-lg border p-4 min-h-[400px] bg-gray-50">
                  <div className="text-center text-gray-500">
                    <FileText className="mx-auto h-12 w-12 mb-2" />
                    <p>Preview will be generated based on your inputs</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FileText className="mx-auto h-12 w-12 mb-2" />
                <p>Select a template to preview</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Term Sheets */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Term Sheets</CardTitle>
            <CardDescription>Your recently created documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">123 Main Street - Purchase Agreement</p>
                      <p className="text-sm text-gray-500">Created on May 1, 2024</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 