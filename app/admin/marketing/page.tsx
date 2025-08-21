"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BarChart3,
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
  Megaphone,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

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
}

export default function AdminMarketingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [recentAssets, setRecentAssets] = useState<MarketingAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assetCounts, setAssetCounts] = useState({
    total: 0,
    image: 0,
    document: 0,
    video: 0,
    email_template: 0,
  });
  const [campaignCounts, setCampaignCounts] = useState({
    total: 0,
    active: 0,
    draft: 0,
    archived: 0,
  });

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

        // Calculate campaign counts
        const counts = {
          total: campaignsData.length,
          active: campaignsData.filter((c: Campaign) => c.status === "active")
            .length,
          draft: campaignsData.filter((c: Campaign) => c.status === "draft")
            .length,
          archived: campaignsData.filter(
            (c: Campaign) => c.status === "archived"
          ).length,
        };
        setCampaignCounts(counts);

        // Fetch recent assets
        const assetsResponse = await fetch("/api/marketing/assets");
        if (!assetsResponse.ok) {
          throw new Error("Failed to fetch assets");
        }
        const assetsData = await assetsResponse.json();
        setRecentAssets(assetsData.slice(0, 8));

        // Calculate asset counts
        const assetCounts = {
          total: assetsData.length,
          image: assetsData.filter((a: MarketingAsset) => a.type === "image")
            .length,
          document: assetsData.filter(
            (a: MarketingAsset) => a.type === "document"
          ).length,
          video: assetsData.filter((a: MarketingAsset) => a.type === "video")
            .length,
          email_template: assetsData.filter(
            (a: MarketingAsset) => a.type === "email_template"
          ).length,
        };
        setAssetCounts(assetCounts);
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

  return (
    <div className="p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">Marketing Management</h1>
          </div>
          <p className="text-muted-foreground">
            Create and manage marketing campaigns and assets for users
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/marketing/assets/new">
              <Plus className="mr-2 h-4 w-4" />
              New Asset
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/marketing/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4 flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="font-medium">Admin-Only Area</h3>
            <p className="text-sm text-muted-foreground">
              Only administrators can create and manage marketing materials.
              Users can view and use these materials from their dashboard.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs
        defaultValue="overview"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Campaigns
                </CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : campaignCounts.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {campaignCounts.active} active campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Marketing Assets
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : assetCounts.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across{" "}
                  {
                    Object.keys(assetCounts).filter(
                      (k) =>
                        k !== "total" &&
                        assetCounts[k as keyof typeof assetCounts] > 0
                    ).length
                  }{" "}
                  categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Draft Campaigns
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : campaignCounts.draft}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting publication
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Archived Items
                </CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : campaignCounts.archived}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  No longer active
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>
                  Recently created marketing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : recentCampaigns.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No campaigns found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between border-b pb-3"
                      >
                        <div>
                          <p className="font-medium">{campaign.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(campaign.status)}
                            <span className="text-xs text-muted-foreground">
                              {campaign.assets.length} assets
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/admin/marketing/campaigns/${campaign.id}`}
                          >
                            Edit
                          </Link>
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href="/admin/marketing/campaigns">
                        View All Campaigns
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
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
                      <div
                        key={asset.id}
                        className="flex items-center justify-between border-b pb-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-muted rounded-md p-2">
                            {getAssetTypeIcon(asset.type)}
                          </div>
                          <div>
                            <p className="font-medium">{asset.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {asset.category}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/marketing/assets/${asset.id}`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href="/admin/marketing/assets">
                        View All Assets
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Marketing Dashboard</CardTitle>
              <CardDescription>Overview of marketing activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t pt-4 px-6 pb-6">
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Detailed analytics dashboard is under development.
                    <br />
                    Check back soon for insights on campaign performance and
                    asset usage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Campaign management content */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Campaign Management</h2>
              <p className="text-muted-foreground">
                Create and manage marketing campaigns
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/marketing/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <Badge className="bg-green-500">
                    {campaignCounts.active}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/admin/marketing/campaigns?status=active">
                    View Active
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-sm font-medium">Draft</CardTitle>
                  <Badge variant="outline">{campaignCounts.draft}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/admin/marketing/campaigns?status=draft">
                    View Drafts
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-sm font-medium">
                    Archived
                  </CardTitle>
                  <Badge variant="secondary">{campaignCounts.archived}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/admin/marketing/campaigns?status=archived">
                    View Archived
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>
                Recently created marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentCampaigns.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No campaigns found
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left text-sm font-medium">
                          Campaign
                        </th>
                        <th className="p-3 text-left text-sm font-medium">
                          Status
                        </th>
                        <th className="p-3 text-left text-sm font-medium">
                          Assets
                        </th>
                        <th className="p-3 text-right text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b">
                          <td className="p-3">
                            <div className="font-medium">{campaign.title}</div>
                            {campaign.startDate && (
                              <div className="text-xs text-muted-foreground">
                                Starts:{" "}
                                {new Date(
                                  campaign.startDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            {getStatusBadge(campaign.status)}
                          </td>
                          <td className="p-3">
                            {campaign.assets.length} assets
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/marketing/campaigns/${campaign.id}`}
                              >
                                Edit
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          {/* Asset management content */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Asset Management</h2>
              <p className="text-muted-foreground">
                Create and manage marketing assets
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/marketing/assets/new">
                <Plus className="mr-2 h-4 w-4" />
                New Asset
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Images</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : assetCounts.image}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-1"
                  asChild
                >
                  <Link href="/admin/marketing/assets?type=image">
                    View all
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : assetCounts.document}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-1"
                  asChild
                >
                  <Link href="/admin/marketing/assets?type=document">
                    View all
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Videos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : assetCounts.video}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-1"
                  asChild
                >
                  <Link href="/admin/marketing/assets?type=video">
                    View all
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Email Templates
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : assetCounts.email_template}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-1"
                  asChild
                >
                  <Link href="/admin/marketing/assets?type=email_template">
                    View all
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
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
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left text-sm font-medium">
                          Asset
                        </th>
                        <th className="p-3 text-left text-sm font-medium">
                          Type
                        </th>
                        <th className="p-3 text-left text-sm font-medium">
                          Category
                        </th>
                        <th className="p-3 text-right text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAssets.map((asset) => (
                        <tr key={asset.id} className="border-b">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-muted rounded-md p-2">
                                {getAssetTypeIcon(asset.type)}
                              </div>
                              <div className="font-medium">{asset.title}</div>
                            </div>
                          </td>
                          <td className="p-3 capitalize">
                            {asset.type.replace("_", " ")}
                          </td>
                          <td className="p-3">{asset.category}</td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/marketing/assets/${asset.id}`}
                              >
                                Edit
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Asset Usage</CardTitle>
                <CardDescription>Most used marketing assets</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <BarChart3 className="h-[180px] w-full text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  Engagement metrics for active campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChart className="h-[180px] w-full text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>
                  Member activity with marketing materials
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Users className="h-[180px] w-full text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed marketing performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                Detailed marketing analytics will be available soon.
                <br />
                Check back for insights on campaign performance and asset usage.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
