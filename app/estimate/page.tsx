"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Lightbulb, Home, Hammer, Wrench, CheckCircle2, PaintBucket, Check } from "lucide-react";
import Link from "next/link";

export default function EstimatePage() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: [] as string[]
  });

  // Simulate loading process
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
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
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        role: checkbox.checked 
          ? [...prev.role, value]
          : prev.role.filter(r => r !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend or email service
    console.log("Lead form submitted:", formData);
    setLeadSubmitted(true);
    // Show estimate after form submission
    setTimeout(() => {
      setShowLeadForm(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-white to-cyan-50 p-4 sm:p-6 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6">
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
                Estimated Renovation Allowance Analysis
              </h1>
              
              <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mt-2 mb-6"></div>
              
              {address && (
                <p className="text-md md:text-lg text-gray-600 mb-8">
                  Address: <span className="font-medium text-gray-800">{address}</span>
                </p>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing your estimate</h2>
                  <p className="text-gray-600 mb-6">Analyzing property data and renovation options...</p>
                  <div className="w-full max-w-md bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : showLeadForm ? (
                <motion.div 
                  className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {leadSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Thank you!</h2>
                      <p className="text-gray-600">Your information has been received. Preparing your estimate...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-1 shadow-2xl px-10 py-4 rounded-xl shadow-cyan-500">
                      <div className="text-center mb-8 ">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Get Your Estimate</h2>
                        <p className="text-gray-500">Please provide your details to receive your personalized renovation allowance estimate.</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500  focus:border-transparent transition-all focus:outline-none duration-200 placeholder-gray-400"
                            placeholder="Your full name"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 focus:outline-none border border-gray-200 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                            placeholder="your@email.com"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                          <div className="grid grid-cols-2 gap-3">
                            {['Buyer', 'Seller', 'Agent', 'Lender', 'Other'].map((role) => (
                              <label key={role} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="role"
                                  value={role}
                                  checked={formData.role.includes(role)}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-gray-700 text-sm">{role}</span>
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
                        Your information is secure and will only be used to provide your estimate.
                      </p>
                    </form>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  className="flex flex-col md:flex-row gap-10 py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="w-full md:w-1/2 ">
                    <div className="h-64 md:h-auto rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 relative overflow-hidden shadow-2xl p-8 flex flex-col justify-center shadow-cyan-600">
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-4 left-4">
                          <Home className="w-12 h-12 text-white/40" />
                        </div>
                        <div className="absolute top-1/4 right-8">
                          <Hammer className="w-10 h-10 text-white/40" />
                        </div>
                        <div className="absolute bottom-16 left-8">
                          <PaintBucket className="w-14 h-14 text-white/40" />
                        </div>
                        <div className="absolute bottom-6 right-12">
                          <Wrench className="w-8 h-8 text-white/40" />
                        </div>
                      </div>
                      
                      <div className="relative z-10 text-white mb-4">
                        <div className="font-bold text-4xl sm:text-5xl mb-2 text-white">RENOGRATE</div>
                        <div className="text-cyan-100 text-2xl font-light uppercase tracking-wider">VISION</div>
                      </div>
                      
                      <div className="relative z-10 text-white/90 mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-cyan-200" />
                          <span className="text-sm md:text-base">Design</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-cyan-200" />
                          <span className="text-sm md:text-base">Renovate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-cyan-200" />
                          <span className="text-sm md:text-base">Transform</span>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 text-white/60 text-xs md:text-sm">
                        Pre-Closing Solutions
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">We are Working on this WorkFlow</h2>
                    <p className="text-gray-600 mb-6">
                     Our Developers are currently working to prepare a solution that will provide you with a detailed estimate for your property.
                    </p>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-6">
                      <h3 className="font-medium text-blue-800 mb-2">What to do now ?</h3>
                      <p className="text-blue-700">
                        In the meantime, you can explore our website to learn more about our services and how we can help you with your property needs.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-cyan-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Custom Renovation Plans</h4>
                          <p className="text-gray-600">Tailored to your specific property and budget</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-cyan-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Financing Options</h4>
                          <p className="text-gray-600">Flexible pre-closing renovation financing solutions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-cyan-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Fast Turnaround</h4>
                          <p className="text-gray-600">From estimate to completed renovations before closing</p>
                        </div>
                      </div>
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