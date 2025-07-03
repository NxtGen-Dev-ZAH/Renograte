"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contractTemplates } from "@/lib/contracts/templates";
import { getAllTermSheets, deleteTermSheet } from "@/lib/contracts/service";
import Link from "next/link";

export default function TermSheetPage() {
  const [termSheets, setTermSheets] = useState<any[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Load saved term sheets
  useEffect(() => {
    // Function to load term sheets
    const loadTermSheets = () => {
      setTermSheets(getAllTermSheets());
    };

    // Load term sheets when component mounts
    loadTermSheets();

    // Add event listener for focus to refresh data when user comes back to this page
    window.addEventListener('focus', loadTermSheets);

    // Clean up event listener
    return () => {
      window.removeEventListener('focus', loadTermSheets);
    };
  }, []);

  const handleDeleteTermSheet = (id: string) => {
    if (deleteTermSheet(id)) {
      setTermSheets(getAllTermSheets());
      toast({
        title: "Agreement Deleted",
        description: "The agreement has been deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete agreement.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agreements</h2>
        <p className="text-muted-foreground">
          Create and manage property agreements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {contractTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>
                {template.id === "service-provider" && "Contract for service providers"}
                {template.id === "option-contract" && "Option agreement for property renovation"}
                {template.id === "joint-venture" && "Joint venture partnership"}
                {template.id === "lease-option" && "Lease with purchase option"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                {template.id === "service-provider" && (
                  "Agreement between property owner, buyer, and contractor for renovation services."
                )}
                {template.id === "option-contract" && (
                  "Option agreement to renovate real estate before sale of property."
                )}
                {template.id === "joint-venture" && (
                  "Agreement between partners for real estate investment projects."
                )}
                {template.id === "lease-option" && (
                  "Lease agreement with an option to purchase the property."
                )}
              </div>
              <Button 
                className="w-full" 
                onClick={() => router.push(`/agreements/create/${template.id}`)}
              >
                 {template.id === "service-provider" 
                  ? "Create Service Provider Contract" 
                  : `Create ${template.name}`
                } 
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Term Sheets */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Agreements</CardTitle>
          <CardDescription>Your created documents</CardDescription>
        </CardHeader>
        <CardContent>
          {termSheets.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FileText className="mx-auto h-12 w-12 mb-2" />
              <p>No agreements created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {termSheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{sheet.name}</p>
                      <p className="text-sm text-gray-500">
                        Created on {new Date(sheet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTermSheet(sheet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link href={`/agreements/${sheet.id}`} passHref>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 