// PropertyListings.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const properties = [
  {
    id: 1,
    title: "Modern Fixer-Upper",
    address: "123 Main St, Philadelphia, USA",
    price: 350000,
    renovationAllowance: 50000,
    image: "/home1.png",
    width: 795, // Replace with actual width
    height: 499, // Replace with actual height
  },
  {
    id: 2,
    title: "Charming Bungalow",
    address: "456 Oak Ave, Maryland, USA",
    price: 275000,
    renovationAllowance: 35000,
    image: "/villabung.png",
    width: 826, // Replace with actual width
    height: 523, // Replace with actual height
  },
  {
    id: 3,
    title: "Spacious Colonial",
    address: "789 Elm St, Pennsylvania, USA",
    price: 450000,
    renovationAllowance: 65000,
    image: "/home2.png",
    width: 817, // Replace with actual width
    height: 513, // Replace with actual height
  },
];

export default function PropertyListings() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50 w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 md:mb-6 text-gray-800">
          Renovation Allowance Listings
        </h2>
        <p className="text-base sm:text-lg md:text-xl font-normal text-center mb-6 sm:mb-8 text-gray-800 px-2">
          Find Listings with estimated renovation allowances
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {properties.map((property) => (
            <motion.div
              key={property.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col"
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
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredId === property.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button className="px-4 sm:px-6 py-2 bg-[#0C71C3] text-white rounded-lg hover:bg-[#0C71C3]/90 text-sm sm:text-base">
                    View Details
                  </button>
                </motion.div>
              </div>

              <div className="p-4 sm:p-6 flex-grow flex flex-col">
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{property.address}</p>
                <div className="space-y-3 sm:space-y-4 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold">
                      ${property.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-xs sm:text-sm text-[#0C71C3]">
                      Renovation Allowance: $
                      {property.renovationAllowance.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-[#0C71C3]">
                      After Renovation Value: $
                      {(
                        property.price +
                        property.renovationAllowance * 1.4
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
