"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import React from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Download,
  Edit,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  Video,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

interface MarketingAsset {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  fileUrl: string;
  thumbnail: string | null;
  status: string;
  createdAt: string;
}

interface CampaignAsset {
  id: string;
  campaignId: string;
  assetId: string;
  order: number;
  asset: MarketingAsset;
}

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  assets: CampaignAsset[];
}

export default function ViewCampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = React.use(params);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [user, router, toast]);

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/marketing/campaigns/${campaignId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch campaign");
        }
        const data = await response.json();
        setCampaign(data);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        toast({
          title: "Error",
          description: "Failed to load campaign data",
          variant: "destructive",
        });
        router.push("/admin/marketing/campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, router, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case "video":
        return <Video className="h-5 w-5 text-red-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-amber-500" />;
      case "email_template":
        return <Mail className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 mt-8 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 mt-8 min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The campaign you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/admin/marketing/campaigns">Back to Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-8 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/admin/marketing/campaigns" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(campaign.status)}
          <p className="text-muted-foreground">
            Created on {formatDate(campaign.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Button asChild>
          <Link href={`/admin/marketing/campaigns/${campaignId}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Campaign
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets ({campaign.assets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaign.description && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {campaign.description}
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Campaign Period</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {campaign.startDate
                            ? `Starts: ${formatDate(campaign.startDate)}`
                            : "No start date set"}
                        </span>
                      </div>
                      {campaign.endDate && (
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>Ends: {formatDate(campaign.endDate)}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Status</h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(campaign.status)}
                        <span className="text-muted-foreground capitalize">
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assets">
          <div className="grid gap-4">
            {campaign.assets.map((campaignAsset) => (
              <Card key={campaignAsset.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getAssetTypeIcon(campaignAsset.asset.type)}
                        <h3 className="font-medium">{campaignAsset.asset.title}</h3>
                      </div>
                      {campaignAsset.asset.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {campaignAsset.asset.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="capitalize">
                          {campaignAsset.asset.category}
                        </Badge>
                        <span>•</span>
                        <span>Added {formatDate(campaignAsset.asset.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={campaignAsset.asset.fileUrl} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={campaignAsset.asset.fileUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 