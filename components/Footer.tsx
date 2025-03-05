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
    <footer className="bg-gray-900 text-white py-8 sm:py-10 md:py-12 w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-white">Renograte</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Integrating renovation into real estate transactions.
            </p>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link
                  href="/properties"
                  className="text-gray-400 hover:text-white transition duration-300 text-sm sm:text-base"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  href="/renovations"
                  className="text-gray-400 hover:text-white transition duration-300 text-sm sm:text-base"
                >
                  Renovations
                </Link>
              </li>
              <li>
                <Link
                  href="/market-analysis"
                  className="text-gray-400 hover:text-white transition duration-300 text-sm sm:text-base"
                >
                  Market Analysis
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition duration-300 text-sm sm:text-base"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center sm:text-left mt-6 sm:mt-0">
            <h4 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-1 sm:space-y-2 text-gray-400">
              <li className="flex items-center justify-center sm:justify-start text-sm sm:text-base">
                <FiMapPin className="mr-2 flex-shrink-0" /> Washington D.C., USA
              </li>
              <li className="flex items-center justify-center sm:justify-start text-sm sm:text-base">
                <FiPhone className="mr-2 flex-shrink-0" /> Phone: (123) 456-7890
              </li>
              <li className="flex items-center justify-center sm:justify-start text-sm sm:text-base">
                <FiMail className="mr-2 flex-shrink-0" /> Email: info@renograte.com
              </li>
              <li className="text-sm sm:text-base text-center sm:text-left">24/7/365</li>
            </ul>
          </div>

          <div className="text-center sm:text-left mt-6 sm:mt-0">
            <h4 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Follow Us</h4>
            <div className="flex space-x-4 justify-center sm:justify-start">
              <Link
                href="#"
                className="text-gray-400 hover:text-[#0C71C3] transition duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF size={18} className="sm:w-5 sm:h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-[#0C71C3] transition duration-300"
                aria-label="Twitter"
              >
                <FaTwitter size={18} className="sm:w-5 sm:h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-[#0C71C3] transition duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={18} className="sm:w-5 sm:h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-[#0C71C3] transition duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={18} className="sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800 text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; 2025 Renograte. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
