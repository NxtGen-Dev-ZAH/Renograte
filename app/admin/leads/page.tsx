"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, RefreshCw, Edit, Trash2 } from "lucide-react";

// Define types
type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  address?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function LeadsManagementPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const url = statusFilter === "all" 
        ? "/api/leads" 
        : `/api/leads?status=${statusFilter}`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }
      
      const data = await response.json();
      setLeads(data.leads);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  // Handle lead deletion
  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete lead");
      }
      
      // Remove lead from state
      setLeads(leads.filter(lead => lead.id !== id));
    } catch (err) {
      console.error("Error deleting lead:", err);
      alert("Failed to delete lead. Please try again.");
    }
  };

  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.phone.includes(searchQuery)
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 pt-24 mt-8 md:mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-3">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leads Management</h1>
          </div>
          <button 
            onClick={fetchLeads}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters and search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search by name, email, or phone"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading leads...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={fetchLeads}
              >
                Try Again
              </button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No leads found. Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.roles.join(", ")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                        {lead.address && <div className="text-xs text-gray-500 truncate max-w-xs">{lead.address}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lead.status === "new" ? "bg-blue-100 text-blue-800" :
                          lead.status === "contacted" ? "bg-yellow-100 text-yellow-800" :
                          lead.status === "qualified" ? "bg-purple-100 text-purple-800" :
                          lead.status === "converted" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link href={`/admin/leads/${lead.id}`} className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 