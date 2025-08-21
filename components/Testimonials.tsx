"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Swiper as SwiperType } from "swiper";

const testimonials = [
  {
    id: 1,
    name: "Cher C.",
    role: "Licensed Real Estate Agent",
    content:
      "Renograte has completely changed how I approach listings. Instead of telling sellers they need to spend thousands up front to get top dollar, I can now offer them a smarter way — let the buyer customize it with a renovation allowance built into the deal. Buyers love that they don't have to settle for a home they're just 'okay' with — they can make it their own before they even move in. And for me as an agent, it means more options, stronger offers, and clients who actually thank me for bringing this to the table.",
  },
  {
    id: 2,
    name: "Natalie S.",
    role: "Homebuyer",
    content:
      "When I first heard about Renograte, it was like someone had finally built the platform I didn't know I needed. The idea of renovating before I move in — and being able to choose the finishes, the layout, the style — all without upfront costs? It's the only way I want to buy a home now.",
  },
  {
    id: 3,
    name: "Hyacinth F.",
    role: "Homeowner",
    content:
      "As a homeowner thinking about selling, I was dreading the idea of costly renovations that might not even pay off. Renograte offered a completely new way — letting buyers take control of the upgrades, while I list the home 'as-is' and still aim for top dollar. It just makes sense.",
  },
  {
    id: 4,
    name: "Build King.",
    role: "General Contracting Firm",
    content:
      "As a contractor, I'm used to waiting until after closing to start work — and even then, it's usually chaotic. With Renograte, I'm part of the vision from the start. It's smoother for everyone, and I get to do the kind of work that truly transforms homes.",
  },
];

export default function Testimonials() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white via-sky-50 to-blue-50 w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-14 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
          What Our Clients Say
        </h2>

        <div className="relative pt-10  md:pt-14">
          {/* Decorative elements */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-gradient-to-r from-blue-100/30 to-cyan-100/30 blur-3xl"></div>
          <div className="absolute -z-10 top-0 left-10 w-20 h-20 rounded-full bg-blue-100/50 blur-xl"></div>
          <div className="absolute -z-10 bottom-10 right-10 w-32 h-32 rounded-full bg-cyan-100/50 blur-xl"></div>

          <Swiper
            modules={[EffectCoverflow, Autoplay, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            coverflowEffect={{
              rotate: 20,
              stretch: 0,
              depth: 200,
              modifier: 1.5,
              slideShadows: true,
            }}
            pagination={{
              clickable: true,
              bulletActiveClass:
                "swiper-pagination-bullet-active !bg-blue-500 !opacity-100",
              bulletClass:
                "swiper-pagination-bullet !bg-blue-300 !opacity-70 !w-3 !h-3 !mx-1.5",
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20, // Add space for small screens
              },
              768: {
                slidesPerView: 1.5,
                spaceBetween: 30, // Increased space for medium screens
              },
              1024: {
                slidesPerView: 2.2,
                spaceBetween: 50, // Increased space for large screens
              },
            }}
            className="!pb-16 !px-6 !pt-8"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                {({ isActive }) => (
                  <motion.div
                    initial={{ opacity: 0.6, y: 20 }}
                    animate={{
                      opacity: isActive ? 1 : 0.6,
                      y: isActive ? 0 : 20,
                      scale: isActive ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.5 }}
                    className={`bg-white/40 backdrop-blur-md border border-white/70 p-8 rounded-2xl shadow-2xl
                      transition-all duration-500 flex flex-col h-full justify-between
                      ${isActive ? "ring-2 ring-blue-300 ring-offset-4 ring-offset-transparent" : ""}
                      hover:ring-2 hover:ring-blue-300 hover:ring-offset-4 hover:ring-offset-transparent`}
                  >
                    <div>
                      <div className="mb-6 text-blue-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="opacity-50"
                        >
                          <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.626.41-2.223.315-.598.835-1.118 1.562-1.562.728-.443 1.488-.79 2.28-1.042 0-.655-.09-1.273-.266-1.85-.177-.573-.46-1.052-.846-1.436-.388-.384-.953-.674-1.696-.87-3.592.72-6.302 3.231-8.13 7.535-.52 1.247-.825 2.373-.913 3.38-.09 1.006-.023 1.945.203 2.813.225.87.554 1.613.988 2.228.435.612.98 1.083 1.636 1.416.655.333 1.333.5 2.033.5.68 0 1.32-.116 1.926-.347.605-.23 1.105-.642 1.5-1.233.393-.59.685-1.312.876-2.167.19-.855.285-1.92.285-3.192zm-1.866 2.342c-.12.45-.326.8-.62 1.05-.292.25-.672.374-1.14.374-.6 0-1.045-.22-1.337-.66-.285-.44-.435-1.1-.435-1.98 0-.59.073-1.28.22-2.06.72-4.41 3.24-6.62 7.54-6.62.21 0 .397.01.563.028.33.5.484.148.465.295-.12.09-.09.183-.24.278-.225.22-.393.39-.502.512-.11.12-.24.29-.394.504-.96 1.525-1.627 3.023-2 4.494V18.1z" />
                        </svg>
                      </div>
                      <p className="text-base md:text-lg text-gray-700 font-medium leading-relaxed italic">
                        &quot;{testimonial.content}&quot;
                      </p>
                    </div>
                    <div className="flex items-center mt-6 pt-4 border-t border-gray-200/50">
                      <div className="ml-0">
                        <p className="font-bold text-gray-900 text-base md:text-lg">
                          {testimonial.name}
                        </p>
                        <p className="text-[#0C71C3] text-sm md:text-base font-medium">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom navigation */}
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="p-2 rounded-full bg-white/70 hover:bg-white shadow hover:shadow-md transition-all duration-300 border border-gray-200"
              aria-label="Previous testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="p-2 rounded-full bg-white/70 hover:bg-white shadow hover:shadow-md transition-all duration-300 border border-gray-200"
              aria-label="Next testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
