'use client'
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    role: "Homeowner",
    content:
      "Renograte helped me find the perfect fixer-upper and guided me through the renovation process. I couldn't be happier with my investment!",
    // image: "/api/placeholder/100/100",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Real Estate Investor",
    content:
      "The market analysis tools provided by Renograte have been invaluable in identifying profitable renovation opportunities. Highly recommended!",
    // image: "/api/placeholder/100/100",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white  w-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          What Our Clients Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-gray-50 rounded-lg p-8 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                {/* <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                /> */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {testimonial.name}
                  </h3>
                  <p className="text-[#0C71C3]">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {testimonial.content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
