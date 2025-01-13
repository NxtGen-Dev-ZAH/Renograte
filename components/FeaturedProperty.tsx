//FeaturedProperty.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function FeaturedProperty() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-20 bg-white  w-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
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
          <Image
            src="/featuredproperty.jpg"
            alt="Featured Property"
            width={1200}
            height={600}
            className="w-full h-[600px] object-cover"
          />

          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black to-transparent"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: isHovered ? 0.7 : 0.5 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 p-8 text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold mb-2">
              Luxurious Beachfront Villa
            </h3>
            <p className="text-xl mb-4">123 Ocean Drive, Malibu, CA</p>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <span className="text-2xl font-bold">$4,500,000</span>
                <span className="text-lg ml-4">
                  Renovation Allowance: $500,000
                </span>
              </div>

              <motion.button
                className="px-8 py-3 bg-[#0C71C3] text-white rounded-lg font-semibold hover:bg-[#0C71C3]/90 transition-colors"
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
