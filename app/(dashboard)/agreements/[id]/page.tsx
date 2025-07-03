"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowLeft, Pen } from "lucide-react";
import { getTermSheetById, updateTermSheet, generateDocument } from "@/lib/contracts/service";
import { useToast } from "@/hooks/use-toast";
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
          description: "The requested agreement could not be found.",
          variant: "destructive",
        });
        router.push("/agreements");
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

  const downloadPDF = () => {
    if (!termSheet) return;

    try {
      // Create PDF document with professional formatting
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set up dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const lineHeight = 7;
      let y = margin;
      
      // Add header with logo
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.line(0, 25, pageWidth, 25);
      
      // Add Renograte logo instead of text
      const logoImg = new Image();
      logoImg.src = '/logo.png';
      doc.addImage(logoImg, 'PNG', margin, 5, 40, 15);
      
      y = 40;
      
      // Add document title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(termSheet.name, pageWidth / 2, y, { align: 'center' });
      y += lineHeight * 2;
      
      // Add creation date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(`Created on ${new Date(termSheet.createdAt).toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
      y += lineHeight * 2;
      
      // Add document content with proper formatting
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const contentLines = documentContent.split("\n");
      for (const line of contentLines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          // Check if it's a heading (all caps)
          if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 10) {
            doc.setFont('helvetica', 'bold');
            y += lineHeight / 2;
          } else {
            doc.setFont('helvetica', 'normal');
          }
          
          // Handle page breaks if needed
          if (y > pageHeight - 40) {
            doc.addPage();
            // Add header to new page
            doc.setFillColor(240, 240, 240);
            doc.rect(0, 0, pageWidth, 15, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.line(0, 15, pageWidth, 15);
            
            // Add logo to new page header
            doc.addImage(logoImg, 'PNG', margin, 2, 30, 11);
            
            // Reset text color to black for all content on new pages
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            // Reset y position for new page
            y = 30;
          }
          
          // Ensure text color is black for all content
          doc.setTextColor(0, 0, 0);
          
          const splitText = doc.splitTextToSize(trimmedLine, contentWidth);
          doc.text(splitText, margin, y);
          y += lineHeight * (splitText.length || 1);
        } else {
          y += lineHeight / 2;
        }
      }
      
      // Add signature section
      y += lineHeight * 2;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += lineHeight;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text("Signatures", pageWidth / 2, y, { align: 'center' });
      y += lineHeight * 2;
      
      // First signature
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${termSheet.partyOne} Signature:`, margin, y);
      y += lineHeight;
      
      if (termSheet.signatureOne) {
        doc.addImage(termSheet.signatureOne, "PNG", margin, y, 50, 25);
        y += 25 + lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Signed on: ${new Date().toLocaleDateString()}`, margin, y);
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text("Not signed", margin, y);
      }
      
      // Second signature (on the right side)
      const rightColumnX = pageWidth / 2 + 10;
      y -= termSheet.signatureOne ? (25 + lineHeight) : 0; // Reset y to the top of the signature area
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${termSheet.partyTwo} Signature:`, rightColumnX, y);
      y += lineHeight;
      
      if (termSheet.signatureTwo) {
        doc.addImage(termSheet.signatureTwo, "PNG", rightColumnX, y, 50, 25);
        y += 25 + lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Signed on: ${new Date().toLocaleDateString()}`, rightColumnX, y);
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text("Not signed", rightColumnX, y);
      }
      
      // Add footer with page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('Renograte Agreement Document', margin, pageHeight - 10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
      
      // Save the PDF with a meaningful filename
      doc.save(`${termSheet.name.replace(/\s+/g, "_")}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your agreement document with signatures has been downloaded.",
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
        <p>Agreement not found</p>
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
        <div>
          <Button onClick={downloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download Agreement PDF
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
            {/* Template Data Summary */}
            <div className="grid gap-4 md:grid-cols-2 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium mb-2">Agreement Details</h3>
                <dl className="space-y-1">
                  <div className="flex">
                    <dt className="w-32 font-medium text-gray-500">Template:</dt>
                    <dd>{termSheet.templateId}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 font-medium text-gray-500">Property:</dt>
                    <dd>{termSheet.propertyAddress}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 font-medium text-gray-500">Date:</dt>
                    <dd>{termSheet.date}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="font-medium mb-2">Parties</h3>
                <dl className="space-y-1">
                  <div className="flex">
                    <dt className="w-32 font-medium text-gray-500">Party One:</dt>
                    <dd>{termSheet.partyOne}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 font-medium text-gray-500">Party Two:</dt>
                    <dd>{termSheet.partyTwo}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Document Content */}
            <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm max-h-[400px] overflow-y-auto">
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