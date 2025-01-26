//Hero.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ChevronDown, Search, Home, TrendingUp, Link } from "lucide-react";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find properties with potential",
    },
    {
      icon: Home,
      title: "Renovation Plans",
      description: "Expert renovation guidance",
    },
    {
      icon: TrendingUp,
      title: "ROI Analysis",
      description: "Investment return forecasts",
    },
  ];

  return (
    <section className="relative w-screen min-h-screen flex flex-col md:flex-row items-center justify-between overflow-hidden">
      {/* Left Side: Search and 'How It Works' Section */}
      <motion.div
        className="flex flex-col justify-center items-start p-8 bg-white w-full md:w-1/2 rounded-tr-3xl z-20"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >
        <motion.h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-black"
          variants={fadeInUpVariants}
        >
          Empowering Realtors to Deliver Value
        </motion.h1>

        <motion.p
          className="text-base md:text-lg lg:text-xl mb-8 text-gray-600"
          variants={fadeInUpVariants}
        >
          Buyers receive custom renovation allowances, sellers get top dollar
          for their homes, and agents earn higher commissions with no upfront
          costs.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl mx-auto"
          variants={fadeInUpVariants}
        >
          <input
            type="text"
            placeholder="Enter property address"
            className="px-4 py-3 border border-gray-300 rounded-lg w-full sm:w-3/4 md:w-2/4 lg:w-3/6 focus:outline-none focus:ring focus:ring-blue-300"
          />
          <motion.button
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold flex gap-2 hover:bg-blue-700 transition-colors "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search />
            Renograte Estimator
          </motion.button>
        </motion.div>

        <motion.button
          className="mt-6 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
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

      {/* Right Side: Background Image and Feature Boxes */}
      <motion.div
        className="relative w-full md:w-1/2 h-full flex items-center justify-center"
        style={{ y }}
      >
        <Image
          src="/imagemain.png"
          alt="Modern home interior"
          width={1366}
          height={768}
          className="rounded-tl-3xl object-cover w-full h-full"
        />

        {/* Feature Boxes */}
        <motion.div
          className="absolute bottom-10 right-6 flex  gap-4 "
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white shadow-lg rounded-xl p-4 w-64 flex flex-col items-center hover:bg-gray-200  transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <feature.icon className="w-8 h-8 mb-2 text-blue-600" />
              <h3 className="text-lg font-semibold mb-1 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 text-center">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-gray-600" />
      </motion.div>
    </section>
  );
}
