// app/market-analysis/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, Home, Activity } from "lucide-react";

export default function MarketAnalysisPage() {
  // Sample data for charts
  const marketTrends = [
    { month: "Jan", avgPrice: 450000, renovatedPrice: 580000 },
    { month: "Feb", avgPrice: 455000, renovatedPrice: 590000 },
    { month: "Mar", avgPrice: 460000, renovatedPrice: 595000 },
    { month: "Apr", avgPrice: 465000, renovatedPrice: 600000 },
    { month: "May", avgPrice: 470000, renovatedPrice: 610000 },
    { month: "Jun", avgPrice: 475000, renovatedPrice: 615000 },
  ];

  const marketStats = [
    {
      title: "Average ROI",
      value: "32%",
      change: "+5.2%",
      icon: TrendingUp,
    },
    {
      title: "Median Price",
      value: "$485,000",
      change: "+3.8%",
      icon: DollarSign,
    },
    {
      title: "Active Listings",
      value: "1,245",
      change: "+12.5%",
      icon: Home,
    },
    {
      title: "Days on Market",
      value: "28",
      change: "-15.2%",
      icon: Activity,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="text-center mb-12 mt-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Market Analysis
        </h1>
        <p className="text-xl text-gray-600">
          Comprehensive market insights and renovation opportunity analysis
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {marketStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="h-6 w-6 text-[#0C71C3]" />
                <span
                  className={`text-sm font-medium ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-600">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Trends Chart */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Market Price Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#0C71C3"
                  name="Average Price"
                />
                <Line
                  type="monotone"
                  dataKey="renovatedPrice"
                  stroke="#06B6D4"
                  name="Renovated Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Renovation Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-cyan-50 rounded-lg">
                <h4 className="font-semibold mb-2">High ROI Renovations</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Kitchen Remodel</span>
                    <span className="font-semibold text-[#0C71C3]">
                      75% ROI
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Bathroom Update</span>
                    <span className="font-semibold text-[#0C71C3]">
                      65% ROI
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Outdoor Living</span>
                    <span className="font-semibold text-[#0C71C3]">
                      55% ROI
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Popular Features</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-[#0C71C3] rounded-full"></span>
                    <span>Open Floor Plans</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-[#0C71C3] rounded-full"></span>
                    <span>Smart Home Tech</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-[#0C71C3] rounded-full"></span>
                    <span>Energy Efficiency</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-[#0C71C3] rounded-full"></span>
                    <span>Outdoor Spaces</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Neighborhood Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    area: "Downtown",
                    growth: "+12%",
                    avgPrice: "$525,000",
                    potential: "High",
                  },
                  {
                    area: "Suburbs",
                    growth: "+8%",
                    avgPrice: "$425,000",
                    potential: "Medium",
                  },
                  {
                    area: "Historic District",
                    growth: "+15%",
                    avgPrice: "$625,000",
                    potential: "Very High",
                  },
                  {
                    area: "Waterfront",
                    growth: "+10%",
                    avgPrice: "$725,000",
                    potential: "High",
                  },
                ].map((neighborhood, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-[#0C71C3] mb-2">
                      {neighborhood.area}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Growth</span>
                        <span className="font-medium text-green-600">
                          {neighborhood.growth}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Avg. Price</span>
                        <span className="font-medium">
                          {neighborhood.avgPrice}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Potential</span>
                        <span className="font-medium text-[#0C71C3]">
                          {neighborhood.potential}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-[#0C71C3] hover:bg-[#0C71C3]/90">
                Download Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Forecast Section */}
      <div className="mt-12 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Market Forecast
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our analysis predicts continued growth in renovation-ready property
            values, with an estimated 15% increase in ROI for strategic
            renovations over the next year.
          </p>
          <Button className="bg-[#0C71C3] hover:bg-[#0C71C3]/90">
            Schedule Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}
