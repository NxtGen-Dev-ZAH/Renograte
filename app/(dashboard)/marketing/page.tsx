"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Users, 
  Download, 
  Plus, 
  LineChart, 
  TrendingUp, 
  FileText,
  Image as ImageIcon,
  Video,
  Mail,
  Instagram,
  Facebook,
  Calendar,
  Archive,
  AlertCircle,
  Folder,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import RoleProtected from "@/components/RoleProtected";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { toast as showToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  assets: {
    asset: {
      id: string;
      title: string;
    };
  }[];
}

interface MarketingAsset {
  id: string;
  title: string;
  type: string;
  category: string;
  thumbnail?: string;
  fileUrl: string;
}

interface AssetCounts {
  total: number;
  image: number;
  document: number;
  video: number;
  email_template: number;
  social_post: number;
  presentation: number;
}
const getProxyUrl = (fileKey: string) => {
  if (!fileKey) return "";
  // Check if already a full URL or a proxy URL
  if (fileKey.startsWith('http') || fileKey.startsWith('/api')) {
    return fileKey;
  }
  return `/api/s3-proxy?key=${encodeURIComponent(fileKey)}`;
};
export function MarketingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assets");
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [recentAssets, setRecentAssets] = useState<MarketingAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assetCounts, setAssetCounts] = useState<AssetCounts>({
    total: 0,
    image: 0,
    document: 0,
    video: 0,
    email_template: 0,
    social_post: 0,
    presentation: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent campaigns
        const campaignsResponse = await fetch("/api/marketing/campaigns");
        if (!campaignsResponse.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        const campaignsData = await campaignsResponse.json();
        setRecentCampaigns(campaignsData.slice(0, 5));

        // Fetch recent assets
        const assetsResponse = await fetch("/api/marketing/assets");
        if (!assetsResponse.ok) {
          throw new Error("Failed to fetch assets");
        }
        const assetsData = await assetsResponse.json();
        setRecentAssets(assetsData.slice(0, 8));
        
        // Calculate asset counts
        const counts = {
          total: assetsData.length,
          image: assetsData.filter((a: MarketingAsset) => a.type === "image").length,
          document: assetsData.filter((a: MarketingAsset) => a.type === "document").length,
          video: assetsData.filter((a: MarketingAsset) => a.type === "video").length,
          email_template: assetsData.filter((a: MarketingAsset) => a.type === "email_template").length,
          social_post: assetsData.filter((a: MarketingAsset) => a.type === "social_post").length,
          presentation: assetsData.filter((a: MarketingAsset) => a.type === "presentation").length
        };
        setAssetCounts(counts);
      } catch (error) {
        console.error("Error fetching marketing data:", error);
        toast({
          title: "Error",
          description: "Failed to load marketing data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case "video":
        return <Video className="h-4 w-4 text-red-500" />;
      case "document":
        return <FileText className="h-4 w-4 text-amber-500" />;
      case "email_template":
        return <Mail className="h-4 w-4 text-green-500" />;
      case "social_post":
        return <Instagram className="h-4 w-4 text-purple-500" />;
      case "presentation":
        return <Folder className="h-4 w-4 text-indigo-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleDownload = (asset: MarketingAsset) => {
    // Create a temporary anchor element to trigger download
    const proxyUrl = getProxyUrl(asset.fileUrl);
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = asset.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show toast notification using imported toast function
    showToast.success(`${asset.title} is downloading`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Hub</h1>
          <p className="text-muted-foreground">
            Access and use marketing materials and campaigns
          </p>
        </div>
      </div>

      <Tabs defaultValue="assets" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assets">Marketing Assets</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Email Templates
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : assetCounts.email_template}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Social Media Posts
                </CardTitle>
                <Instagram className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : assetCounts.social_post}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Property Documents
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : assetCounts.document}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Video Content
                </CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : assetCounts.video}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Assets */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Assets</CardTitle>
                <CardDescription>
                  Recently added marketing materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : recentAssets.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No assets found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAssets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-muted rounded-md p-2">
                            {getAssetTypeIcon(asset.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{asset.title}</p>
                            <p className="text-xs text-muted-foreground">{asset.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                          <Link href={getProxyUrl(asset.fileUrl)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(asset)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/marketing/assets">
                          View All Assets
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Marketing Tips */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Marketing Tips</CardTitle>
                <CardDescription>
                  Best practices for using these materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-md p-2 mt-1">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Templates</p>
                      <p className="text-xs text-muted-foreground">
                        Personalize subject lines and opening paragraphs for higher open rates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 rounded-md p-2 mt-1">
                      <Instagram className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Social Media</p>
                      <p className="text-xs text-muted-foreground">
                        Post consistently and use relevant hashtags to increase visibility.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-amber-100 rounded-md p-2 mt-1">
                      <FileText className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Property Documents</p>
                      <p className="text-xs text-muted-foreground">
                        Include high-quality images and detailed property specifications.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-100 rounded-md p-2 mt-1">
                      <Video className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Video Content</p>
                      <p className="text-xs text-muted-foreground">
                        Keep videos under 2 minutes for higher engagement rates.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentCampaigns.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No active campaigns found
              </div>
            ) : (
              recentCampaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <CardDescription>
                      {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'No start date'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {campaign.assets.length} assets
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {campaign.assets.slice(0, 3).map((assetItem) => (
                          <Badge key={assetItem.asset.id} variant="outline" className="text-xs">
                            {assetItem.asset.title.length > 20 
                              ? `${assetItem.asset.title.substring(0, 20)}...` 
                              : assetItem.asset.title}
                          </Badge>
                        ))}
                        {campaign.assets.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{campaign.assets.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="pt-2">
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`/marketing/campaigns?id=${campaign.id}`}>
                            View Campaign
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {!isLoading && recentCampaigns.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/marketing/campaigns">
                  View All Campaigns
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MarketingProtectedWrapper() {
  return (
    <RoleProtected allowedRoles={['member', 'agent', 'contractor', 'admin']}>
      <MarketingPage />
    </RoleProtected>
  );
} 