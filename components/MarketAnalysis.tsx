"use client";
import { useEffect, useState } from "react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { motion } from "framer-motion";

const data = [
  { neighborhood: "Downtown", avgPrice: 450000, avgRenovatedPrice: 550000 },
  { neighborhood: "Suburbs", avgPrice: 350000, avgRenovatedPrice: 425000 },
  { neighborhood: "Waterfront", avgPrice: 550000, avgRenovatedPrice: 675000 },
  {
    neighborhood: "Historic District",
    avgPrice: 400000,
    avgRenovatedPrice: 525000,
  },
];

// Simplified shorter labels for mobile
// const mobileData = data.map(item => ({
//   ...item,
//   neighborhood: item.neighborhood === "Historic District" ? "Historic" :
//                 item.neighborhood === "Waterfront" ? "Water" :
//                 item.neighborhood === "Downtown" ? "DT" : "Sub"
// }));

export default function MarketAnalysis() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add event listener
    window.addEventListener("resize", checkMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="py-6 sm:py-12 w-full overflow-hidden">
      <div className="container mx-auto px-2 sm:px-6">
        <h2 className="text-xl sm:text-3xl font-bold text-center mb-4 sm:mb-8 text-gray-800">
          Renograte Market Analysis
        </h2>
        <motion.div
          className="bg-white rounded-lg shadow-md p-2 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <ChartContainer
            config={{
              avgPrice: {
                label: "Average Price",
                color: "hsl(var(--chart-1))",
              },
              avgRenovatedPrice: {
                label: "Average Renovated Price",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[180px] sm:h-[300px] mx-auto"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data}
                margin={{ 
                  top: 10, 
                  right: 30, // Increased right margin
                  left: 10, // Added left margin
                  bottom: 30 // Increased bottom margin
                }}
              >
                <XAxis 
                  dataKey="neighborhood" 
                  tick={{ fontSize: 10 }}
                  angle={-45} // Angled text for better readability
                  textAnchor="end" // Align text end for angled labels
                  height={60} // Increased height to accommodate angled text
                  tickFormatter={(value) => {
                    // Handle long neighborhood names
                    if (window.innerWidth < 640 && value === 'Historic District') {
                      return 'Historic Dist.';
                    }
                    return value;
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `$${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                      return `$${(value / 1000).toFixed(0)}K`;
                    }
                    return `$${value}`;
                  }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
                />

                <Bar 
                  dataKey="avgPrice" 
                  fill="#00BCD4" 
                  name="Average Price"
                />
                <Bar
                  dataKey="avgRenovatedPrice"
                  fill="#0C71C3"
                  name="Avg Renovated Price"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-2 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
              Compare average property prices before and after renovation across different neighborhoods. Our data shows significant value appreciation post-renovation.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}