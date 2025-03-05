"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Search, Home, ArrowRight, Sparkles, DollarSign, Clock, Wrench } from "lucide-react";
import Link from "next/link";

export default function DistressedHomes() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <DollarSign className="w-6 h-6 text-[#0C71C3]" />,
      title: "Maximum Value",
      description: "Get top dollar for your distressed property without investing in repairs"
    },
    {
      icon: <Clock className="w-6 h-6 text-[#0C71C3]" />,
      title: "Quick Process",
      description: "Fast-track your sale with our streamlined renovation integration"
    },
    {
      icon: <Wrench className="w-6 h-6 text-[#0C71C3]" />,
      title: "No Repairs Needed",
      description: "Sell your property as-is, we handle all renovation aspects"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-cyan-50 pt-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <motion.div 
            className="w-full md:w-1/2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Transform Your Distressed Property into a 
              <span className="text-[#0C71C3]"> Profitable Sale</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Don't let repair costs hold you back. With Renograte, sell your distressed property at market value while we handle all renovation aspects. Our unique pre-closing renovation program ensures maximum returns without any upfront costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/properties" className="w-full sm:w-auto">
                <motion.button
                  className="w-full px-6 py-3 bg-[#0C71C3] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#0C71C3]/90 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Property Estimate
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto">
                <motion.button
                  className="w-full px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>
          <motion.div 
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/distressed.png"
              alt="Distressed Home Transformation"
              width={600}
              height={400}
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 backdrop-blur-sm py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Renograte for Your Distressed Property?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We transform the traditional home selling process by integrating renovations before closing, maximizing your property's value without any upfront costs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-12 md:py-20">
        <motion.div 
          className="text-center mb-12"
          {...fadeInUp}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our streamlined process makes selling your distressed property simple and profitable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: "1",
              title: "Property Assessment",
              description: "We evaluate your property's current condition and potential value after renovation."
            },
            {
              step: "2",
              title: "Renovation Planning",
              description: "Our experts create a comprehensive renovation plan to maximize property value."
            },
            {
              step: "3",
              title: "Buyer Matching",
              description: "We connect you with buyers interested in customizing their future home."
            },
            {
              step: "4",
              title: "Closing & Renovation",
              description: "Complete the sale and let us handle the renovation process."
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              className="relative bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="absolute -top-4 left-4 bg-[#0C71C3] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-2 mt-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center text-white space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Ready to Transform Your Distressed Property?
            </h2>
            <p className="max-w-2xl mx-auto text-white/90">
              Get started today and discover how much value we can add to your property through our innovative renovation program.
            </p>
            <motion.button
              className="px-8 py-4 bg-white text-[#0C71C3] rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Your Free Property Assessment
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 