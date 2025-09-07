"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Award, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import ContactAgentModal from "@/components/ContactAgentModal";

interface Agent {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  company: string | null;
  phone: string | null;
  businessType: string | null;
  licenseNumber: string | null;
  website: string | null;
  agencyName: string | null;
  title: string | null;
  serviceAreas: string[];
  specialties: string[];
  aboutAgency: string | null;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents");
        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }
        const data = await response.json();
        setAgents(data.agents);
        setFilteredAgents(data.agents);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast({
          title: "Error",
          description: "Failed to load agents. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [toast]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAgents(agents);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = agents.filter(
      (agent) =>
        agent.name?.toLowerCase().includes(term) ||
        agent.company?.toLowerCase().includes(term) ||
        agent.agencyName?.toLowerCase().includes(term) ||
        agent.serviceAreas?.some((area) => area.toLowerCase().includes(term)) ||
        agent.specialties?.some((specialty) =>
          specialty.toLowerCase().includes(term)
        )
    );

    setFilteredAgents(filtered);
  }, [searchTerm, agents]);

  const getInitials = (name: string | null) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleContactAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setContactModalOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Renograte Agents
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connect with our professional real estate agents specializing in
            renovation-ready properties
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, location, or specialty..."
              className="pl-10 py-6 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array(6)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded mb-2"></div>
                  </CardContent>
                </Card>
              ))
          ) : filteredAgents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No agents found matching your search criteria.
              </p>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24"></div>
                <CardContent className="p-6 pt-0 relative">
                  <div className="flex justify-center -mt-12">
                    <Avatar className="h-24 w-24 border-4 border-white bg-white">
                      {agent.image ? (
                        <AvatarImage
                          src={agent.image}
                          alt={agent.name || "Agent"}
                        />
                      ) : (
                        <AvatarFallback className="text-xl bg-blue-100 text-blue-800">
                          {getInitials(agent.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>

                  <div className="text-center mt-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {agent.name}
                    </h3>
                    <p className="text-gray-600">
                      {agent.title ||
                        (agent.company
                          ? `Agent at ${agent.company}`
                          : "Real Estate Agent")}
                    </p>

                    {agent.licenseNumber && (
                      <div className="flex items-center justify-center mt-1 text-sm text-gray-500">
                        <Award className="w-4 h-4 mr-1" />
                        <span>License: {agent.licenseNumber}</span>
                      </div>
                    )}
                  </div>

                  {agent.serviceAreas && agent.serviceAreas.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="font-medium">Service Areas:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {agent.serviceAreas.slice(0, 3).map((area, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-gray-50"
                          >
                            {area}
                          </Badge>
                        ))}
                        {agent.serviceAreas.length > 3 && (
                          <Badge variant="outline" className="bg-gray-50">
                            +{agent.serviceAreas.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {agent.specialties && agent.specialties.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Award className="w-4 h-4 mr-1" />
                        <span className="font-medium">Specialties:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {agent.specialties.slice(0, 3).map((specialty, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 border-blue-100"
                          >
                            {specialty}
                          </Badge>
                        ))}
                        {agent.specialties.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 border-blue-100"
                          >
                            +{agent.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="flex items-center gap-3 w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        Contact Agent
                      </a>
                    )}

                    {agent.email && (
                      <button
                        onClick={() => handleContactAgent(agent)}
                        className="flex items-center gap-3 w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                        Email Agent
                      </button>
                    )}

                    {agent.website && (
                      <a
                        href={agent.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full border border-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Are You a Real Estate Professional?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our network of renovation-focused real estate agents and grow
            your business with Renograte.
          </p>
          <Link href="/become-member">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
              Become a Renograte Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Contact Agent Modal */}
      <ContactAgentModal
        isOpen={contactModalOpen}
        onClose={handleCloseModal}
        agent={selectedAgent}
      />
    </div>
  );
}
