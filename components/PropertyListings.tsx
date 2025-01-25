//PropertyListings.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const properties = [
  {
    id: 1,
    title: "Modern Fixer-Upper",
    address: "123 Main St, Philadelphia, USA",
    price: 350000,
    renovationAllowance: 50000,
    image: "/home1.png",
  },
  {
    id: 2,
    title: "Charming Bungalow",
    address: "456 Oak Ave, Maryland, USA",
    price: 275000,
    renovationAllowance: 35000,
    image: "/villabung.png",
  },
  {
    id: 3,
    title: "Spacious Colonial",
    address: "789 Elm St, Pennsylvania, USA",
    price: 450000,
    renovationAllowance: 65000,
    image: "/home2.png",
  },
];

export default function PropertyListings() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gray-50  w-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
          Renovation Allowance Listings
        </h2>
        <p className="text-lg md:text-xl font-normal text-center mb-6 text-gray-800">
          Find Listings with estimated renovation allowances
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <motion.div
              key={property.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredId(property.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredId === property.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button className="px-6 py-2 bg-[#0C71C3] text-white rounded-lg hover:bg-[#0C71C3]/90">
                    View Details
                  </button>
                </motion.div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-4">{property.address}</p>
                <div className="space-y-4 ">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">
                      ${property.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-[#0C71C3]">
                      Renovation Allowance: $
                      {property.renovationAllowance.toLocaleString()}
                    </p>
                    <p className="text-sm text-[#0C71C3]">
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
