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
  thirdMortgage: string;
  totalLiens: string;
  otherPayoffs: string;
  sellerIncentives: string;
  sellerPayback: string;
  administrationFee: string;
  otherFees: string;
}

interface CalculationSummary {
  totalAcquisitionRenovationRatio: number;
  totalAcquisitionRenovationAllowance: number;
  totalLiens: number;
  totalRenovationAllowance: number;
  termSheet: {
    afterRenovatedValue: number;
    totalRenovationAllowanceBuyer: number;
    agentCommissionAmount: number;
    closingFeeAmount: number;
    sellerFeeAmount: number;
    renograteAdminFee: number;
    sellerIncentives: number;
    otherPayoffs: number;
    otherFeesAmount: number;
  };
  renograteSummary: {
    totalAdditionalSellerProfit: number;
    renograteAdminFee: number;
    otherFees: number;
    totalRenovationAllowanceBuyer: number;
  };
  timestamp: string;
}

export default function CalculatorPage() {
  const [values, setValues] = useState<CalculatorValues>({
    currentHomeValue: "850000.00",
    afterRenovatedValue: "1000000.00",
    agentCommission: "6.00",
    closingFee: "3.00",
    sellerFee: "1.00",
    secondMortgage: "0.00",
    thirdMortgage: "0.00",
    totalLiens: "0.00",
    otherPayoffs: "1000.00",
    sellerIncentives: "2000.00",
    sellerPayback: "0.00",
    administrationFee: "1.00",
    otherFees: "0.00",
  });

  const [summary, setSummary] = useState<CalculationSummary>({
    totalAcquisitionRenovationRatio: 0,
    totalAcquisitionRenovationAllowance: 0,
    totalLiens: 0,
    totalRenovationAllowance: 0,
    termSheet: {
      afterRenovatedValue: 0,
      totalRenovationAllowanceBuyer: 0,
      agentCommissionAmount: 0,
      closingFeeAmount: 0,
      sellerFeeAmount: 0,
      renograteAdminFee: 0,
      sellerIncentives: 0,
      otherPayoffs: 0,
      otherFeesAmount: 0,
    },
    renograteSummary: {
      totalAdditionalSellerProfit: 0,
      renograteAdminFee: 0,
      otherFees: 0,
      totalRenovationAllowanceBuyer: 0,
    },
    timestamp: new Date().toISOString(),
  });

  const [calculationHistory, setCalculationHistory] = useState<CalculationSummary[]>([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  const handleInputChange = (field: keyof CalculatorValues, value: string) => {
    let processedValue = value.replace(/[^\d.]/g, "");
    
    // Handle percentage fields
    if (["agentCommission", "closingFee", "sellerFee", "administrationFee", "otherFees"].includes(field)) {
      processedValue = parseFloat(processedValue || "0").toFixed(2);
      
      // Apply constraints for percentage fields
      const numValue = parseFloat(processedValue);
      if (field === "agentCommission" && (numValue < 0 || numValue > 10)) {
        processedValue = numValue < 0 ? "0.00" : "10.00"; 
      } else if (field === "closingFee" && (numValue < 0 || numValue > 10)) {
        processedValue = numValue < 0 ? "0.00" : "10.00";
      } else if (field === "sellerFee" && (numValue < 0 || numValue > 10)) {
        processedValue = numValue < 0 ? "0.00" : "10.00";
      } else if (field === "administrationFee" && (numValue < 0 || numValue > 5)) {
        processedValue = numValue < 0 ? "0.00" : "5.00";
      } else if (field === "otherFees" && (numValue < 0 || numValue > 1)) {
        processedValue = numValue < 0 ? "0.00" : "1.00";
      }
    } else {
      // For price fields, store the raw number without formatting
      const numValue = parseFloat(processedValue) || 0;
      processedValue = numValue.toString();
    }

    setValues((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  const handlePercentageChange = (field: keyof CalculatorValues, increment: boolean) => {
    const currentValue = parseFloat(values[field]) || 0;
    const newValue = increment ? currentValue + 0.5 : currentValue - 0.5;
    
    // Apply field-specific limits
    let finalValue = newValue;
    if (field === "agentCommission") {
      finalValue = Math.min(Math.max(newValue, 0), 10);
    } else if (field === "closingFee") {
      finalValue = Math.min(Math.max(newValue, 0), 10);
    } else if (field === "sellerFee") {
      finalValue = Math.min(Math.max(newValue, 0), 10);
    } else if (field === "administrationFee") {
      finalValue = Math.min(Math.max(newValue, 0), 5);
    } else if (field === "otherFees") {
      finalValue = Math.min(Math.max(newValue, 0), 1);
    }

    handleInputChange(field, finalValue.toFixed(2));
  };

  const formatDisplayValue = (field: string, value: string) => {
    if (["agentCommission", "closingFee", "sellerFee", "administrationFee", "otherFees"].includes(field)) {
      return value;
    }
    const numValue = parseFloat(value) || 0;
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  useEffect(() => {
    const chv = parseFloat(values.currentHomeValue) || 0;
    const arv = parseFloat(values.afterRenovatedValue) || 0;
    
    // Fixed percentages
    const agentCommissionPercent = parseFloat(values.agentCommission) / 100 || 0;
    const closingFeePercent = parseFloat(values.closingFee) / 100 || 0;
    const sellerFeePercent = parseFloat(values.sellerFee) / 100 || 0;
    const adminFeePercent = parseFloat(values.administrationFee) / 100 || 0;
    const otherFeesPercent = parseFloat(values.otherFees) / 100 || 0;

    // Calculate TARR (should be between 85% to 90% of ARV)
    const totalPercentages = agentCommissionPercent + closingFeePercent + 
                           sellerFeePercent + adminFeePercent + otherFeesPercent;
    const tarrPercent = Math.min(Math.max(0.85, 1 - totalPercentages), 0.90);

    // Calculate TARA
    const totalAcquisitionRenovationAllowance = arv * tarrPercent;

    // Calculate Total Liens
    const secondMortgage = parseFloat(values.secondMortgage) || 0;
    const thirdMortgage = parseFloat(values.thirdMortgage) || 0;
    const sellerPayback = parseFloat(values.sellerPayback) || 0;
    const sellerIncentives = parseFloat(values.sellerIncentives) || 0;
    const otherPayoffs = parseFloat(values.otherPayoffs) || 0;
    const totalLiens = secondMortgage + thirdMortgage + sellerPayback + 
                      sellerIncentives + otherPayoffs;

    // Calculate Total Renovation Allowance
    const totalRenovationAllowance = totalAcquisitionRenovationAllowance - chv - totalLiens;

    // Calculate Term Sheet Values
    const agentCommissionAmount = arv * agentCommissionPercent;
    const closingFeeAmount = arv * closingFeePercent;
    const sellerFeeAmount = arv * sellerFeePercent;
    const renograteAdminFee = arv * adminFeePercent;
    const otherFeesAmount = arv * otherFeesPercent;

    const newSummary = {
      totalAcquisitionRenovationRatio: tarrPercent * 100,
      totalAcquisitionRenovationAllowance,
      totalLiens,
      totalRenovationAllowance,
      termSheet: {
        afterRenovatedValue: arv,
        totalRenovationAllowanceBuyer: totalRenovationAllowance > 0 ? totalRenovationAllowance : 0,
        agentCommissionAmount,
        closingFeeAmount,
        sellerFeeAmount,
        renograteAdminFee,
        sellerIncentives,
        otherPayoffs,
        otherFeesAmount,
      },
      renograteSummary: {
        totalAdditionalSellerProfit: sellerFeeAmount + sellerIncentives + otherPayoffs,
        renograteAdminFee,
        otherFees: otherFeesAmount,
        totalRenovationAllowanceBuyer: totalRenovationAllowance > 0 ? totalRenovationAllowance : 0,
      },
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
      afterRenovatedValue: savedSummary.termSheet.afterRenovatedValue.toString(),
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
      <div className="relative flex items-center">
        <Input
          id={field}
          type="text"
          value={formatDisplayValue(field, values[field])}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="pl-6"
        />
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
          {["agentCommission", "closingFee", "sellerFee", "administrationFee", "otherFees"].includes(field)
            ? "%"
            : "$"}
        </span>
        {["agentCommission", "closingFee", "sellerFee", "administrationFee", "otherFees"].includes(field) && (
          <div className="absolute right-2 flex flex-col">
            <button
              onClick={() => handlePercentageChange(field, true)}
              className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
              type="button"
            >
              <ChevronUp size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => handlePercentageChange(field, false)}
              className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
              type="button"
            >
              <ChevronDown size={16} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Min: {min} - Max: {max}
        <br />
        {hint}
      </p>
    </div>
  );

  const renderSummaryRow = (
    label: string,
    value: number,
    isPercentage: boolean = false
  ) => (
    <div className="flex justify-between py-1 border-b border-gray-100">
      <span className="text-sm">{label}</span>
      <span className="text-sm font-medium">
        {isPercentage 
          ? `${value.toFixed(2)}%` 
          : `$${value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
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
        <Card className="bg-white/95 backdrop-blur-sm border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0C71C3] font-bold">Calculator Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* First Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "currentHomeValue",
                  "Current Home Value (CHV)",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "afterRenovatedValue",
                  "After Renovated Value (ARV)*",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent"
                )}
              </div>

              {/* Second Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "agentCommission",
                  "Agent Commission %",
                  "% 0.00",
                  "% 10.00",
                  "Typically (6%) of the transaction"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "closingFee",
                  "Closing fee %",
                  "% 0.00",
                  "% 10.00",
                  "Typically (2.5% - 4.5%) of the deal"
                )}
              </div>

              {/* Third Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "sellerFee",
                  "Seller Fee % (Additional Profit)",
                  "% 0.00",
                  "% 10.00",
                  "Seller additional profit %"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "administrationFee",
                  "Renograte Admin Fee %",
                  "% 0.00",
                  "% 5.00",
                  "Renograte administration fee"
                )}
              </div>

              {/* Fourth Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "otherFees",
                  "Other Fees % (Miscellaneous)",
                  "% 0.00",
                  "% 1.00",
                  "Optional, ranging from 0% to 1% of ARV"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "secondMortgage",
                  "2nd Mortgage",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Enter second mortgage amount"
                )}
              </div>

              {/* Fifth Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "thirdMortgage",
                  "3rd Mortgage",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Enter third mortgage amount"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "sellerPayback",
                  "Seller Payback Programs",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "First time home buyer payback terms"
                )}
              </div>

              {/* Sixth Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "sellerIncentives",
                  "Seller Incentives",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Seller Mortgage payments"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "otherPayoffs",
                  "Other Payoffs",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Seller miscellaneous expenses"
                )}
              </div>
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
        <Card className="bg-white/95 backdrop-blur-sm border-none shadow-lg">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-xl"
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-[#0C71C3] font-bold">Renograte Term Sheet & Summary</CardTitle>
              {isSummaryOpen ? (
                <ChevronUp size={24} className="text-[#0C71C3]" />
              ) : (
                <ChevronDown size={24} className="text-[#0C71C3]" />
              )}
            </div>
          </CardHeader>
          {isSummaryOpen && (
            <CardContent className="space-y-6 p-6">
              {/* Term Sheet */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-[#0C71C3] mb-4">Renograte Term Sheet</h3>
                <div className="space-y-2">
                  {renderSummaryRow("After Renovated Value (ARV)", summary.termSheet.afterRenovatedValue)}
                  {renderSummaryRow("Total Renovation Allowance (Buyer)", summary.termSheet.totalRenovationAllowanceBuyer)}
                  {renderSummaryRow("Agent Commission Amount", summary.termSheet.agentCommissionAmount)}
                  {renderSummaryRow("Closing Fee Amount", summary.termSheet.closingFeeAmount)}
                  {renderSummaryRow("Seller Fee Amount", summary.termSheet.sellerFeeAmount)}
                  {renderSummaryRow("Renograte Admin Fee", summary.termSheet.renograteAdminFee)}
                  {renderSummaryRow("Other Fees Amount", summary.termSheet.otherFeesAmount)}
                  {renderSummaryRow("Seller Incentives", summary.termSheet.sellerIncentives)}
                  {renderSummaryRow("Other Payoffs", summary.termSheet.otherPayoffs)}
                </div>
              </div>

              {/* Renograte Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-[#0C71C3] mb-4">Renograte Summary</h3>
                <div className="space-y-2">
                  {renderSummaryRow("Total Additional Seller Profit", summary.renograteSummary.totalAdditionalSellerProfit)}
                  {renderSummaryRow("Renograte Admin Fee", summary.renograteSummary.renograteAdminFee)}
                  {renderSummaryRow("Other Fees", summary.renograteSummary.otherFees)}
                  {renderSummaryRow("Total Renovation Allowance (Buyer)", summary.renograteSummary.totalRenovationAllowanceBuyer)}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Calculation History */}
        <Card className="md:col-span-2 bg-white/95 backdrop-blur-sm border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0C71C3] font-bold">Calculation History</CardTitle>
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
                      ARV: ${calc.termSheet.afterRenovatedValue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total Renovation Allowance: ${calc.termSheet.totalRenovationAllowanceBuyer.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Agent Commission: ${calc.termSheet.agentCommissionAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(calc.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadCalculation(calc)}
                    className="bg-[#0C71C3] text-white hover:bg-[#0C71C3]/90"
                  >
                    Load
                  </Button> */}
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