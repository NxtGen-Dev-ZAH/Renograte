"use client";

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
import { DollarSign, Calendar, FileText } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

export default function CreateOfferPage() {
  return (
    <div className="space-y-6">
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
            <CardDescription>Enter the property details for the offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input id="propertyAddress" placeholder="Enter property address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
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
              <Label htmlFor="listingPrice">Listing Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="listingPrice" 
                  type="number" 
                  min="0" 
                  className="pl-9"
                  placeholder="Enter listing price"
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
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Closing Date</Label>
              <DatePicker />
            </div>
          </CardContent>
        </Card>

        {/* Financing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financing Information</CardTitle>
            <CardDescription>Specify how the purchase will be financed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="financing">Financing Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select financing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="conventional">Conventional Loan</SelectItem>
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
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contingencies and Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Contingencies and Terms</CardTitle>
            <CardDescription>Specify any conditions for the offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inspectionPeriod">Inspection Period (Days)</Label>
              <Input 
                id="inspectionPeriod" 
                type="number" 
                min="0"
                placeholder="Enter number of days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contingencies">Additional Contingencies</Label>
              <Textarea
                id="contingencies"
                placeholder="List any additional contingencies or terms"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Save as Draft</Button>
        <Button>Submit Offer</Button>
      </div>
    </div>
  );
} 