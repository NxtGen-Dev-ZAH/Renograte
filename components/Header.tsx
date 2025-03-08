"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDownIcon, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
// import { useRouter } from "next/navigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isListingsOpen, setIsListingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileListingsOpen, setIsMobileListingsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  // const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-sm shadow-md" : "bg-white"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          {/* Logo - centered on mobile, left-aligned on desktop */}
          <div className="flex md:hidden items-center justify-center flex-1">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Renograte Logo"
                width={200}
                height={40}
                className="h-8 w-auto"
                quality={100}
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center text-gray-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex space-x-8 text-base items-center">
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
                  className="h-10 w-auto"
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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <motion.button
                    className="btn-primary px-6 py-2 bg-[#0C71C3] text-white rounded-lg hover:bg-[#0C71C3]/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Dashboard
                  </motion.button>
                </Link>
                <motion.button
                  className="text-black hover:text-[#0C71C3]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={logout}
                >
                  Log Out
                </motion.button>
                
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden mt-4 bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="py-2">
              <ul className="flex flex-col space-y-2">
                <li className="px-4">
                  <div 
                    className="flex items-center justify-between py-2 text-gray-800"
                    onClick={() => setIsMobileListingsOpen(!isMobileListingsOpen)}
                  >
                    <span>Listings</span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMobileListingsOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isMobileListingsOpen && (
                    <div className="pl-4 py-2 space-y-2 border-l-2 border-gray-200 ml-2">
                      <Link
                        href="/properties"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1 text-gray-800 hover:text-[#0C71C3]"
                      >
                        Estimated Renovation Allowance
                      </Link>
                      <Link
                        href="/listings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1 text-gray-800 hover:text-[#0C71C3]"
                      >
                        Renograte Listings
                      </Link>
                      <Link
                        href="/listings/distressed-homes"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1 text-gray-800 hover:text-[#0C71C3]"
                      >
                        Distressed Homes
                      </Link>
                    </div>
                  )}
                </li>
                <li className="px-4 py-2">
                  <Link
                    href="/renogratefeature"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-800 hover:text-[#0C71C3]"
                  >
                    Renograte Features
                  </Link>
                </li>
                <li className="px-4 py-2">
                  <Link
                    href="/marketanalysis"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-800 hover:text-[#0C71C3]"
                  >
                    Market Analysis
                  </Link>
                </li>
                <li className="px-4 py-2">
                  <Link
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-800 hover:text-[#0C71C3]"
                  >
                    About
                  </Link>
                </li>
                <li className="px-4 py-2 border-t border-gray-100 mt-2 pt-4">
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-2">
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full px-4 py-2 bg-[#0C71C3] text-white rounded-lg hover:bg-[#0C71C3]/90 transition-colors">
                          Dashboard
                        </button>
                      </Link>
                      <button
                        className="w-full px-4 py-2 text-black hover:text-[#0C71C3] text-center"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                      >
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full px-4 py-2 bg-[#0C71C3] text-white rounded-lg hover:bg-[#0C71C3]/90 transition-colors">
                          Sign Up
                        </button>
                      </Link>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full px-4 py-2 text-black hover:text-[#0C71C3] text-center">
                          Log In
                        </button>
                      </Link>
                    </div>
                  )}
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
