// PropertyListings.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, BedDouble, Bath, Square, MapPin, Calculator, TrendingUp } from "lucide-react";

const properties = [
  {
    id: 1,
    title: "Modern Fixer-Upper",
    address: "123 Main St, Philadelphia, USA",
    price: 350000,
    renovationAllowance: 50000,
    image: "/home1.png",
    width: 795,
    height: 499,
    description: "A stunning modern home with great potential for customization. Features open concept living spaces and abundant natural light. Perfect for buyers looking to add their personal touch.",
    specs: {
      bedrooms: 4,
      bathrooms: 2.5,
      sqft: 2800,
    },
    features: [
      "Open Floor Plan",
      "Large Windows",
      "Hardwood Floors",
      "Spacious Backyard",
      "Attached Garage",
      "Updated Kitchen"
    ]
  },
  {
    id: 2,
    title: "Charming Bungalow",
    address: "456 Oak Ave, Maryland, USA",
    price: 275000,
    renovationAllowance: 35000,
    image: "/villabung.png",
    width: 826,
    height: 523,
    description: "Charming bungalow with classic architectural details. This home offers a perfect blend of historic character and modern renovation potential. Ideal for those seeking a cozy yet stylish living space.",
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
    },
    features: [
      "Original Hardwood",
      "Built-in Shelving",
      "Covered Porch",
      "Updated Electrical",
      "Mature Garden",
      "Basement Storage"
    ]
  },
  {
    id: 3,
    title: "Spacious Colonial",
    address: "789 Elm St, Pennsylvania, USA",
    price: 450000,
    renovationAllowance: 65000,
    image: "/home2.png",
    width: 817,
    height: 513,
    description: "Elegant colonial home with tremendous potential. Features high ceilings, formal dining room, and a grand entrance. Perfect for buyers looking to create their dream home with historic charm.",
    specs: {
      bedrooms: 5,
      bathrooms: 3.5,
      sqft: 3500,
    },
    features: [
      "Grand Staircase",
      "Crown Molding",
      "Formal Dining",
      "Butler's Pantry",
      "Multiple Fireplaces",
      "Large Windows"
    ]
  },
];

export default function PropertyListings() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<typeof properties[0] | null>(null);

  const calculateAfterRenovationValue = (price: number, allowance: number) => {
    return price + allowance * 1.4;
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50 w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-[#0C71C3] to-gray-900">
          Renovation Allowance Listings
        </h2>
        <p className="text-base sm:text-lg md:text-xl font-normal text-center mb-6 sm:mb-8 text-gray-600 max-w-3xl mx-auto">
          Find Listings with estimated renovation allowances and transform them into your dream home
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {properties.map((property) => (
            <motion.div
              key={property.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col transform transition-all duration-300 hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              onHoverStart={() => setHoveredId(property.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredId === property.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 flex items-center gap-2 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedProperty(property)}
                  >
                    <span>View Details</span>
                  </motion.button>
                </motion.div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{property.title}</h3>
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <p className="text-sm">{property.address}</p>
                </div>
                <div className="space-y-4 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">
                      ${property.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-cyan-600">
                      <Calculator className="w-4 h-4" />
                      <p className="text-sm">
                        Renovation Allowance: ${property.renovationAllowance.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <p className="text-sm">
                        After Renovation Value: $
                        {calculateAfterRenovationValue(
                          property.price,
                          property.renovationAllowance
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Property Details Modal */}
        <AnimatePresence>
          {selectedProperty && (
            <motion.div
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProperty(null)}
            >
              <motion.div
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-scroll"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative p-6 border-b border-gray-100">
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedProperty.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <p>{selectedProperty.address}</p>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Property Images */}
                  <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
                    <Image
                      src={selectedProperty.image}
                      alt={selectedProperty.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Price and Renovation Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">List Price</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${selectedProperty.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-xl">
                      <p className="text-sm text-cyan-600 mb-1">Renovation Allowance</p>
                      <p className="text-xl font-bold text-cyan-700">
                        ${selectedProperty.renovationAllowance.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-sm text-green-600 mb-1">After Renovation Value</p>
                      <p className="text-xl font-bold text-green-700">
                        ${calculateAfterRenovationValue(
                          selectedProperty.price,
                          selectedProperty.renovationAllowance
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Property Specs */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <BedDouble className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="font-semibold">{selectedProperty.specs.bedrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Bath className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Bathrooms</p>
                        <p className="font-semibold">{selectedProperty.specs.bathrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Square className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Square Feet</p>
                        <p className="font-semibold">{selectedProperty.specs.sqft.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedProperty.description}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Features</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedProperty.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex justify-center pt-4">
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.location.href = '/listings'}
                    >
                      View More Properties
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
