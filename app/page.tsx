import dynamic from "next/dynamic";
import FeaturedProperty from "@/components/FeaturedProperty";
import PropertyListings from "@/components/PropertyListings";
import MarketAnalysis from "@/components/MarketAnalysis";
import Testimonials from "@/components/Testimonials";
import ModernFeaturePage from "@/components/About";


// Dynamic imports for heavy components
const HeroSection = dynamic(() => import("@/components/Hero"), {
  loading: () => <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-gray-500">Loading...</div>
  </div>,
  ssr: true,
});

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div className="relative">
        <HeroSection />
        <FeaturedProperty />
        <PropertyListings />
        <MarketAnalysis />
        <ModernFeaturePage />
        <Testimonials />
      </div>
    </div>
  );
}
