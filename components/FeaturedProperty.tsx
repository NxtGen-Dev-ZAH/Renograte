//FeaturedProperty.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, BedDouble, Bath, Square, MapPin, Phone, Mail, DollarSign } from "lucide-react";

export default function FeaturedProperty() {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const propertyDetails = {
    title: "Luxurious Starboard Residence",
    address: " Elkridge, MD 21075 ",
    price: "$850,000",
    renovationAllowance: "$135,000",
    description: "Featuring spacious interiors, refined finishes,thoughtful design, luxurious suite,  access to nature, and versatile living areas.",
    specs: {
      bedrooms: 5,
      bathrooms: 4.5,
      sqft: 4200,
    },
    features: [
      "Private Beach Access",
      "Parking Space (Asphalt driveway)",
      "Water Source",
      "Gourmet Kitchen",
      "Wine Cellar",
      "Heating Forced Air",
      "Cooling Central AC",
    ],
    // agent: {
    //   name: "Sarah Johnson",
    //   phone: "(310) 555-0123",
    //   email: "sarah.j@renograte.com"
    // }
  };

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
              src="/featured2.png"
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
              {propertyDetails.title}
            </h3>
            <p className="text-sm sm:text-base md:text-xl mb-2 sm:mb-3 md:mb-4">{propertyDetails.address}</p>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-lg sm:text-xl md:text-2xl font-bold">{propertyDetails.price}</span>
                <span className="text-xs sm:text-sm md:text-lg sm:ml-4">
                  Renovation Allowance: {propertyDetails.renovationAllowance}
                </span>
              </div>

              <motion.button
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-[#0C71C3] text-white rounded-lg font-semibold hover:bg-[#0C71C3]/90 transition-colors text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
              >
                View Property Details
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Property Details Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-scroll"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative p-6 border-b border-gray-200">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                  <h3 className="text-2xl font-bold text-gray-900">{propertyDetails.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <p>{propertyDetails.address}</p>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Property Images */}
                  <div className="relative w-full h-[300px] rounded-xl overflow-hidden mb-6">
                    <Image
                      src="/featured2.png"
                      alt="Featured Property"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Price and Renovation Info */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-600">{propertyDetails.price}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-600">
                        Renovation Allowance: {propertyDetails.renovationAllowance}
                      </span>
                    </div>
                  </div>

                  {/* Property Specs */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <BedDouble className="w-5 h-5 text-gray-600" />
                      <span>{propertyDetails.specs.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Bath className="w-5 h-5 text-gray-600" />
                      <span>{propertyDetails.specs.bathrooms} Bathrooms</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Square className="w-5 h-5 text-gray-600" />
                      <span>{propertyDetails.specs.sqft} sq ft</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{propertyDetails.description}</p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Features</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {propertyDetails.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Agent Contact */}
                  {/* <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold mb-3">Contact Agent</h4>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">{propertyDetails.agent.name}</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href={`tel:${propertyDetails.agent.phone}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{propertyDetails.agent.phone}</span>
                        </a>
                        <a
                          href={`mailto:${propertyDetails.agent.email}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{propertyDetails.agent.email}</span>
                        </a>
                      </div>
                    </div>
                  </div> */}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
