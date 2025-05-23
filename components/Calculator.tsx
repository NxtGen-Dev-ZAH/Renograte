"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FaCalculator } from "react-icons/fa";

export default function RenograteCalculator() {
  const [values, setValues] = useState({
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

  const [summary, setSummary] = useState({
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
  });

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    // Remove all non-numeric characters except decimal point
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

  const handlePercentageChange = (field: string, increment: boolean) => {
    const currentValue = parseFloat(values[field as keyof typeof values]) || 0;
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

  const getPlaceholder = (field: string) => {
    if (["agentCommission", "closingFee", "sellerFee", "administrationFee", "otherFees"].includes(field)) {
      return "0.00";
    }
    return "0";
  };

  const handleInputFocus = (field: string) => {
    // When focusing, show the raw value
    const rawValue = values[field as keyof typeof values];
    setValues((prev) => ({
      ...prev,
      [field]: rawValue,
    }));
  };

  const handleInputBlur = (field: string) => {
    // When blurring, format the value
    const value = values[field as keyof typeof values];
    if (value) {
      handleInputChange(field, value);
    }
  };

  useEffect(() => {
    // Parse all values as numbers, removing any formatting
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

    setSummary({
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
    });
  }, [values]);

  const renderInput = (
    field: string,
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
          value={formatDisplayValue(field, values[field as keyof typeof values])}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onFocus={() => handleInputFocus(field)}
          onBlur={() => handleInputBlur(field)}
          placeholder={getPlaceholder(field)}
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
    <div className="fixed top-24 right-4 z-50">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-gradient-to-r from-cyan-600 via-blue-700 to-cyan-600 text-white hover:text-white hover:shadow-xl hover:scale-105 hover:bg-gradient-to-l border-none shadow-lg transition-all duration-300"
          >
            <FaCalculator size={24} className="mr-2" />
            Calculator
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
          <DialogHeader>
            <DialogTitle className="text-[#0C71C3] text-3xl font-bold text-center mb-6">
              Renograte Calculator
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              {/* First Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "currentHomeValue",
                  "Current Home Value (CHV)",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent (Enter the home sale comparable within the City up to 0.25 miles, suburbs .5 to 1 mile radius of the subject property)"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "afterRenovatedValue",
                  "After Renovated Value (ARV)*",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent (Enter the Avg Renovated home sale comparable - within the City up to .25 miles, Suburbs  .5 to 1 mile radius of the subject property)"
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
                  "Closing Fee %",
                  "% 0.00",
                  "% 10.00",
                  "Typically (2.5% - 4.5%) of the deal (Estimated Recordation & taxes, Title fees and Additional closing costs)"
                )}
              </div>

              {/* Third Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "sellerFee",
                  "Seller Fee % (Additional Profit)",
                  "% 0.00",
                  "% 10.00",
                  "Seller has option to receive an additional % profit typically 1% and up) of ARV for executing a Renograte transaction"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "administrationFee",
                  "Renograte Admin Fee %",
                  "% 1.00",
                  "% 5.00",
                  "Agent has option to add additional commission fee for managing the overall Renograte process"
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
                  "Enter dollar amount if there is a second mortgage"
                )}
              </div>

              {/* Fifth Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "thirdMortgage",
                  "3rd Mortgage",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Enter dollar amount if there is a third mortgage"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "sellerPayback",
                  "Seller Payback Programs",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "First time home buyer payback terms or other Seller payback programs"
                )}
              </div>

              {/* Sixth Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "sellerIncentives",
                  "Seller Incentives",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Seller Mortgage payments to be paid by the Buyer to cover the Renovation timeframe (Optional)"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderInput(
                  "otherPayoffs",
                  "Other Payoffs",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Seller miscellaneous expenses such as moving or storage costs to be paid for by the Buyer (Optional)"
                )}
              </div>
            </div>

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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}