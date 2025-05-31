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
import { DollarSign, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";

interface OfferFormData {
  propertyAddress: string;
  propertyType: string;
  listingPrice: string;
  offerAmount: string;
  earnestMoney: string;
  closingDate: string;
  financing: string;
  downPayment: string;
  loanAmount: string;
  inspectionPeriod: string;
  contingencies: string;
}

export default function CreateOfferPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<OfferFormData>({
    propertyAddress: "",
    propertyType: "",
    listingPrice: "",
    offerAmount: "",
    earnestMoney: "",
    closingDate: "",
    financing: "",
    downPayment: "",
    loanAmount: "",
    inspectionPeriod: "",
    contingencies: "",
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    handleInputChange(e);
  };

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit offer");
      }

      toast({
        title: "Success!",
        description: "Your offer has been submitted to the admin.",
        variant: "default",
      });

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = () => {
    setIsGeneratingPdf(true);
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const lineHeight = 10;
      let y = 20;
      
      // Add title
      doc.setFontSize(20);
      doc.text("Property Offer", 105, y, { align: "center" });
      y += lineHeight * 2;
      
      // Add current date
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
      y += lineHeight * 2;
      
      // Property Information Section
      doc.setFontSize(16);
      doc.text("Property Information", 20, y);
      y += lineHeight;
      
      doc.setFontSize(12);
      doc.text(`Property Address: ${formData.propertyAddress || "N/A"}`, 20, y);
      y += lineHeight;
      
      doc.text(`Property Type: ${formData.propertyType || "N/A"}`, 20, y);
      y += lineHeight;
      
      doc.text(`Listing Price: $${formData.listingPrice || "0"}`, 20, y);
      y += lineHeight * 2;
      
      // Offer Details Section
      doc.setFontSize(16);
      doc.text("Offer Details", 20, y);
      y += lineHeight;
      
      doc.setFontSize(12);
      doc.text(`Offer Amount: $${formData.offerAmount || "0"}`, 20, y);
      y += lineHeight;
      
      doc.text(`Earnest Money: $${formData.earnestMoney || "0"}`, 20, y);
      y += lineHeight;
      
      doc.text(`Closing Date: ${formData.closingDate ? new Date(formData.closingDate).toLocaleDateString() : "N/A"}`, 20, y);
      y += lineHeight * 2;
      
      // Financing Information Section
      doc.setFontSize(16);
      doc.text("Financing Information", 20, y);
      y += lineHeight;
      
      doc.setFontSize(12);
      doc.text(`Financing Type: ${formData.financing || "N/A"}`, 20, y);
      y += lineHeight;
      
      doc.text(`Down Payment: $${formData.downPayment || "0"}`, 20, y);
      y += lineHeight;
      
      doc.text(`Loan Amount: $${formData.loanAmount || "0"}`, 20, y);
      y += lineHeight * 2;
      
      // Contingencies Section
      doc.setFontSize(16);
      doc.text("Contingencies and Terms", 20, y);
      y += lineHeight;
      
      doc.setFontSize(12);
      doc.text(`Inspection Period: ${formData.inspectionPeriod || "0"} days`, 20, y);
      y += lineHeight;
      
      // Handle multi-line contingencies text
      if (formData.contingencies) {
        doc.text("Additional Contingencies:", 20, y);
        y += lineHeight;
        
        const splitText = doc.splitTextToSize(formData.contingencies, 170);
        doc.text(splitText, 20, y);
      } else {
        doc.text("Additional Contingencies: None", 20, y);
      }
      
      // Save and download the PDF
      doc.save("property_offer.pdf");
      
      toast({
        title: "PDF Generated",
        description: "Your offer has been saved as a PDF.",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Offer</h2>
        <p className="text-muted-foreground">
          Submit a new offer for a property
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>
              Enter the property details for the offer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input
                id="propertyAddress"
                placeholder="Enter property address"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => handleSelectChange("propertyType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Family</SelectItem>
                  <SelectItem value="multi">Multi Family</SelectItem>
                  <SelectItem value="condo">Condo/Apartment</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="listingPrice">Listing Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="listingPrice"
                  type="number"
                  min="0"
                  className="pl-9"
                  placeholder="Enter listing price"
                  value={formData.listingPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
            <CardDescription>Specify your offer terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offerAmount">Offer Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="offerAmount"
                  type="number"
                  min="0"
                  className="pl-9"
                  placeholder="Enter offer amount"
                  value={formData.offerAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="earnestMoney">Earnest Money</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="earnestMoney"
                  type="number"
                  min="0"
                  className="pl-9"
                  placeholder="Enter earnest money amount"
                  value={formData.earnestMoney}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingDate">Closing Date</Label>
              <Input
                type="date"
                id="closingDate"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full"
                required
              />
              {selectedDate && (
                <p className="text-sm text-muted-foreground">
                  Selected Date: {new Date(selectedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financing Information</CardTitle>
            <CardDescription>
              Specify how the purchase will be financed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="financing">Financing Type</Label>
              <Select
                value={formData.financing}
                onValueChange={(value) => handleSelectChange("financing", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select financing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="conventional">
                    Conventional Loan
                  </SelectItem>
                  <SelectItem value="fha">FHA Loan</SelectItem>
                  <SelectItem value="va">VA Loan</SelectItem>
                  <SelectItem value="owner">Owner Financing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="downPayment"
                  type="number"
                  min="0"
                  className="pl-9"
                  placeholder="Enter down payment amount"
                  value={formData.downPayment}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="loanAmount"
                  type="number"
                  min="0"
                  className="pl-9"
                  placeholder="Enter loan amount"
                  value={formData.loanAmount}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contingencies and Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Contingencies and Terms</CardTitle>
            <CardDescription>
              Specify any conditions for the offer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inspectionPeriod">Inspection Period (Days)</Label>
              <Input
                id="inspectionPeriod"
                type="number"
                min="0"
                placeholder="Enter number of days"
                value={formData.inspectionPeriod}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contingencies">Additional Contingencies</Label>
              <Textarea
                id="contingencies"
                placeholder="List any additional contingencies or terms"
                rows={4}
                value={formData.contingencies}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
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
            "Save as Draft"
          )}
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Offer"
          )}
        </Button>
      </div>
    </form>
  );
}
