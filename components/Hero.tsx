//Hero.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ChevronDown, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-white via-white to-cyan-50 pt-16 md:pt-28 lg:pt-36 xl:pt-40">
      {/* Mobile-first layout - stack vertically on small screens, side by side on larger screens */}
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Left Side: Search and 'How It Works' Section */}
        <motion.div
          className="flex flex-col justify-center items-start p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-sm w-full md:w-1/2 rounded-tr-3xl z-20 order-2 md:order-1"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-black"
            variants={fadeInUpVariants}
          >
            Pre-Closing Buyer Renovations!
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-gray-600"
            variants={fadeInUpVariants}
          >
            Realtors add value and earn higher commissions, buyers receive custom
            renovation allowances, and sellers get top dollar for their homes with
            no upfront costs.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-4xl mx-auto"
            variants={fadeInUpVariants}
          >
            <input
              type="text"
              placeholder="Enter property address"
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg w-full sm:w-3/4 md:w-2/4 lg:w-3/6 focus:outline-none focus:ring focus:ring-blue-300 text-sm sm:text-base"
            />
            <motion.button
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base mt-2 sm:mt-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Renograte Estimator</span>
            </motion.button>
          </motion.div>

          <motion.button
            className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const section = document.getElementById("modern-feature-section");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            How It Works
          </motion.button>
        </motion.div>

        {/* Right Side: Background Image */}
        <motion.div
          className="relative w-full md:w-1/2 h-[40vh] md:h-full flex items-center justify-center order-1 md:order-2"
          style={{ y }}
        >
          <Image
            src={isMobile ? "/imagemain4.png" : "/imagemain.png"}
            alt="Modern home interior"
            width={1366}
            height={768}
            className="rounded-tl-3xl object-fill md:object-cover w-full h-full"
            priority
          />
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
    </section>
  );
}
