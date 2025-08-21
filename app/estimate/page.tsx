"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Lightbulb,
  Home,
  Hammer,
  CheckCircle2,
  Check,
  Calculator,
  TrendingUp,
  MapPin,
  Users,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

interface EstimationResult {
  propertyAddress: string;
  arv: number;
  chv: number;
  renovationAllowance: number;
  propertyDetails: {
    listPrice: number;
    livingArea: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    propertyType: string;
  };
  comparables: {
    renovated: any[];
    asIs: any[];
  };
  calculationDetails: {
    arvFormula: string;
    chvFormula: string;
    renovationFormula: string;
    calculationMethod: "agent_matching";
  };
  handoffEvent?: {
    event_type: "require_property_details";
    address: string;
    reason: string;
    default_assumptions: {
      square_footage: number;
      bedrooms: number;
      bathrooms: number;
    };
  };
  requiresUserInput?: boolean;
  agentData: {
    neighbouringProperties: any[];
    matchingProperties?: any[];
    agentWorkflow: "specific_property" | "neighbouring_properties";
  };
}

export default function EstimatePage() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);
  const [estimationResult, setEstimationResult] =
    useState<EstimationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Property details form state for handoff workflow
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [propertyFormSubmitted, setPropertyFormSubmitted] = useState(false);
  const [isProcessingDetails, setIsProcessingDetails] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({
    square_footage: "",
    bedrooms: "",
    bathrooms: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: [] as string[],
  });

  // Simulate loading process and fetch estimation
  useEffect(() => {
    const fetchEstimation = async () => {
      if (!address) {
        setError("No address provided");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/estimate-renovation-allowance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to calculate estimate");
        }

        const result = await response.json();
        setEstimationResult(result);

        // Check if handoff event requires user input
        if (result.requiresUserInput && result.handoffEvent) {
          console.log("Handoff event detected, showing property form");
          setShowPropertyForm(true);
          // Pre-fill form with default assumptions
          if (result.handoffEvent.default_assumptions) {
            setPropertyDetails({
              square_footage:
                result.handoffEvent.default_assumptions.square_footage.toString(),
              bedrooms:
                result.handoffEvent.default_assumptions.bedrooms.toString(),
              bathrooms:
                result.handoffEvent.default_assumptions.bathrooms.toString(),
            });
          }
        }
      } catch (error) {
        console.error("Estimation error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to calculate estimate"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchEstimation();
      setShowLeadForm(true);
    }, 2500);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 120);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        role: checkbox.checked
          ? [...prev.role, value]
          : prev.role.filter((r) => r !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle property details form input changes
  const handlePropertyDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPropertyDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit property details and get updated estimation
  const handlePropertyDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingDetails(true);

    try {
      const userDetails = {
        square_footage: propertyDetails.square_footage
          ? parseInt(propertyDetails.square_footage)
          : undefined,
        bedrooms: propertyDetails.bedrooms
          ? parseInt(propertyDetails.bedrooms)
          : undefined,
        bathrooms: propertyDetails.bathrooms
          ? parseInt(propertyDetails.bathrooms)
          : undefined,
      };

      const response = await fetch("/api/estimate-renovation-allowance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          userDetails,
          isFollowUp: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update estimate with property details");
      }

      const result = await response.json();
      setEstimationResult(result);
      setPropertyFormSubmitted(true);

      // Hide the form after a delay
      setTimeout(() => {
        setShowPropertyForm(false);
      }, 1500);
    } catch (error) {
      console.error("Error submitting property details:", error);
      setError("Failed to update estimate with your property details");
    } finally {
      setIsProcessingDetails(false);
    }
  };

  const submissionSteps = [
    {
      title: "Validating Information",
      description: "Checking your details...",
      icon: <Lightbulb className="w-6 h-6" />,
    },
    {
      title: "Processing Data",
      description: "Preparing your estimate...",
      icon: <Loader2 className="w-6 h-6 animate-spin" />,
    },
    {
      title: "Creating Estimate",
      description: "Almost there...",
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStep(1);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmissionStep(2);

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          address: address,
          estimationResult: estimationResult,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit lead");
      }

      setSubmissionStep(3);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLeadSubmitted(true);

      setTimeout(() => {
        setShowLeadForm(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting lead:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-white to-cyan-50 p-4 sm:p-6 md:p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 lg:p-10 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Estimation Error
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-white to-cyan-50 p-4 sm:p-6 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8 lg:p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Renovation Allowance Estimate
              </h1>

              <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mt-2 mb-6"></div>

              {address && (
                <p className="text-md md:text-lg text-gray-600 mb-8">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  {address}
                </p>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Analyzing your property
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Calculating renovation allowance based on market data...
                  </p>
                  <div className="w-full max-w-md bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : showPropertyForm ? (
                <motion.div
                  className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-cyan-200 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {propertyFormSubmitted ? (
                    <div className="text-center py-8">
                      <motion.div
                        className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                      >
                        <Check className="w-8 h-8 text-green-500" />
                      </motion.div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Details Updated!
                      </h2>
                      <p className="text-gray-600">
                        Your property details have been processed. Updating your
                        estimate...
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handlePropertyDetailsSubmit}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                          Help Us Find Exact Renovation Allowance Estimate
                        </h2>
                        <p className="text-gray-500">
                          {estimationResult?.handoffEvent?.reason ||
                            "We need some property details to find comparable properties in your area."}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="square_footage"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Square Footage
                          </label>
                          <input
                            type="number"
                            id="square_footage"
                            name="square_footage"
                            value={propertyDetails.square_footage}
                            onChange={handlePropertyDetailsChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all focus:outline-none duration-200 placeholder-gray-400"
                            placeholder="e.g., 2000"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="bedrooms"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Number of Bedrooms
                          </label>
                          <input
                            type="number"
                            id="bedrooms"
                            name="bedrooms"
                            value={propertyDetails.bedrooms}
                            onChange={handlePropertyDetailsChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all focus:outline-none duration-200 placeholder-gray-400"
                            placeholder="e.g., 3"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="bathrooms"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Number of Bathrooms
                          </label>
                          <input
                            type="number"
                            id="bathrooms"
                            name="bathrooms"
                            step="0.5"
                            value={propertyDetails.bathrooms}
                            onChange={handlePropertyDetailsChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all focus:outline-none duration-200 placeholder-gray-400"
                            placeholder="e.g., 2.5"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessingDetails}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isProcessingDetails ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating Estimate...
                          </>
                        ) : (
                          <>
                            <Calculator className="w-4 h-4" />
                            Update My Estimate
                          </>
                        )}
                      </button>

                      <p className="text-xs text-gray-400 text-center mt-4">
                        Don't worry - we're also calculating your estimate with
                        default assumptions in the background.
                      </p>
                    </form>
                  )}
                </motion.div>
              ) : showLeadForm ? (
                <motion.div
                  className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {leadSubmitted ? (
                    <div className="text-center py-8">
                      <motion.div
                        className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                      >
                        <Check className="w-8 h-8 text-green-500" />
                      </motion.div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Thank you!
                      </h2>
                      <p className="text-gray-600">
                        Your information has been received. Preparing your
                        estimate...
                      </p>
                    </div>
                  ) : submissionStep > 0 ? (
                    <motion.div
                      className="py-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="max-w-sm mx-auto">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-full mb-8">
                            {submissionSteps.map((step, index) => (
                              <div
                                key={step.title}
                                className={`flex items-center ${index !== submissionSteps.length - 1 ? "mb-4" : ""}`}
                              >
                                <div
                                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                    index + 1 === submissionStep
                                      ? "bg-blue-100 text-blue-600"
                                      : index + 1 < submissionStep
                                        ? "bg-green-100 text-green-600"
                                        : "bg-gray-100 text-gray-400"
                                  }`}
                                >
                                  {index + 1 < submissionStep ? (
                                    <Check className="w-5 h-5" />
                                  ) : index + 1 === submissionStep ? (
                                    step.icon
                                  ) : (
                                    <div className="w-3 h-3 rounded-full bg-current" />
                                  )}
                                </div>
                                <div className="ml-4 flex-1">
                                  <p
                                    className={`font-medium ${
                                      index + 1 === submissionStep
                                        ? "text-blue-600"
                                        : index + 1 < submissionStep
                                          ? "text-green-600"
                                          : "text-gray-400"
                                    }`}
                                  >
                                    {step.title}
                                  </p>
                                  <p
                                    className={`text-sm ${
                                      index + 1 === submissionStep
                                        ? "text-blue-500"
                                        : index + 1 < submissionStep
                                          ? "text-green-500"
                                          : "text-gray-400"
                                    }`}
                                  >
                                    {step.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <motion.div
                            className="w-16 h-16 mb-4 flex items-center justify-center"
                            key={submissionStep}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div
                              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                submissionStep === 1
                                  ? "bg-blue-100"
                                  : submissionStep === 2
                                    ? "bg-yellow-100"
                                    : "bg-green-100"
                              }`}
                            >
                              {submissionSteps[submissionStep - 1].icon}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      className="space-y-1 shadow-2xl px-10 py-4 rounded-xl shadow-cyan-500"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                          Get Your Detailed Estimate
                        </h2>
                        <p className="text-gray-500">
                          Please provide your details to receive your
                          personalized renovation allowance estimate.
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:outline-none duration-200 placeholder-gray-400"
                            placeholder="Your full name"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 focus:outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                            placeholder="your@email.com"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 focus:outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                            placeholder="(123) 456-7890"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            I am a:
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              "Buyer",
                              "Seller",
                              "Agent",
                              "Lender",
                              "Other",
                            ].map((role) => (
                              <label
                                key={role}
                                className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-200 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  name="role"
                                  value={role}
                                  checked={formData.role.includes(role)}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-gray-700 text-sm">
                                  {role}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Get My Estimate
                      </button>

                      <p className="text-xs text-gray-400 text-center mt-4">
                        Your information is secure and will only be used to
                        provide your estimate.
                      </p>
                    </form>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="flex flex-col lg:flex-row gap-8 py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {/* Left Column: Estimate Results */}
                  <div className="w-full lg:w-2/3">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                          Your Renovation Allowance
                        </h2>
                        <div className="text-5xl font-bold text-blue-600 mb-4">
                          {estimationResult
                            ? formatCurrency(
                                estimationResult.renovationAllowance
                              )
                            : "$0"}
                        </div>
                        <p className="text-gray-600">
                          Estimated renovation allowance for your property
                        </p>
                      </div>

                      {estimationResult && (
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                          <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                              <TrendingUp className="w-6 h-6 text-green-600" />
                              <h3 className="text-lg font-semibold text-gray-800">
                                After Renovated Value (ARV)
                              </h3>
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              {formatCurrency(estimationResult.arv)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {estimationResult.calculationDetails.arvFormula}
                            </p>
                          </div>

                          <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                              <Home className="w-6 h-6 text-blue-600" />
                              <h3 className="text-lg font-semibold text-gray-800">
                                Current Home Value (CHV)
                              </h3>
                            </div>
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              {formatCurrency(estimationResult.chv)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {estimationResult.calculationDetails.chvFormula}
                            </p>
                          </div>
                        </div>
                      )}

                      {estimationResult && (
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Property Details
                            </h3>
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              AI Agent Match
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                List Price
                              </p>
                              <p className="font-semibold">
                                {formatCurrency(
                                  estimationResult.propertyDetails.listPrice
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Square Feet
                              </p>
                              <p className="font-semibold">
                                {estimationResult.propertyDetails.livingArea.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Bedrooms</p>
                              <p className="font-semibold">
                                {estimationResult.propertyDetails.bedrooms}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Bathrooms</p>
                              <p className="font-semibold">
                                {estimationResult.propertyDetails.bathrooms}
                              </p>
                            </div>
                          </div>
                          {estimationResult.propertyDetails.yearBuilt && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Year Built
                                  </p>
                                  <p className="font-semibold">
                                    {estimationResult.propertyDetails.yearBuilt}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Property Type
                                  </p>
                                  <p className="font-semibold">
                                    {
                                      estimationResult.propertyDetails
                                        .propertyType
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Comparables Found
                                  </p>
                                  <p className="font-semibold">
                                    {estimationResult.comparables.renovated
                                      .length +
                                      estimationResult.comparables.asIs.length}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Agent Workflow Information */}
                      {estimationResult && (
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              AI Agent Analysis
                            </h3>
                          </div>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                              <strong>Workflow:</strong>{" "}
                              {estimationResult.agentData.agentWorkflow ===
                              "specific_property"
                                ? "Specific Property Analysis"
                                : "Neighboring Properties Analysis"}
                            </p>
                            {estimationResult.agentData.agentWorkflow ===
                              "neighbouring_properties" && (
                              <>
                                <p className="text-sm text-gray-600">
                                  <strong>Properties Found:</strong>{" "}
                                  {
                                    estimationResult.agentData
                                      .neighbouringProperties.length
                                  }{" "}
                                  neighboring properties
                                </p>
                                {estimationResult.agentData
                                  .matchingProperties && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Matches:</strong>{" "}
                                    {
                                      estimationResult.agentData
                                        .matchingProperties.length
                                    }{" "}
                                    closest matches used for CHV calculation
                                  </p>
                                )}
                              </>
                            )}
                            {/* <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                               <p className="text-xs text-blue-800 font-medium">
                                <strong>Renograte Formula:</strong>
                                <br />
                                Renovation Allowance = (ARV × 87%) - CHV
                              </p> 
                            </div> */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Contact Information */}
                  <div className="w-full lg:w-1/3">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-800 mb-6">
                        Contact a Renograte Agent
                      </h3>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              Expert Consultation
                            </p>
                            <p className="text-sm text-gray-600">
                              Get personalized guidance
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              Detailed Analysis
                            </p>
                            <p className="text-sm text-gray-600">
                              Comprehensive property review
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Hammer className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              Renovation Planning
                            </p>
                            <p className="text-sm text-gray-600">
                              Custom renovation strategies
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 space-y-4">
                        <a
                          href="mailto:info@renograte.com?subject=Renovation Allowance Inquiry&body=Hi, I'm interested in learning more about the renovation allowance for my property."
                          className="flex items-center gap-3 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Mail className="w-5 h-5" />
                          Email Renograte
                        </a>

                        <a
                          href="tel:+1234567890"
                          className="flex items-center gap-3 w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Phone className="w-5 h-5" />
                          Call Now
                        </a>
                      </div>

                      {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Formula Used:</strong>
                          <br />
                          Renovation Allowance = (ARV × 87%) - CHV
                        </p>
                      </div> */}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
