"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, DollarSign, Percent } from "lucide-react";

const calculatorTypes = [
  { id: "roi", name: "ROI Calculator" },
  { id: "rehab", name: "Rehab Cost Calculator" },
  { id: "mortgage", name: "Mortgage Calculator" },
  { id: "rental", name: "Rental Income Calculator" },
];

export default function CalculatorPage() {
  const [selectedCalculator, setSelectedCalculator] = useState("roi");
  const [results, setResults] = useState<any>(null);

  const calculateROI = (values: any) => {
    // Implement ROI calculation logic
    const totalInvestment = parseFloat(values.purchasePrice) + parseFloat(values.rehabCost);
    const annualIncome = parseFloat(values.monthlyRent) * 12;
    const annualExpenses = parseFloat(values.monthlyExpenses) * 12;
    const netOperatingIncome = annualIncome - annualExpenses;
    const roi = (netOperatingIncome / totalInvestment) * 100;
    
    return {
      totalInvestment,
      annualIncome,
      annualExpenses,
      netOperatingIncome,
      roi
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Investment Calculator</h2>
        <p className="text-muted-foreground">
          Calculate returns and costs for your real estate investments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calculator Input */}
        <Card>
          <CardHeader>
            <CardTitle>Calculator</CardTitle>
            <CardDescription>Select a calculator and enter your values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calculatorType">Calculator Type</Label>
              <Select value={selectedCalculator} onValueChange={setSelectedCalculator}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a calculator" />
                </SelectTrigger>
                <SelectContent>
                  {calculatorTypes.map((calc) => (
                    <SelectItem key={calc.id} value={calc.id}>
                      {calc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCalculator === "roi" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="purchasePrice" type="number" className="pl-9" placeholder="Enter purchase price" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rehabCost">Rehabilitation Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="rehabCost" type="number" className="pl-9" placeholder="Enter rehab cost" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Monthly Rent</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="monthlyRent" type="number" className="pl-9" placeholder="Enter monthly rent" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="monthlyExpenses" type="number" className="pl-9" placeholder="Enter monthly expenses" />
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  // Implement calculation trigger
                }}>
                  Calculate ROI
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Investment analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Total Investment</p>
                    <p className="text-2xl font-bold">${results.totalInvestment.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Annual Income</p>
                    <p className="text-2xl font-bold">${results.annualIncome.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Annual Expenses</p>
                    <p className="text-2xl font-bold">${results.annualExpenses.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Net Operating Income</p>
                    <p className="text-2xl font-bold">${results.netOperatingIncome.toLocaleString()}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">Return on Investment (ROI)</p>
                  <p className="text-4xl font-bold text-[#0C71C3]">{results.roi.toFixed(2)}%</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Calculator className="mx-auto h-12 w-12 mb-2" />
                <p>Enter values and calculate to see results</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Calculations */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Saved Calculations</CardTitle>
            <CardDescription>Your recent calculations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">123 Main Street Investment</p>
                    <p className="text-sm text-gray-500">ROI: 12.5%</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 