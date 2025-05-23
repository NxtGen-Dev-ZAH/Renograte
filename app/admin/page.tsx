"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, BarChart3, Settings, Home, ListFilter, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [listingCounts, setListingCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data for dashboard stats
    const fetchStats = async () => {
      try {
        // Fetch leads count
        const leadsResponse = await fetch("/api/leads");
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          setLeadCount(leadsData.leads?.length || 0);
        }
        
        // Fetch listings counts
        const pendingResponse = await fetch("/api/listings?status=pending");
        const approvedResponse = await fetch("/api/listings?status=approved");
        const rejectedResponse = await fetch("/api/listings?status=rejected");
        
        if (pendingResponse.ok && approvedResponse.ok && rejectedResponse.ok) {
          const pendingData = await pendingResponse.json();
          const approvedData = await approvedResponse.json();
          const rejectedData = await rejectedResponse.json();
          
          setListingCounts({
            pending: pendingData.listings?.length || 0,
            approved: approvedData.listings?.length || 0,
            rejected: rejectedData.listings?.length || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 pt-10 sm:p-6 md:p-8 md:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your renovation leads and website settings</p>
          </div>
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Home className="w-4 h-4" />
            <span>Back to Website</span>
          </Link>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "..." : leadCount !== null ? leadCount : "Error"}
                </h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/admin/leads" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all leads →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Listings</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "..." : listingCounts.pending}
                </h3>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/admin/listings" 
                className="text-sm text-yellow-600 hover:text-yellow-800"
              >
                Review listings →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">Analytics</h3>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">
                Analytics coming soon
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Settings</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">Configuration</h3>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">
                Settings coming soon
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link 
                href="/admin/leads"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Manage Leads</h3>
                  <p className="text-sm text-gray-500">View and manage customer leads</p>
                </div>
              </Link>
              
              <Link 
                href="/admin/listings"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-200 transition-colors"
              >
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <ListFilter className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Property Listings</h3>
                  <p className="text-sm text-gray-500">Review and manage listings</p>
                </div>
              </Link>
              
              <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed">
                <div className="rounded-full bg-gray-200 p-3 mr-4">
                  <Settings className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Settings</h3>
                  <p className="text-sm text-gray-500">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Listings overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Property Listings</h2>
              <Link 
                href="/admin/listings"
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Pending Review</h3>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    {loading ? "..." : listingCounts.pending}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Listings awaiting your approval</p>
                <Link 
                  href="/admin/listings?tab=pending"
                  className="text-sm text-yellow-600 hover:text-yellow-800"
                >
                  Review pending listings →
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Approved</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {loading ? "..." : listingCounts.approved}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Listings visible on the website</p>
                <Link 
                  href="/admin/listings?tab=approved"
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  View approved listings →
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Rejected</h3>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    {loading ? "..." : listingCounts.rejected}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Listings that need revision</p>
                <Link 
                  href="/admin/listings?tab=rejected"
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  View rejected listings →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent activity - placeholder for future expansion */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h2>
            <div className="text-center py-10 text-gray-500">
              <p>Activity tracking coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 