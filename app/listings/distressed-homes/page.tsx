"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, DollarSign, Clock, Wrench, Search, Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DistressedHomes() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    propertyAddress: "",
    hasAgent: "",
    hasContractor: "",
    isDeveloperOrWholesaler: ""
  });

  const handleSearch = () => {
    if (searchValue.trim()) {
      // Navigate to the estimate page with the search value as a query parameter
      router.push(`/estimate?address=${encodeURIComponent(searchValue)}`);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend or email service
    console.log("Form submitted:", formData);
    // Show success message
    setFormSubmitted(true);
    // Reset form after 5 seconds and hide it
    setTimeout(() => {
      setFormData({
        name: "",
        propertyAddress: "",
        hasAgent: "",
        hasContractor: "",
        isDeveloperOrWholesaler: ""
      });
      setFormSubmitted(false);
      setShowForm(false);
    }, 5000);
  };

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
              Don&apos;t let repair costs hold you back. With Renograte, sell your distressed property at market value while we handle all renovation aspects. Our unique pre-closing renovation program ensures maximum returns without any upfront costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative w-full sm:w-2/3">
                <input
                  type="text"
                  placeholder="Enter property address"
                  className="px-4 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-300 shadow-sm"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
              >
                <Search className="w-5 h-5" />
                <span>Renovation Allowance Estimate</span>
              </motion.button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              
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
              We transform the traditional home selling process by integrating renovations before closing, maximizing your property&apos;s value without any upfront costs.
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
      <section className="bg-gradient-to-tr from-blue-800 via-stone-800 to-cyan-600 py-12 md:py-20">
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
            
            {!showForm ? (
              <motion.button
                className="px-8 py-4 bg-white text-[#0C71C3] rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
              >
                Get Your Free Property Assessment
              </motion.button>
            ) : formSubmitted ? (
              <motion.div 
                className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-gray-800 text-xl font-bold mb-2">Assessment Requested!</h3>
                <p className="text-gray-600">Thank you for your submission. A Renograte specialist will contact you shortly to discuss your property.</p>
              </motion.div>
            ) : (
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-800 text-lg font-bold">Property Assessment</h3>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                    <input
                      type="text"
                      id="propertyAddress"
                      name="propertyAddress"
                      value={formData.propertyAddress}
                      onChange={handleInputChange}
                      placeholder="Enter complete address"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="hasAgent" className="block text-sm font-medium text-gray-700 mb-1">Do you have an Agent?</label>
                    <select
                      id="hasAgent"
                      name="hasAgent"
                      value={formData.hasAgent}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    >
                      <option value="">Select an option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="hasContractor" className="block text-sm font-medium text-gray-700 mb-1">Do you have a Contractor?</label>
                    <select
                      id="hasContractor"
                      name="hasContractor"
                      value={formData.hasContractor}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    >
                      <option value="">Select an option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="isDeveloperOrWholesaler" className="block text-sm font-medium text-gray-700 mb-1">Are you a Real Estate Developer or Wholesaler?</label>
                    <select
                      id="isDeveloperOrWholesaler"
                      name="isDeveloperOrWholesaler"
                      value={formData.isDeveloperOrWholesaler}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    >
                      <option value="">Select an option</option>
                      <option value="developer">Real Estate Developer</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="both">Both</option>
                      <option value="no">Neither</option>
                    </select>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-[#0C71C3] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#0A5A9C] transition-colors duration-300 shadow-md"
                  >
                    Submit Assessment Request
                  </button>
                </form>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
} 