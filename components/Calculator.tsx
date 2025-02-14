"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FaCalculator } from "react-icons/fa";

export default function RenograteCalculator() {
  const [values, setValues] = useState({
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

  const [summary, setSummary] = useState({
    arvMinusChv: 0,
    totalRenovationAllowance: -499,
  });

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    processedValue = processedValue.replace(/[^\d.]/g, "");

    if (["agentCommission", "closingFee", "sellerFee"].includes(field)) {
      processedValue = parseFloat(processedValue || "0").toFixed(2);
    }

    setValues((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  useEffect(() => {
    const arvMinusChv =
      parseFloat(values.afterRenovatedValue) -
      parseFloat(values.currentHomeValue);
    const totalRenovationAllowance =
      arvMinusChv - parseFloat(values.administrationFee);

    setSummary({
      arvMinusChv,
      totalRenovationAllowance,
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
      <div className="relative">
        <Input
          id={field}
          type="text"
          value={values[field as keyof typeof values]}
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
    <div className="fixed top-24 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="bg-gradient-to-r from-cyan-600 via-blue-700 to-cyan-600 text-white hover:text-white hover:shadow-xl hover:scale-105 hover:bg-gradient-to-l border-none shadow-lg transition-all duration-300"
          >
            <FaCalculator size={24} className="mr-2" />
            Calculator
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[800px] max-w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-[#0C71C3]">
              Renograte Calculator
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* First Row */}
              <div>
                {renderInput(
                  "currentHomeValue",
                  "Current Home Value (CHV)",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent (Enter the home sale comparable within the City up to 25 miles, suburbs 3 to 1 mile radius of the subject property)"
                )}
              </div>
              <div>
                {renderInput(
                  "afterRenovatedValue",
                  "After Renovated Value (ARV)*",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Comparable analysis by agent (Enter the Avg Renovated home sale comparable within the City up to 25 miles, suburbs 3 to 1 mile radius of the subject property)"
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
                  "Typically (2.5% - 4.5%) of the deal (Estimated Recordation & taxes, Title fees and Additional closing costs)"
                )}
              </div>

              {/* Third Row */}
              <div>
                {renderInput(
                  "sellerFee",
                  "Seller Fee % (Additional Profit)",
                  "% 0.00",
                  "% 10.00",
                  "Seller has option to receive an additional % profit typically 1% and up) of ARV for executing a Renograte transaction"
                )}
              </div>
              <div>
                {renderInput(
                  "secondMortgage",
                  "2nd Mortgage",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Enter dollar amount if there is a second mortgage on the subject property"
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
                  "Seller miscellaneous expenses such as moving or storage costs to be paid for by the Buyer (Optional)"
                )}
              </div>

              {/* Fifth Row */}
              <div>
                {renderInput(
                  "sellerIncentives",
                  "Seller Incentives offered to pay by the Buyer",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "Seller Mortgage payments to be paid by the Buyer to cover longer Renovation timeframes (Optional)"
                )}
              </div>
              <div>
                {renderInput(
                  "sellerPayback",
                  "Seller Payback Programs",
                  "$ 0.00",
                  "$ 10,000,000.00",
                  "First time home buyer payback terms or other Seller payback programs"
                )}
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
            </div>

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
                      "Seller Incentives offered to pay by the Buyer",
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
