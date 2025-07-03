"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import RoleProtected from "@/components/RoleProtected";
import { 
  ArrowLeft,
  Calendar,
  Download,
  Edit,
  ExternalLink,
  FileIcon,
  FileText,
  Image as ImageIcon,
  Video,
  Mail,
  Share2
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

interface CampaignViewProps {
  searchParams: {
    id?: string;
  };
}

interface MarketingAsset {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  fileUrl: string;
  thumbnail?: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  assets: {
    asset: MarketingAsset;
    order: number;
  }[];
}

export function CampaignViewPage({ searchParams }: CampaignViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const searchParamsHook = useSearchParams();
  const campaignId = searchParamsHook.get("id") || searchParams.id;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) {
      router.push("/marketing/campaigns");
      return;
    }

    const loadCampaign = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/marketing/campaigns?id=${campaignId}`);
        if (!response.ok) {
          throw new Error("Failed to load campaign");
        }
        
        const data = await response.json();
        setCampaign(data);
      } catch (error) {
        console.error("Error loading campaign:", error);
        toast({
          title: "Error",
          description: "Failed to load campaign details",
          variant: "destructive",
        });
        router.push("/marketing/campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
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

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-6 w-6 text-blue-500" />;
      case "video":
        return <Video className="h-6 w-6 text-red-500" />;
      case "document":
        return <FileText className="h-6 w-6 text-amber-500" />;
      case "email_template":
        return <Mail className="h-6 w-6 text-green-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  // Function to get proper S3 proxy URL for assets
  const getProxyUrl = (asset: MarketingAsset) => {
    if (!asset.fileUrl) return "";
    // Check if already a full URL or a proxy URL
    if (asset.fileUrl.startsWith('http') || asset.fileUrl.startsWith('/api')) {
      return asset.fileUrl;
    }
    return `/api/s3-proxy?key=${encodeURIComponent(asset.fileUrl)}`;
  };

  const handleDownload = (asset: MarketingAsset) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = getProxyUrl(asset);
    link.download = asset.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/marketing/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Campaign not found</p>
            <Button asChild className="mt-4">
              <Link href="/marketing/campaigns">
                View All Campaigns
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/marketing/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Link>
          </Button>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href={`/marketing/campaigns/edit?id=${campaign.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Campaign
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                <CardDescription className="mt-2">
                  {campaign.description}
                </CardDescription>
              </div>
              <div>{getStatusBadge(campaign.status)}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Campaign Period</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {campaign.startDate ? (
                    <span>
                      {format(new Date(campaign.startDate), "MMM d, yyyy")}
                      {campaign.endDate && (
                        <> - {format(new Date(campaign.endDate), "MMM d, yyyy")}</>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not scheduled</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Created</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{format(new Date(campaign.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Assets</CardTitle>
            <CardDescription>
              Marketing materials included in this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaign.assets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No assets in this campaign</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaign.assets
                  .sort((a, b) => a.order - b.order)
                  .map(({ asset }) => (
                    <Card key={asset.id} className="overflow-hidden">
                      <div className="aspect-video relative bg-muted">
                        {asset.thumbnail ? (
                          <Image
                            src={asset.thumbnail.startsWith('/api') ? asset.thumbnail : getProxyUrl({...asset, fileUrl: asset.thumbnail})}
                            alt={asset.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {getAssetIcon(asset.type)}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-1 flex items-center">
                          {getAssetIcon(asset.type)}
                          <span className="ml-2">{asset.title}</span>
                        </h3>
                        {asset.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {asset.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{asset.category}</Badge>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownload(asset)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              asChild
                            >
                              <Link href={getProxyUrl(asset)} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              {campaign.assets.length} assets in this campaign
            </div>
            <Button size="sm" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Campaign
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function CampaignViewProtectedWrapper(props: CampaignViewProps) {
  return (
    <RoleProtected allowedRoles={["admin", "member", "agent"]}>
      <CampaignViewPage {...props} />
    </RoleProtected>
  );
} 