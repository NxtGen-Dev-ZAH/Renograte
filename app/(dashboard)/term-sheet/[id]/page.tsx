"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowLeft, Pen } from "lucide-react";
import { getTermSheetById, updateTermSheet, generateDocument } from "@/lib/contracts/service";
import { useToast } from "@/components/ui/use-toast";
import SignatureDialog from "@/components/SignatureDialog";
import jsPDF from "jspdf";
import { use } from "react";

export default function TermSheetViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [termSheet, setTermSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState<"partyOne" | "partyTwo">("partyOne");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const sheet = getTermSheetById(id);
      if (sheet) {
        setTermSheet(sheet);
        try {
          const content = generateDocument(sheet);
          setDocumentContent(content);
        } catch (error) {
          console.error("Error generating document:", error);
          toast({
            title: "Error",
            description: "Failed to generate document. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Not Found",
          description: "The requested term sheet could not be found.",
          variant: "destructive",
        });
        router.push("/term-sheet");
      }
      setLoading(false);
    }
  }, [id, router, toast]);

  const handleSignatureOpen = (type: "partyOne" | "partyTwo") => {
    setCurrentSignatureType(type);
    setSignatureDialogOpen(true);
  };

  const handleSignatureSave = (signatureData: string) => {
    if (!termSheet) return;

    const signatureField = currentSignatureType === "partyOne" ? "signatureOne" : "signatureTwo";
    
    const updatedSheet = updateTermSheet(termSheet.id, {
      [signatureField]: signatureData,
    });

    if (updatedSheet) {
      setTermSheet(updatedSheet);
      toast({
        title: "Signature Saved",
        description: "Your signature has been added to the document.",
      });
    }
  };

  const generatePDF = () => {
    if (!termSheet) return;

    try {
      // Create PDF document
      const doc = new jsPDF();
      const lineHeight = 10;
      let y = 20;
      
      // Add title
      doc.setFontSize(16);
      doc.text(termSheet.name, 105, y, { align: "center" });
      y += lineHeight * 2;
      
      // Add document content
      doc.setFontSize(10);
      const contentLines = documentContent.split("\n");
      for (const line of contentLines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          const splitText = doc.splitTextToSize(trimmedLine, 180);
          doc.text(splitText, 15, y);
          y += lineHeight * (splitText.length || 1);
        } else {
          y += lineHeight / 2;
        }
      }
      
      // Add signatures if available
      y += lineHeight * 2;
      
      if (termSheet.signatureOne) {
        doc.addImage(termSheet.signatureOne, "PNG", 15, y, 50, 25);
        doc.text(`${termSheet.partyOne} (Signature)`, 15, y + 30);
      }
      
      if (termSheet.signatureTwo) {
        doc.addImage(termSheet.signatureTwo, "PNG", 105, y, 50, 25);
        doc.text(`${termSheet.partyTwo} (Signature)`, 105, y + 30);
      }
      
      // Save the PDF
      doc.save(`${termSheet.name.replace(/\s+/g, "_")}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Your document has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (!termSheet) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Term sheet not found</p>
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
        <div>
          <Button onClick={generatePDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{termSheet.name}</CardTitle>
          <CardDescription>
            Created on {new Date(termSheet.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
              {documentContent}
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{termSheet.partyOne} Signature</h3>
                {termSheet.signatureOne ? (
                  <div className="border border-gray-200 rounded-md p-4">
                    <img
                      src={termSheet.signatureOne}
                      alt="Signature"
                      className="max-h-24"
                    />
                  </div>
                ) : (
                  <Button onClick={() => handleSignatureOpen("partyOne")}>
                    <Pen className="mr-2 h-4 w-4" />
                    Sign as {termSheet.partyOne}
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{termSheet.partyTwo} Signature</h3>
                {termSheet.signatureTwo ? (
                  <div className="border border-gray-200 rounded-md p-4">
                    <img
                      src={termSheet.signatureTwo}
                      alt="Signature"
                      className="max-h-24"
                    />
                  </div>
                ) : (
                  <Button onClick={() => handleSignatureOpen("partyTwo")}>
                    <Pen className="mr-2 h-4 w-4" />
                    Sign as {termSheet.partyTwo}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SignatureDialog
        isOpen={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onSave={handleSignatureSave}
        title={`Sign as ${currentSignatureType === "partyOne" ? termSheet.partyOne : termSheet.partyTwo}`}
        description="Please sign below to complete the document"
      />
    </div>
  );
} 