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
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export default function RenograteCalculator() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    administrationFee: "499",
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

  // Check if user has member role
  const isMember =
    session?.user?.role &&
    ["admin", "contractor", "agent"].includes(session.user.role);

  const handleCalculatorClick = () => {
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: string, value: string) => {
    // Remove all non-numeric characters except decimal point
    let processedValue = value.replace(/[^\d.]/g, "");

    // Handle percentage fields
    if (
      ["agentCommission", "closingFee", "sellerFee", "otherFees"].includes(
        field
      )
    ) {
      processedValue = parseFloat(processedValue || "0").toFixed(2);

      // Apply constraints for percentage fields
      const numValue = parseFloat(processedValue);
      if (field === "agentCommission" && (numValue < 0 || numValue > 10)) {
        processedValue = numValue < 0 ? "0.00" : "10.00";
      } else if (field === "closingFee" && (numValue < 0 || numValue > 10)) {
        processedValue = numValue < 0 ? "0.00" : "10.00";
      } else if (field === "sellerFee" && (numValue < 0 || numValue > 10)) {
        processedValue = numValue < 0 ? "0.00" : "10.00";
      } else if (field === "otherFees" && (numValue < 0 || numValue > 1)) {
        processedValue = numValue < 0 ? "0.00" : "1.00";
      }

      // Administration fee is now a static value
      if (field === "administrationFee") {
        processedValue = "499";
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
    if (field === "administrationFee") {
      return "499";
    }
    if (
      ["agentCommission", "closingFee", "sellerFee", "otherFees"].includes(
        field
      )
    ) {
      return value;
    }
    const numValue = parseFloat(value) || 0;
    return numValue.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getPlaceholder = (field: string) => {
    if (field === "administrationFee") {
      return "499";
    }
    if (
      ["agentCommission", "closingFee", "sellerFee", "otherFees"].includes(
        field
      )
    ) {
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
    const agentCommissionPercent =
      parseFloat(values.agentCommission) / 100 || 0;
    const closingFeePercent = parseFloat(values.closingFee) / 100 || 0;
    const sellerFeePercent = parseFloat(values.sellerFee) / 100 || 0;
    const adminFee = 499; // Static $499 fee
    const otherFeesPercent = parseFloat(values.otherFees) / 100 || 0;

    // Calculate TARR (should be between 85% to 90% of ARV)
    const totalPercentages =
      agentCommissionPercent +
      closingFeePercent +
      sellerFeePercent +
      otherFeesPercent;
    const tarrPercent = Math.min(Math.max(0.85, 1 - totalPercentages), 0.9);

    // Calculate TARA
    const totalAcquisitionRenovationAllowance = arv * tarrPercent;

    // Calculate Total Liens
    const secondMortgage = parseFloat(values.secondMortgage) || 0;
    const thirdMortgage = parseFloat(values.thirdMortgage) || 0;
    const sellerPayback = parseFloat(values.sellerPayback) || 0;
    const sellerIncentives = parseFloat(values.sellerIncentives) || 0;
    const otherPayoffs = parseFloat(values.otherPayoffs) || 0;
    const totalLiens =
      secondMortgage +
      thirdMortgage +
      sellerPayback +
      sellerIncentives +
      otherPayoffs;

    // Calculate Total Renovation Allowance
    const totalRenovationAllowance =
      totalAcquisitionRenovationAllowance - chv - totalLiens;

    // Calculate Term Sheet Values
    const agentCommissionAmount = arv * agentCommissionPercent;
    const closingFeeAmount = arv * closingFeePercent;
    const sellerFeeAmount = arv * sellerFeePercent;
    const renograteAdminFee = adminFee; // Static $499 fee
    const otherFeesAmount = arv * otherFeesPercent;

    setSummary({
      totalAcquisitionRenovationRatio: tarrPercent * 100,
      totalAcquisitionRenovationAllowance,
      totalLiens,
      totalRenovationAllowance,
      termSheet: {
        afterRenovatedValue: arv,
        totalRenovationAllowanceBuyer:
          totalRenovationAllowance > 0 ? totalRenovationAllowance : 0,
        agentCommissionAmount,
        closingFeeAmount,
        sellerFeeAmount,
        renograteAdminFee,
        sellerIncentives,
        otherPayoffs,
        otherFeesAmount,
      },
      renograteSummary: {
        totalAdditionalSellerProfit:
          sellerFeeAmount + sellerIncentives + otherPayoffs,
        renograteAdminFee,
        otherFees: otherFeesAmount,
        totalRenovationAllowanceBuyer:
          totalRenovationAllowance > 0 ? totalRenovationAllowance : 0,
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
          value={formatDisplayValue(
            field,
            values[field as keyof typeof values]
          )}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onFocus={() => handleInputFocus(field)}
          onBlur={() => handleInputBlur(field)}
          placeholder={getPlaceholder(field)}
          className="pl-6"
        />
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
          {["agentCommission", "closingFee", "sellerFee", "otherFees"].includes(
            field
          )
            ? "%"
            : "$"}
        </span>
        {["agentCommission", "closingFee", "sellerFee", "otherFees"].includes(
          field
        ) && (
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

  const renderSkeletonInput = (
    field: string,
    label: string,
    min: string,
    max: string,
    hint: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-gray-500">
        {label}
      </Label>
      <div className="relative flex items-center">
        <Input
          id={field}
          type="text"
          value=""
          className="pl-6 bg-gray-100 cursor-not-allowed text-gray-400"
          placeholder="Member access required"
          disabled={true}
        />
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
          {["agentCommission", "closingFee", "sellerFee", "otherFees"].includes(
            field
          )
            ? "%"
            : "$"}
        </span>
        {["agentCommission", "closingFee", "sellerFee", "otherFees"].includes(
          field
        ) && (
          <div className="absolute right-2 flex flex-col">
            <button
              className="p-1 text-gray-300 cursor-not-allowed"
              type="button"
              disabled={true}
            >
              <ChevronUp size={16} />
            </button>
            <button
              className="p-1 text-gray-300 cursor-not-allowed"
              type="button"
              disabled={true}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-400">
        Min: {min} - Max: {max}
        <br />
        {hint}
      </p>
    </div>
  );

  const renderConditionalInput = (
    field: string,
    label: string,
    min: string,
    max: string,
    hint: string
  ): JSX.Element => {
    return isMember
      ? renderInput(field, label, min, max, hint)
      : renderSkeletonInput(field, label, min, max, hint);
  };

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
          : `$${value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
      </span>
    </div>
  );

  return (
    <div className="fixed top-24 right-4 z-50">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-gradient-to-r from-cyan-600 via-blue-700 to-cyan-600 text-white hover:text-white hover:shadow-xl hover:scale-105 hover:bg-gradient-to-l border-none shadow-lg transition-all duration-300"
            onClick={handleCalculatorClick}
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
            {!isMember && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-amber-600">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800">
                      Member Access Required
                    </h3>
                    <p className="text-sm text-amber-700">
                      This calculator is available to members only (Agents,
                      Contractors). Upgrade your account to access the full
                      functionality and calculate renovation allowances.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>

          <div className="mt-6 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              {/* First Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "currentHomeValue",
                  "Current Home Value (CHV)",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent (Enter the home sale comparable within the City up to 0.25 miles, suburbs .5 to 1 mile radius of the subject property)"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "afterRenovatedValue",
                  "After Renovated Value (ARV)*",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent (Enter the Avg Renovated home sale comparable - within the City up to .25 miles, Suburbs  .5 to 1 mile radius of the subject property)"
                )}
              </div>

              {/* Second Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "agentCommission",
                  "Agent Commission %",
                  "% 0.00",
                  "% 10.00",
                  "Typically (6%) of the transaction"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "closingFee",
                  "Closing Fee %",
                  "% 0.00",
                  "% 10.00",
                  "Typically (2.5% - 4.5%) of the deal (Estimated Recordation & taxes, Title fees and Additional closing costs)"
                )}
              </div>

              {/* Third Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "sellerFee",
                  "Seller Fee % (Additional Profit)",
                  "% 0.00",
                  "% 10.00",
                  "Seller has option to receive an additional % profit typically 1% and up) of ARV for executing a Renograte transaction"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "administrationFee",
                  "Renograte Admin Fee",
                  "$ 499",
                  "$ 499",
                  "Standard $499 transaction fee"
                )}
              </div>

              {/* Fourth Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "otherFees",
                  "Other Fees % (Miscellaneous)",
                  "% 0.00",
                  "% 1.00",
                  "Optional, ranging from 0% to 1% of ARV"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "secondMortgage",
                  "2nd Mortgage",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Enter dollar amount if there is a second mortgage"
                )}
              </div>

              {/* Fifth Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "thirdMortgage",
                  "3rd Mortgage",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Enter dollar amount if there is a third mortgage"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "sellerPayback",
                  "Seller Payback Programs",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "First time home buyer payback terms or other Seller payback programs"
                )}
              </div>

              {/* Sixth Row */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "sellerIncentives",
                  "Seller Incentives",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Seller Mortgage payments to be paid by the Buyer to cover the Renovation timeframe (Optional)"
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {renderConditionalInput(
                  "otherPayoffs",
                  "Other Payoffs",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Seller miscellaneous expenses such as moving or storage costs to be paid for by the Buyer (Optional)"
                )}
              </div>
            </div>

            {isMember && (
              <Card className="bg-white/95 backdrop-blur-sm border-none shadow-lg">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-xl"
                  onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-[#0C71C3] font-bold">
                      Renograte Calculator Summary
                    </CardTitle>
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
                      <h3 className="text-xl font-semibold text-[#0C71C3] mb-4">
                        Renograte Calculations
                      </h3>
                      <div className="space-y-2">
                        {renderSummaryRow(
                          "After Renovated Value (ARV)",
                          summary.termSheet.afterRenovatedValue
                        )}
                        {renderSummaryRow(
                          "Total Renovation Allowance (Buyer)",
                          summary.termSheet.totalRenovationAllowanceBuyer
                        )}
                        {renderSummaryRow(
                          "Agent Commission Amount",
                          summary.termSheet.agentCommissionAmount
                        )}
                        {renderSummaryRow(
                          "Closing Fee Amount",
                          summary.termSheet.closingFeeAmount
                        )}
                        {renderSummaryRow(
                          "Seller Fee Amount",
                          summary.termSheet.sellerFeeAmount
                        )}
                        {renderSummaryRow(
                          "Renograte Admin Fee",
                          summary.termSheet.renograteAdminFee
                        )}
                        {renderSummaryRow(
                          "Other Fees Amount",
                          summary.termSheet.otherFeesAmount
                        )}
                        {renderSummaryRow(
                          "Seller Incentives",
                          summary.termSheet.sellerIncentives
                        )}
                        {renderSummaryRow(
                          "Other Payoffs",
                          summary.termSheet.otherPayoffs
                        )}
                      </div>
                    </div>

                    {/* Renograte Summary */}
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm">
                      <h3 className="text-xl font-semibold text-[#0C71C3] mb-4">
                        Renograte Summary
                      </h3>
                      <div className="space-y-2">
                        {renderSummaryRow(
                          "Total Additional Seller Profit",
                          summary.renograteSummary.totalAdditionalSellerProfit
                        )}
                        {renderSummaryRow(
                          "Renograte Admin Fee",
                          summary.renograteSummary.renograteAdminFee
                        )}
                        {renderSummaryRow(
                          "Other Fees",
                          summary.renograteSummary.otherFees
                        )}
                        {renderSummaryRow(
                          "Total Renovation Allowance (Buyer)",
                          summary.renograteSummary.totalRenovationAllowanceBuyer
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
