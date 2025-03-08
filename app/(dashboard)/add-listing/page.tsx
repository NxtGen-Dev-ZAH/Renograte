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
import { DollarSign, Image as ImageIcon, CheckCircle } from "lucide-react";

const steps = [
  { id: 1, name: "Property Details" },
  { id: 2, name: "Pricing & Terms" },
  { id: 3, name: "Photos & Media" },
  { id: 4, name: "Review & Submit" },
];

export default function AddListingPage() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Listing</h2>
        <p className="text-muted-foreground">
          Add a new property listing with renovation potential
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex-1 relative ${
              step.id !== steps.length && "after:content-[''] after:absolute after:w-full after:h-[2px] after:top-1/2 after:ml-4"
            } ${
              step.id <= currentStep
                ? "after:bg-[#0C71C3]"
                : "after:bg-gray-200"
            }`}
          >
            <div className="flex items-center gap-4 mb-5 ">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.id <= currentStep
                    ? "bg-[#0C71C3] text-white "
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-sm ${
                  step.id <= currentStep
                    ? "text-[#0C71C3] font-medium"
                    : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter the basic property information"}
            {currentStep === 2 && "Set pricing and terms for the property"}
            {currentStep === 3 && "Upload photos and media content"}
            {currentStep === 4 && "Review your listing before submission"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address">Property Address</Label>
                  <Input id="address" placeholder="Enter full address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Property Type</Label>
                  <Select>
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
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" type="number" min="0" step="0.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sqft">Square Footage</Label>
                  <Input id="sqft" type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lot">Lot Size</Label>
                  <Input id="lot" placeholder="e.g., 0.25 acres" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Property Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the property and its renovation potential"
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="listPrice">Listing Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="listPrice" type="number" min="0" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afterRepairValue">After Repair Value (ARV)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="afterRepairValue" type="number" min="0" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renovationCost">Estimated Renovation Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="renovationCost" type="number" min="0" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms Available</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash Only</SelectItem>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="fha">FHA</SelectItem>
                      <SelectItem value="va">VA</SelectItem>
                      <SelectItem value="owner">Owner Financing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalTerms">Additional Terms</Label>
                <Textarea
                  id="additionalTerms"
                  placeholder="Enter any additional terms or conditions"
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button>Upload Photos</Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Upload high-quality photos of the property. Include exterior, interior, and any areas needing renovation.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video Tour URL</Label>
                <Input id="videoUrl" placeholder="Enter YouTube or Vimeo URL" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="virtualTour">Virtual Tour Link</Label>
                <Input id="virtualTour" placeholder="Enter virtual tour URL" />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="font-medium mb-2">Review your listing details</h3>
                <p className="text-sm text-gray-500">
                  Please review all information before submitting. Once submitted, your listing will be reviewed by our team.
                </p>
              </div>
              {/* Add summary of all entered information here */}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentStep < steps.length) {
                  setCurrentStep(currentStep + 1);
                } else {
                  // Handle form submission
                  console.log("Submit form");
                }
              }}
            >
              {currentStep === steps.length ? "Submit Listing" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 