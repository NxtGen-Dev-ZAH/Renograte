"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Award,
  Phone,
  Mail,
  Globe,
  Building,
  Wrench,
  Users,
} from "lucide-react";
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

interface Contractor {
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

type Professional = Agent | Contractor;

export default function DirectoryPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<
    { type: "agent" | "contractor"; data: Professional }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "agents" | "contractors"
  >("all");
  const [loading, setLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsResponse, contractorsResponse] = await Promise.all([
          fetch("/api/agents"),
          fetch("/api/contractors"),
        ]);

        if (!agentsResponse.ok || !contractorsResponse.ok) {
          throw new Error("Failed to fetch professionals");
        }

        const agentsData = await agentsResponse.json();
        const contractorsData = await contractorsResponse.json();

        setAgents(agentsData.agents);
        setContractors(contractorsData.contractors);

        // Combine all professionals for initial display
        const allProfessionals = [
          ...agentsData.agents.map((agent: Agent) => ({
            type: "agent" as const,
            data: agent,
          })),
          ...contractorsData.contractors.map((contractor: Contractor) => ({
            type: "contractor" as const,
            data: contractor,
          })),
        ];
        setFilteredProfessionals(allProfessionals);
      } catch (error) {
        console.error("Error fetching professionals:", error);
        toast({
          title: "Error",
          description: "Failed to load professionals. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    let allProfessionals: {
      type: "agent" | "contractor";
      data: Professional;
    }[] = [];

    // Filter by type
    if (selectedType === "agents") {
      allProfessionals = agents.map((agent) => ({
        type: "agent" as const,
        data: agent,
      }));
    } else if (selectedType === "contractors") {
      allProfessionals = contractors.map((contractor) => ({
        type: "contractor" as const,
        data: contractor,
      }));
    } else {
      allProfessionals = [
        ...agents.map((agent) => ({ type: "agent" as const, data: agent })),
        ...contractors.map((contractor) => ({
          type: "contractor" as const,
          data: contractor,
        })),
      ];
    }

    // Filter by search term
    if (searchTerm.trim() === "") {
      setFilteredProfessionals(allProfessionals);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = allProfessionals.filter(
      ({ data }) =>
        data.name?.toLowerCase().includes(term) ||
        data.company?.toLowerCase().includes(term) ||
        data.agencyName?.toLowerCase().includes(term) ||
        data.serviceAreas?.some((area) => area.toLowerCase().includes(term)) ||
        data.specialties?.some((specialty) =>
          specialty.toLowerCase().includes(term)
        )
    );

    setFilteredProfessionals(filtered);
  }, [searchTerm, selectedType, agents, contractors]);

  const getInitials = (name: string | null) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleContactProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
    setContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setContactModalOpen(false);
    setSelectedProfessional(null);
  };

  const getTypeIcon = (type: "agent" | "contractor") => {
    return type === "agent" ? Building : Wrench;
  };

  const getTypeColor = (type: "agent" | "contractor") => {
    return type === "agent"
      ? "from-blue-500 to-blue-600"
      : "from-orange-500 to-orange-600";
  };

  const getTypeBadgeColor = (type: "agent" | "contractor") => {
    return type === "agent"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : "bg-orange-50 text-orange-700 border-orange-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl mb-6 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-6 pb-4">
              Renograte Directory
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Connect with our curated network of professional real estate
              agents and contractors specializing in renovation-ready properties
            </p>
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Verified Professionals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Renovation Specialists</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                  <Building className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {agents.length}
              </h3>
              <p className="text-gray-600 font-medium">Real Estate Agents</p>
              <p className="text-sm text-gray-500 mt-2">
                Licensed professionals
              </p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                  <Wrench className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {contractors.length}
              </h3>
              <p className="text-gray-600 font-medium">Contractors</p>
              <p className="text-sm text-gray-500 mt-2">Renovation experts</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {agents.length + contractors.length}
              </h3>
              <p className="text-gray-600 font-medium">Total Professionals</p>
              <p className="text-sm text-gray-500 mt-2">Network members</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by name, location, or specialty..."
                  className="pl-12 py-4 text-lg border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  onClick={() => setSelectedType("all")}
                  className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                    selectedType === "all"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  All Professionals
                </Button>
                <Button
                  variant={selectedType === "agents" ? "default" : "outline"}
                  onClick={() => setSelectedType("agents")}
                  className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                    selectedType === "agents"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Agents
                </Button>
                <Button
                  variant={
                    selectedType === "contractors" ? "default" : "outline"
                  }
                  onClick={() => setSelectedType("contractors")}
                  className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                    selectedType === "contractors"
                      ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Contractors
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeletons
            Array(6)
              .fill(0)
              .map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden animate-pulse border-0 shadow-lg"
                >
                  <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                  <CardContent className="p-8">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                    <div className="h-12 bg-gray-200 rounded mb-2"></div>
                  </CardContent>
                </Card>
              ))
          ) : filteredProfessionals.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No professionals found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search criteria or browse all
                  professionals.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                  }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  View All Professionals
                </Button>
              </div>
            </div>
          ) : (
            filteredProfessionals.map(({ type, data }) => {
              const Icon = getTypeIcon(type);
              const gradientClass = getTypeColor(type);
              const badgeClass = getTypeBadgeColor(type);

              return (
                <Card
                  key={`${type}-${data.id}`}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group hover:-translate-y-1"
                >
                  <div
                    className={`bg-gradient-to-r ${gradientClass} h-32 relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-4 right-4">
                      <Badge
                        className={`${badgeClass} shadow-lg backdrop-blur-sm`}
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {type === "agent" ? "Agent" : "Contractor"}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white/60 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-8 pt-0 relative">
                    <div className="flex justify-center -mt-16">
                      <Avatar className="h-32 w-32 border-4 border-white bg-white shadow-xl">
                        {data.image ? (
                          <AvatarImage
                            src={data.image}
                            alt={data.name || "Professional"}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-semibold">
                            {getInitials(data.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>

                    <div className="text-center mt-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {data.name}
                      </h3>
                      <p className="text-gray-600 font-medium mb-3">
                        {data.title ||
                          (data.company
                            ? `${type === "agent" ? "Agent" : "Contractor"} at ${data.company}`
                            : type === "agent"
                              ? "Real Estate Agent"
                              : "Contractor")}
                      </p>

                      {data.licenseNumber && (
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            <Award className="w-4 h-4 mr-1" />
                            <span>Licensed: {data.licenseNumber}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {data.serviceAreas && data.serviceAreas.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="font-semibold">Service Areas</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.serviceAreas.slice(0, 3).map((area, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              {area}
                            </Badge>
                          ))}
                          {data.serviceAreas.length > 3 && (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-600 border-gray-200"
                            >
                              +{data.serviceAreas.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {data.specialties && data.specialties.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <Award className="w-4 h-4 mr-2 text-purple-500" />
                          <span className="font-semibold">Specialties</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.specialties
                            .slice(0, 3)
                            .map((specialty, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className={`${badgeClass} hover:opacity-80 transition-opacity`}
                              >
                                {specialty}
                              </Badge>
                            ))}
                          {data.specialties.length > 3 && (
                            <Badge
                              variant="secondary"
                              className={`${badgeClass} hover:opacity-80 transition-opacity`}
                            >
                              +{data.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 space-y-3">
                      {data.phone && (
                        <a
                          href={`tel:${data.phone}`}
                          className={`flex items-center justify-center gap-3 w-full ${type === "agent" ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"} text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
                        >
                          <Phone className="w-5 h-5" />
                          Contact {type === "agent" ? "Agent" : "Contractor"}
                        </a>
                      )}

                      {data.email && (
                        <button
                          onClick={() => handleContactProfessional(data)}
                          className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-6 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 border border-gray-200"
                        >
                          <Mail className="w-5 h-5" />
                          Email {type === "agent" ? "Agent" : "Contractor"}
                        </button>
                      )}

                      {data.website && (
                        <a
                          href={data.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 w-full border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                        >
                          <Globe className="w-5 h-5" />
                          Visit Website
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-12 max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl mb-8 shadow-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Join Our Professional Network
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Are you a real estate professional or contractor? Join our
              exclusive network of renovation-focused professionals and grow
              your business with Renograte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/become-member">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Become a Renograte Professional
                </Button>
              </Link>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free to join</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Verified network</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Growth opportunities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Professional Modal */}
      <ContactAgentModal
        isOpen={contactModalOpen}
        onClose={handleCloseModal}
        agent={selectedProfessional}
      />
    </div>
  );
}
