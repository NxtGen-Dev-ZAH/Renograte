import React from "react";
import Image from "next/image";
import Link from "next/link";

const ModernFeaturePage: React.FC = () => {
  return (
    <div
      id="modern-feature-section"
      className="bg-gray-50 h-full px-4 sm:px-6 md:px-12 pb-8 sm:pb-12 pt-10 sm:pt-14 w-full overflow-hidden"
    >
      {/* Header Section */}
      <header className="text-center mb-8 sm:mb-12 md:mb-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
          What Is <span className="text-[#0C71C3]">Renograte&reg;</span>?
        </h1>
        <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-2">
          Introducing Renograte&reg;, a better way for Real Estate Agents to
          sell unrenovated homes, for home buyers to remodel before closing, and
          for Contractors to have a new channel for their services.
        </p>
        <p className="mt-2 text-gray-600 text-base sm:text-lg md:text-xl max-w-5xl mx-auto px-2">
          The Renograte&reg; System provides the tools, resources, training, and
          network for you to grow your business and achieve your overall Real
          Estate goals, all in one innovative platform.
        </p>
      </header>

      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {/* Card 1 */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-4 sm:p-6 text-center border-t-4 border-blue-500">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4">
            <Image
              src="/agent.png"
              alt="Real Estate Agents"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            REAL ESTATE AGENTS
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Renograte&reg; Preferred Agents increase their value and commission
            earnings.
          </p>
          <Link
            href="https://www.youtube.com/watch?v=QBQ3ndBQUDo"
            target="_blank"
            className="text-[#0C71C3] text-sm sm:text-base font-semibold hover:underline transition"
          >
            watch agent video
          </Link>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-4 sm:p-6 text-center border-t-4 border-blue-500">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4">
            <Image
              src="/agentreno.png"
              alt="Renovation Contractors"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            RENOVATION CONTRACTORS
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Renograte&reg; Preferred Contractors access an exclusive network and
            pipeline of new clients.
          </p>
          <Link
            href="https://www.youtube.com/watch?v=2PgxlHLCIMo"
            target="_blank"
            className="text-[#0C71C3] text-sm sm:text-base font-semibold hover:underline transition"
          >
            watch contractor video
          </Link>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-4 sm:p-6 text-center border-t-4 border-blue-500">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4">
            <Image
              src="/seller.png"
              alt="Home Sellers"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            HOME SELLERS
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Renograte&reg; Sellers receive top dollar for their home, no
            pre-sale renovations required.
          </p>
          <Link
            href="https://www.youtube.com/watch?v=BfO1bJrMcu8"
            target="_blank"
            className="text-[#0C71C3] text-sm sm:text-base font-semibold hover:underline transition"
          >
            watch seller video
          </Link>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-4 sm:p-6 text-center border-t-4 border-blue-500">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4">
            <Image
              src="/couple.png"
              alt="Home Buyers"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            HOME BUYERS
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Renograte&reg; Buyers receive renovation allowances to custom
            renovate their future home.
          </p>
          <Link
            href="https://www.youtube.com/watch?v=xSMDs-clSFE"
            target="_blank"
            className="text-[#0C71C3] text-sm sm:text-base font-semibold hover:underline transition"
          >
            watch buyer video
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModernFeaturePage;
