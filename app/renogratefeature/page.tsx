"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  FileText,
  Building,
  Users,
  BarChart,
  MessageSquare,
  PieChart,
  Target,
  GraduationCap,
  Briefcase,
  Network,
  Cpu,
} from "lucide-react";
import TrialDialog from "@/components/TrialDialog";

export default function FeaturesPage() {
  const mainFeatures = [
    {
      title: "Renograte Calculator",
      description:
        "Easily determine buyer renovation allowances with our advanced calculator tool that considers market values, renovation costs, and potential ROI.",
      icon: Calculator,
      color: "bg-blue-50",
    },
    {
      title: "Term Sheet & Option Contract",
      description:
        "Generate comprehensive documentation for renovation agreements and property options with our legally-vetted templates.",
      icon: FileText,
      color: "bg-cyan-50",
    },
    {
      title: "Contractor Network",
      description:
        "Access our trusted network of vetted contractors, complete with ratings, reviews, and verified project histories.",
      icon: Building,
      color: "bg-teal-50",
    },
    {
      title: "Client Communication",
      description:
        "Streamline project management with integrated tools for timelines, milestones, and automated client updates.",
      icon: Users,
      color: "bg-green-50",
    },
  ];

  const additionalFeatures = [
    {
      title: "Market Analysis Tools",
      description: "Access comprehensive market data and analytics",
      icon: BarChart,
    },
    {
      title: "Communication Hub",
      description: "Centralized platform for all stakeholder communications",
      icon: MessageSquare,
    },
    {
      title: "ROI Calculator",
      description: "Estimate potential returns on renovation investments",
      icon: PieChart,
    },
    {
      title: "Lead Generation",
      description: "Advanced tools to capture and nurture qualified leads",
      icon: Target,
    },
    {
      title: "Renograte University",
      description:
        "Access a comprehensive learning hub featuring courses, webinars, and interactive content designed to enhance your expertise in integrating renovations with real estate transactions.",
      icon: GraduationCap,
    },
    {
      title: "Renograte Marketing",
      description:
        "Enhance your visibility with advanced marketing strategies and materials tailored to attract and engage clients interested in renovation-inclusive real estate transactions.",
      icon: Briefcase,
    },
    {
      title: "Partnership Directory",
      description:
        "Build professional networks by connecting with a vetted network of contractors, financial experts, and other essential services.",
      icon: Network,
    },
    {
      title: "Renograte AI",
      description:
        "Use AI-driven tools for smart property analysis, renovation cost calculations, and transaction optimization.",
      icon: Cpu,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
      {/* Hero Section */}
      <div className="text-center mb-16 mt-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Platform Features
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the tools and features that make Renograte the ultimate
          solution for integrating renovations into real estate transactions.
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {mainFeatures.map((feature, index) => (
          <Card
            key={index}
            className="border-2 border-gray-100 hover:border-cyan-100 transition-all"
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`p-3 ${feature.color} rounded-lg`}>
                  <feature.icon className="h-6 w-6 text-[#0C71C3]" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Value Proposition Section */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Transform Your Real Estate Business
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Renograte provides everything you need to streamline renovation
            integration, increase sales, and deliver exceptional value to your
            clients.
          </p>
          <TrialDialog />
        </div>
      </div>

      {/* Additional Features Grid */}
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        Additional Features
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {additionalFeatures.map((feature, index) => (
          <Card
            key={index}
            className="text-center hover:shadow-lg transition-shadow"
          >
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <feature.icon className="h-8 w-8 text-[#0C71C3]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-white rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              q: "How does the Renograte Calculator work?",
              a: "The Renograte Calculator uses market data and renovation costs to determine optimal renovation allowances for properties.",
            },
            {
              q: "How are contractors vetted?",
              a: "Contractors undergo a rigorous verification process including license checks, past project review, and client testimonials.",
            },
            {
              q: "What support is provided?",
              a: "We offer comprehensive support including training, documentation, and dedicated account managers.",
            },
            {
              q: "Can I customize the documents?",
              a: "Yes, all documents can be customized to meet your specific needs while maintaining legal compliance.",
            },
          ].map((faq, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold text-gray-900">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
