import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-cyan-950 via-black to-cyan-950  text-white w-full overflow-hidden ">
      {/* Top wave decoration */}      
      <div className="container mx-auto px-6 py-8 md:py-12 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500 ">Renograte </h3>
            <p className="text-gray-300 mb-6">
              Integrating renovation into real estate transactions.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF size={16} />
              </Link>
              <Link
                href="#"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300"
                aria-label="Twitter"
              >
                <FaTwitter size={16} />
              </Link>
              <Link
                href="#"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={16} />
              </Link>
              <Link
                href="#"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={16} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-6 after:content-[''] after:block after:w-12 after:h-1 after:bg-blue-500 after:mt-2">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/properties"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  href="/renovations"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  Renovations
                </Link>
              </li>
              <li>
                <Link
                  href="/market-analysis"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  Market Analysis
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-semibold mb-6 after:content-[''] after:block after:w-12 after:h-1 after:bg-blue-500 after:mt-2">Contact</h4>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center">
                <FiMapPin className="mr-3 text-blue-400 flex-shrink-0" /> 
                <span>Washington D.C., USA</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-3 text-blue-400 flex-shrink-0" /> 
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-3 text-blue-400 flex-shrink-0" /> 
                <span>info@renograte.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xl font-semibold mb-6 after:content-[''] after:block after:w-12 after:h-1 after:bg-blue-500 after:mt-2">Newsletter</h4>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-gray-800 border-0 rounded-lg px-4 py-3 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p>&copy; 2025 Renograte. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-6">
            <Link href="/privacy" className="hover:text-blue-400 transition duration-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-400 transition duration-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
