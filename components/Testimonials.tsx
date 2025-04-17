"use client";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "James Mateo ",
    role: "Homeowner",
    content:
      "Renograte helped me find the perfect fixer-upper and guided me through the renovation process. I couldn't be happier with my investment!",
    // image: "/api/placeholder/100/100",
  },
  {
    id: 2,
    name: "Michael Oliver ",
    role: "Real Estate Investor",
    content:
      "The market analysis tools provided by Renograte have been invaluable in identifying profitable renovation opportunities. Highly recommended!",
    // image: "/api/placeholder/100/100",
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              whileHover={{ y: -5 }}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{testimonial.content}</p>
              <div className="flex items-center">
                <div className="ml-0 sm:ml-4">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">
                    {testimonial.name}
                  </p>
                  <p className="text-[#0C71C3] text-xs sm:text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
