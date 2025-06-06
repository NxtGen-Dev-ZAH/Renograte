//Hero.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ChevronDown, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const [isMobile, setIsMobile] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = () => {
    if (searchValue.trim()) {
      // Navigate to the estimate page with the search value as a query parameter
      router.push(`/estimate?address=${encodeURIComponent(searchValue)}`);
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-white via-white to-cyan-50 pt-16 md:pt-28 lg:pt-36 xl:pt-40">
      {/* Background Patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Mobile-first layout - stack vertically on small screens, side by side on larger screens */}
      <div className="flex flex-col md:flex-row w-full h-full relative z-10">
        {/* Left Side: Search and 'How It Works' Section */}
        <motion.div
          className="flex flex-col justify-center items-start p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 bg-white/90 backdrop-blur-md w-full md:w-1/2 rounded-tr-3xl z-20 order-2 md:order-1 "
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="w-full max-w-2xl"
            variants={fadeInUpVariants}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent pb-2">
              Pre-Closing Buyer Renovations!
              <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mt-2 mb-6 md:mb-8"></div>
            </h1>
            
          </motion.div>

          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 md:mb-10 text-gray-600 leading-relaxed"
            variants={fadeInUpVariants}
          >
            Realtors add value and earn higher commissions, buyers receive custom
            renovation allowances, and sellers get top dollar for their homes with
            no upfront costs.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-4xl"
            variants={fadeInUpVariants}
          >
            <div className="relative w-full sm:w-3/4 md:w-2/4 lg:w-3/6">
              <input
                type="text"
                placeholder="Enter property address"
                className="px-4 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-300 shadow-sm"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute inset-0 border border-gradient-blue opacity-50 rounded-lg pointer-events-none" />
            </div>
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl text-base group overflow-hidden relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Search className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Renograte Estimator</span>
            </motion.button>
          </motion.div>

          <motion.button
            className="mt-8 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold transition-all duration-300 text-base hover:bg-gray-200 flex items-center gap-2 group"
            variants={fadeInUpVariants}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => {
              const section = document.getElementById("modern-feature-section");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            How It Works
            <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
          </motion.button>
        </motion.div>

        {/* Right Side: Background Image */}
        <motion.div
          className="relative w-full md:w-1/2 h-[40vh] md:h-full flex items-center justify-center order-1 md:order-2 overflow-hidden"
          style={{ y }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="w-full h-full"
            style={{ scale }}
          >
            <Image
              src={isMobile ? "/imagemain4.png" : "/imagemain.png"}
              alt="Modern home interior"
              width={1366}
              height={768}
              className="rounded-tl-3xl object-fill md:object-cover w-full h-full transform transition-transform duration-300"
              priority
              quality={100}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 md:bottom-16 left-1/2 transform -translate-x-1/2 z-20"
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
      </motion.div>

      {/* Add a subtle gradient overlay at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}

// Add this to your global CSS
const styles = `
.bg-grid-pattern {
  background-image: linear-gradient(to right, #f0f0f0 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
  background-size: 24px 24px;
}

.border-gradient-blue {
  background: linear-gradient(to right, #2563eb, #0891b2);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
`;
