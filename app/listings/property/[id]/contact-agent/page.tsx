"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import RoleProtected from "@/components/RoleProtected";

export function ContactAgentPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `I'm interested in this property and would like to know more about the renovation allowance.`,
    consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleConsentChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, consent: checked }));
    if (errors.consent) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.consent;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^[0-9()\-\s+]{10,15}$/.test(formData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (!formData.consent) {
      newErrors.consent = "You must consent to be contacted";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send data to the API route
      const response = await fetch("/api/contact-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          propertyId,
          requestDate: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit inquiry");
      }

      setIsSuccess(true);

      // Reset form after 5 seconds and redirect back to property
      setTimeout(() => {
        router.push(`/listings/property/${propertyId}`);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({
        form: "There was an error submitting your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 pt-12 mt-12 max-w-3xl">
        <Link
          href={`/listings/property/${propertyId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to property
        </Link>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isSuccess ? (
            <div className="text-center py-16 px-8">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-50 p-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Thank You!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your inquiry has been sent successfully. A Renograte
                representative will review your request and connect you with the
                listing agent shortly.
              </p>
              <p className="text-gray-500 text-sm">
                You will be redirected back to the property page in a few
                seconds...
              </p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-tr from-black via-blue-600 to-black py-8 px-8 md:px-12">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Contact About This Property
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Connect with a Renograte agent to discuss this property's
                  renovation potential
                </p>
              </div>

              <div className="p-5 md:p-8">
                {errors.form && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-8">
                    <p className="font-medium">Error</p>
                    <p>{errors.form}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`pl-10 ${errors.name ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "focus:ring-blue-500 focus:border-blue-500"}`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          className={`pl-10 ${errors.email ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "focus:ring-blue-500 focus:border-blue-500"}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-gray-700 font-medium"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(123) 456-7890"
                          className={`pl-10 ${errors.phone ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "focus:ring-blue-500 focus:border-blue-500"}`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-gray-700 font-medium"
                    >
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe what you're looking for and any questions you have about this property..."
                      className={`resize-none ${errors.message ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "focus:ring-blue-500 focus:border-blue-500"}`}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <Checkbox
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={handleConsentChange}
                      className={`mt-1 ${errors.consent ? "border-red-300 text-red-500" : ""}`}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="consent"
                        className="text-sm text-gray-700"
                      >
                        I consent to Renograte processing my personal
                        information in accordance with the{" "}
                        <Link
                          href="/privacy-policy"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </label>
                      {errors.consent && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.consent}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-lg shadow-sm transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing your request...
                      </>
                    ) : (
                      "Submit Inquiry"
                    )}
                  </Button>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6">
                    <p className="text-xs text-gray-600">
                      By submitting this form, you authorize Renograte to
                      contact you regarding this property and share your
                      information with the listing agent. We respect your
                      privacy and will handle your information in accordance
                      with our privacy policy.
                    </p>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactAgentProtectedWrapper() {
  return (
    <RoleProtected
      allowedRoles={["user", "member", "agent", "contractor", "admin"]}
    >
      <ContactAgentPage />
    </RoleProtected>
  );
}
