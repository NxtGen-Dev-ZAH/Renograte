import React from "react";
import Image from "next/image";

const ModernFeaturePage: React.FC = () => {
  return (
    <div
      id="modern-feature-section"
      className="bg-gray-50 min-h-screen px-6 md:px-12 pb-12 pt-14"
    >
      {/* Header Section */}
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          What Is <span className="text-[#0C71C3]">Renograte&reg;</span>?
        </h1>
        <p className="mt-4 text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
          Introducing Renograte&reg;, a better way for Real Estate Agents to
          sell unrenovated homes, for home buyers to remodel before closing, and
          for Contractors to have a new channel for their services.
        </p>
        <p className="mt-2 text-gray-600 text-lg md:text-xl max-w-5xl mx-auto">
          The Renograte&reg; System provides the tools, resources, training, and
          network for you to grow your business and achieve your overall Real
          Estate goals, all in one innovative platform.
        </p>
      </header>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Card 1 */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center border-t-4 border-blue-500">
          <Image
            src="/agent.png"
            alt="Real Estate Agents"
            width={100}
            height={100}
            className="mx-auto rounded-full mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            REAL ESTATE AGENTS
          </h3>
          <p className="text-gray-600 mb-4">
            Renograte&reg; Preferred Agents increase their value and commission
            earnings.
          </p>
          <a
            href="#"
            className="text-[#0C71C3] font-semibold hover:underline transition"
          >
            watch agent video
          </a>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center border-t-4 border-blue-500">
          <Image
            src="/agentreno.png"
            alt="Renovation Contractors"
            width={100}
            height={100}
            className="mx-auto rounded-full mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            RENOVATION CONTRACTORS
          </h3>
          <p className="text-gray-600 mb-4">
            Renograte&reg; Preferred Contractors access an exclusive network and
            pipeline of new clients.
          </p>
          <a
            href="#"
            className="text-[#0C71C3] font-semibold hover:underline transition"
          >
            watch contractor video
          </a>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center border-t-4 border-blue-500">
          <Image
            src="/seller.png"
            alt="Home Sellers"
            width={100}
            height={100}
            className="mx-auto rounded-full mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            HOME SELLERS
          </h3>
          <p className="text-gray-600 mb-4">
            Renograte&reg; Sellers receive top dollar for their home, no
            pre-sale renovations required.
          </p>
          <a
            href="#"
            className="text-[#0C71C3] font-semibold hover:underline transition"
          >
            watch seller video
          </a>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center border-t-4 border-blue-500">
          <Image
            src="/couple.png"
            alt="Home Buyers"
            width={100}
            height={100}
            className="mx-auto rounded-full mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            HOME BUYERS
          </h3>
          <p className="text-gray-600 mb-4">
            Renograte&reg; Buyers receive renovation allowances to custom
            renovate their future home.
          </p>
          <a
            href="#"
            className="text-[#0C71C3] font-semibold hover:underline transition"
          >
            watch Buyer video
          </a>
        </div>
      </div>
    </div>
  );
};

export default ModernFeaturePage;
