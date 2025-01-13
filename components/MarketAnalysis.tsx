//MarketAnalysis.tsx
"use client";
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

export default function MarketAnalysis() {
  return (
    <section className="py-20  w-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          Market Analysis
        </h2>{" "}
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
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
            className="h-[400px] mx-auto"
          >
            <ResponsiveContainer width="90%" height="100%">
              <BarChart data={data} >
                <XAxis dataKey="neighborhood" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />

                <Bar dataKey="avgPrice" fill="#00BCD4" name="Average Price" />
                <Bar
                  dataKey="avgRenovatedPrice"
                  fill="#0C71C3"
                  name="Avg Renovated Price "
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-8 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              Compare average property prices before and after renovation across
              different neighborhoods. Our data shows significant value
              appreciation post-renovation.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { motion } from 'framer-motion';

// const data = [
//   { neighborhood: 'Downtown', avgPrice: 450000, avgRenovatedPrice: 550000 },
//   { neighborhood: 'Suburbs', avgPrice: 350000, avgRenovatedPrice: 425000 },
//   { neighborhood: 'Waterfront', avgPrice: 550000, avgRenovatedPrice: 675000 },
//   { neighborhood: 'Historic District', avgPrice: 400000, avgRenovatedPrice: 525000 },
// ];

// export default function MarketAnalysis() {
//   return (
//     <section className="py-20 bg-gray-50">
//       <div className="container mx-auto px-4">

//         <motion.div
//           className="bg-white rounded-lg shadow-lg p-6"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           viewport={{ once: true }}
//         >
//           <div className="h-[400px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={data}>
//                 <XAxis dataKey="neighborhood" />
//                 <YAxis />

//                 <Bar dataKey="avgPrice" fill="#0C71C3" name="Average Price" />
//                 <Bar dataKey="avgRenovatedPrice" fill="#00BCD4" name="After Renovation" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="mt-8 text-center">
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Compare average property prices before and after renovation across different neighborhoods.
//               Our data shows significant value appreciation post-renovation.
//             </p>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }
