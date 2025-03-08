"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CalculatorValues {
  currentHomeValue: string;
  afterRenovatedValue: string;
  agentCommission: string;
  closingFee: string;
  sellerFee: string;
  secondMortgage: string;
  totalLiens: string;
  otherPayoffs: string;
  sellerIncentives: string;
  sellerPayback: string;
  administrationFee: string;
}

interface CalculationSummary {
  arvMinusChv: number;
  totalRenovationAllowance: number;
  timestamp: string;
}

export default function CalculatorPage() {
  const [values, setValues] = useState<CalculatorValues>({
    currentHomeValue: "0.00",
    afterRenovatedValue: "0.00",
    agentCommission: "0.00",
    closingFee: "0.00",
    sellerFee: "1.00",
    secondMortgage: "0",
    totalLiens: "0.00",
    otherPayoffs: "0.00",
    sellerIncentives: "0.00",
    sellerPayback: "0.00",
    administrationFee: "499",
  });

  const [summary, setSummary] = useState<CalculationSummary>({
    arvMinusChv: 0,
    totalRenovationAllowance: -499,
    timestamp: new Date().toISOString(),
  });

  const [calculationHistory, setCalculationHistory] = useState<CalculationSummary[]>([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  const handleInputChange = (field: keyof CalculatorValues, value: string) => {
    let processedValue = value;
    
    // Remove any non-digit characters except decimal point
    processedValue = processedValue.replace(/[^\d.]/g, "");

    // Handle percentage fields
    if (["agentCommission", "closingFee", "sellerFee"].includes(field)) {
      // Ensure only one decimal point
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limit to two decimal places
      if (parts[1]?.length > 2) {
        processedValue = parseFloat(processedValue).toFixed(2);
      }

      // Ensure value doesn't exceed 100
      const numValue = parseFloat(processedValue);
      if (numValue > 100) {
        processedValue = "100.00";
      }
    } else {
      // Handle dollar amount fields
      // Ensure only one decimal point
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limit to two decimal places
      if (parts[1]?.length > 2) {
        processedValue = parseFloat(processedValue).toFixed(2);
      }
    }

    setValues((prev) => ({
      ...prev,
      [field]: processedValue || "0.00",
    }));
  };

  useEffect(() => {
    const arvMinusChv =
      parseFloat(values.afterRenovatedValue) -
      parseFloat(values.currentHomeValue);
    const totalRenovationAllowance =
      arvMinusChv - parseFloat(values.administrationFee);

    const newSummary = {
      arvMinusChv,
      totalRenovationAllowance,
      timestamp: new Date().toISOString(),
    };

    setSummary(newSummary);
  }, [values]);

  const saveCalculation = () => {
    setCalculationHistory(prev => [summary, ...prev]);
  };

  const loadCalculation = (savedSummary: CalculationSummary) => {
    // Reconstruct the values that would lead to this summary
    const reconstructedValues = {
      ...values,
      currentHomeValue: values.currentHomeValue,
      afterRenovatedValue: (parseFloat(values.currentHomeValue) + savedSummary.arvMinusChv).toString(),
    };
    setValues(reconstructedValues);
  };

  const renderInput = (
    field: keyof CalculatorValues,
    label: string,
    min: string,
    max: string,
    hint: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <div className="relative">
        <Input
          id={field}
          type="text"
          value={values[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="pl-6"
        />
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
          {["agentCommission", "closingFee", "sellerFee"].includes(field)
            ? "%"
            : "$"}
        </span>
      </div>
      <p className="text-sm text-gray-500">
        {`Min: ${min} - Max: ${max}`}
        <br />
        {hint}
      </p>
    </div>
  );

  const renderSummaryRow = (
    label: string,
    value: string | number,
    isPercentage: boolean = false
  ) => (
    <div className="flex justify-between py-1 border-b border-gray-100">
      <span className="text-sm">{label}</span>
      <span className="text-sm font-medium">
        {isPercentage ? `% ${value}` : `$ ${value}`}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Renograte Calculator</h2>
        <p className="text-muted-foreground">
          Calculate renovation allowance and investment returns
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calculator Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Calculator Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* First Row */}
              <div>
                {renderInput(
                  "currentHomeValue",
                  "Current Home Value (CHV)",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent"
                )}
              </div>
              <div>
                {renderInput(
                  "afterRenovatedValue",
                  "After Renovated Value (ARV)*",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent"
                )}
              </div>

              {/* Second Row */}
              <div>
                {renderInput(
                  "agentCommission",
                  "Agent Commission %",
                  "% 0.00",
                  "% 10.00",
                  "Typically (6%) of the transaction"
                )}
              </div>
              <div>
                {renderInput(
                  "closingFee",
                  "Closing fee %",
                  "% 0.00",
                  "% 10.00",
                  "Typically (2.5% - 4.5%) of the deal"
                )}
              </div>

              {/* Third Row */}
              <div>
                {renderInput(
                  "sellerFee",
                  "Seller Fee % (Additional Profit)",
                  "% 0.00",
                  "% 10.00",
                  "Seller additional profit %"
                )}
              </div>
              <div>
                {renderInput(
                  "secondMortgage",
                  "2nd Mortgage",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Enter second mortgage amount"
                )}
              </div>

              {/* Fourth Row */}
              <div>
                {renderInput(
                  "totalLiens",
                  "Total Liens, Judgements, Payoffs, Etc.",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  ""
                )}
              </div>
              <div>
                {renderInput(
                  "otherPayoffs",
                  "Other payoffs (Miscellaneous)",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Seller miscellaneous expenses"
                )}
              </div>

              {/* Fifth Row */}
              <div>
                {renderInput(
                  "sellerIncentives",
                  "Seller Incentives",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Seller Mortgage payments"
                )}
              </div>
              <div>
                {renderInput(
                  "sellerPayback",
                  "Seller Payback Programs",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "First time home buyer payback terms"
                )}
              </div>
            </div>

            {/* Last Row - Single Column */}
            <div className="col-span-2">
              {renderInput(
                "administrationFee",
                "Renograte Administration Fee $499",
                "$ 499.00",
                "$ 499.00",
                "Renograte data and administration fee per transaction"
              )}
            </div>

            <Button 
              className="w-full bg-[#0C71C3] hover:bg-[#0C71C3]/90" 
              onClick={saveCalculation}
            >
              Save Calculation
            </Button>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          >
            <div className="flex items-center justify-between">
              <CardTitle>Summary</CardTitle>
              {isSummaryOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
          </CardHeader>
          {isSummaryOpen && (
            <CardContent>
              <div className="space-y-2">
                {renderSummaryRow(
                  "Current Home Value (CHV)",
                  values.currentHomeValue
                )}
                {renderSummaryRow(
                  "After Renovated Value (ARV)*",
                  values.afterRenovatedValue
                )}
                {renderSummaryRow(
                  "Agent Commission %",
                  values.agentCommission,
                  true
                )}
                {renderSummaryRow("Closing fee %", values.closingFee, true)}
                {renderSummaryRow(
                  "Seller Fee % (Additional Profit)",
                  values.sellerFee,
                  true
                )}
                {renderSummaryRow("2nd Mortgage", values.secondMortgage)}
                {renderSummaryRow(
                  "Total Liens, Judgements, Payoffs, Etc.",
                  values.totalLiens
                )}
                {renderSummaryRow(
                  "Other payoffs (Miscellaneous)",
                  values.otherPayoffs
                )}
                {renderSummaryRow(
                  "Seller Incentives",
                  values.sellerIncentives
                )}
                {renderSummaryRow(
                  "Seller Payback Programs",
                  values.sellerPayback
                )}
                {renderSummaryRow(
                  "Renograte Administration Fee",
                  values.administrationFee
                )}
                <div className="mt-4 pt-2 border-t border-gray-200">
                  {renderSummaryRow(
                    "(ARV - CHV)",
                    summary.arvMinusChv.toFixed(2)
                  )}
                  <div className="flex justify-between py-1 font-bold">
                    <span>Total Renovation Allowance</span>
                    <span>
                      $ {summary.totalRenovationAllowance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Calculation History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calculation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {calculationHistory.map((calc, index) => (
                <div
                  key={calc.timestamp}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">Calculation {calculationHistory.length - index}</p>
                    <p className="text-sm text-gray-500">
                      ARV - CHV: ${calc.arvMinusChv.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total Renovation Allowance: ${calc.totalRenovationAllowance.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(calc.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadCalculation(calc)}
                  >
                    Load
                  </Button>
                </div>
              ))}
              {calculationHistory.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No calculation history yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 