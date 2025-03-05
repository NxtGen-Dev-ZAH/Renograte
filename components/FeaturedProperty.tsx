//FeaturedProperty.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function FeaturedProperty() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-black via-[#0C71C3] to-black mx-auto">
          Featured Property of the Month
        </h2>

        <motion.div
          className="relative rounded-lg overflow-hidden shadow-xl max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <div className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
            <Image
              src="/featured.png"
              alt="Featured Property"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              className="object-cover"
              priority
            />
          </div>

          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black to-transparent"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: isHovered ? 0.7 : 0.5 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
              Luxurious Beachfront Villa
            </h3>
            <p className="text-sm sm:text-base md:text-xl mb-2 sm:mb-3 md:mb-4">123 Ocean Drive, Malibu, CA</p>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-lg sm:text-xl md:text-2xl font-bold">$4,500,000</span>
                <span className="text-xs sm:text-sm md:text-lg sm:ml-4">
                  Renovation Allowance: $500,000
                </span>
              </div>

              <motion.button
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-[#0C71C3] text-white rounded-lg font-semibold hover:bg-[#0C71C3]/90 transition-colors text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Property Details
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
