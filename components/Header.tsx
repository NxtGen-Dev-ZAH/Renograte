"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDownIcon } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isListingsOpen, setIsListingsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed w-screen z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/50 backdrop-blur-sm"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div></div>
          <nav className="hidden md:block">
            <ul className="flex pl-16 space-x-8 text-base items-center">
              <li
                className="relative group"
                onMouseEnter={() => setIsListingsOpen(true)}
                onMouseLeave={() => setIsListingsOpen(false)}
              >
                <div className="flex items-center cursor-pointer text-gray-800 hover:text-[#0C71C3] hover:font-semibold transition duration-300">
                  Listings
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </div>
                {isListingsOpen && (
                  <div
                    className="absolute left-0 mt-0 w-64 bg-white shadow-lg rounded-md py-2 z-50 group-hover:block"
                    style={{ top: "100%" }}
                  >
                    <Link
                      href="/properties"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-[#0C71C3]"
                    >
                      Estimated Renovation Allowance
                    </Link>
                    <Link
                      href="/listings"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-[#0C71C3]"
                    >
                      Renograte Listings
                    </Link>
                    <Link
                      href="/listings/distressed-homes"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-[#0C71C3]"
                    >
                      Distressed Homes
                    </Link>
                  </div>
                )}
              </li>
              <li>
                <Link
                  href="/renogratefeature"
                  className="text-gray-800 hover:text-[#0C71C3] hover:font-semibold transition duration-300"
                >
                  Renograte Features
                </Link>
              </li>
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Renograte Logo"
                  width={300}
                  height={50}
                  className="h-10"
                  quality={100}
                />
              </Link>
              <li>
                <Link
                  href="/marketanalysis"
                  className="text-gray-800 hover:text-[#0C71C3] hover:font-semibold transition duration-300"
                >
                  Market Analysis
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-800 hover:text-[#0C71C3] hover:font-semibold transition duration-300"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/signup">
              <motion.button
                className="btn-primary px-6 py-2 bg-[#0C71C3] text-white rounded-lg hover:bg-[#0C71C3]/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                className="text-black hover:text-[#0C71C3]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Log In
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
