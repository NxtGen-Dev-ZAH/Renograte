"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";

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

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roles: [] as string[],
    address: "",
    status: "new",
    notes: ""
  });

  // Fetch lead data
  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leads/${params.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch lead data");
        }
        
        const data = await response.json();
        setLead(data.lead);
        setFormData({
          name: data.lead.name,
          email: data.lead.email,
          phone: data.lead.phone,
          roles: data.lead.roles,
          address: data.lead.address || "",
          status: data.lead.status,
          notes: data.lead.notes || ""
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching lead:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [params.id]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, value]
        : prev.roles.filter(r => r !== value)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`/api/leads/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update lead");
      }
      
      const data = await response.json();
      setLead(data.lead);
      alert("Lead updated successfully");
      router.refresh();
    } catch (err) {
      console.error("Error updating lead:", err);
      alert("Failed to update lead. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 pt-24">
        <div className="max-w-4xl mx-auto flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading lead data...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Lead</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
              >
                Go Back
              </button>
              <button 
                onClick={() => router.refresh()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/leads" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leads</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Lead Details</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                
                {/* Address */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Roles */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Roles</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {['Buyer', 'Seller', 'Agent', 'Lender', 'Other'].map((role) => (
                    <label key={role} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        name="role"
                        value={role}
                        checked={formData.roles.includes(role)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700 text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes about this lead here..."
                />
              </div>
              
              {/* Metadata */}
              <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Created:</span> {lead?.createdAt ? new Date(lead.createdAt).toLocaleString() : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {lead?.updatedAt ? new Date(lead.updatedAt).toLocaleString() : "N/A"}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 