"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Lightbulb, Home, Hammer, Wrench, CheckCircle2, PaintBucket } from "lucide-react";
import Link from "next/link";

export default function EstimatePage() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Simulate loading process
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
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
                Property Estimate Analysis
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