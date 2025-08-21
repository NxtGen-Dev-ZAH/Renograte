"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Search,
  FileText,
  Image as ImageIcon,
  Video,
  Mail,
  Instagram,
  Folder,
  Trash2,
  Edit,
  Download,
  ExternalLink,
  Loader2,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
// ... (previous imports and state)

export default function AdminMarketingAssetsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Initialize with 'all' or a default value that represents "All Types"
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // Initialize with 'all' or a default value that represents "All Statuses"
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to get S3 proxy URL
  const getProxyUrl = (fileKey: string) => {
    if (!fileKey) return "";
    // Check if already a full URL or a proxy URL
    if (fileKey.startsWith("http") || fileKey.startsWith("/api")) {
      return fileKey;
    }
    return `/api/s3-proxy?key=${encodeURIComponent(fileKey)}`;
  };

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

  // Parse query params
  useEffect(() => {
    const type = searchParams.get("type");
    // Set to 'all' if type is not present in URL or is an empty string
    setSelectedType(type || "all");

    const category = searchParams.get("category");
    setSelectedCategory(category || ""); // Keep empty for category if no selection

    const status = searchParams.get("status");
    // Set to 'all' if status is not present in URL or is an empty string
    setSelectedStatus(status || "all");
  }, [searchParams]);

  // Fetch assets
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        let url = "/api/marketing/assets";
        const params = new URLSearchParams();

        // Only append if the selectedType is not "all"
        if (selectedType && selectedType !== "all")
          params.append("type", selectedType);
        if (selectedCategory) params.append("category", selectedCategory);
        // Only append if the selectedStatus is not "all"
        if (selectedStatus && selectedStatus !== "all")
          params.append("status", selectedStatus);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch assets");
        }
        const data = await response.json();
        setAssets(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
        toast({
          title: "Error",
          description: "Failed to load marketing assets",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [selectedType, selectedCategory, selectedStatus, toast]);

  // Filter assets based on search query
  const filteredAssets = assets.filter((asset) =>
    asset.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get asset type icon
  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-12 w-12 text-blue-500" />;
      case "video":
        return <Video className="h-12 w-12 text-red-500" />;
      case "document":
        return <FileText className="h-12 w-12 text-amber-500" />;
      case "email_template":
        return <Mail className="h-12 w-12 text-green-500" />;
      case "social_post":
        return <Instagram className="h-12 w-12 text-purple-500" />;
      default:
        return <Folder className="h-12 w-12 text-gray-500" />;
    }
  };

  // Handle asset deletion
  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/marketing/assets/${assetToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete asset");
      }

      toast({
        title: "Asset Deleted",
        description: "The marketing asset has been deleted successfully",
      });

      // Remove the deleted asset from the list
      setAssets(assets.filter((asset) => asset.id !== assetToDelete));
      setAssetToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Error",
        description: "Failed to delete the marketing asset",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle filter updates
  const updateFilters = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // If the value is our "all" indicator, delete the parameter
    if (value === "all") {
      params.delete(type);
    } else {
      params.set(type, value);
    }

    router.push(`/admin/marketing/assets?${params.toString()}`);
  };

  return (
    <div className="p-6 mt-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/admin/marketing"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold">Marketing Assets</h1>
        </div>
        <p className="text-muted-foreground">
          Manage marketing materials for campaigns
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedType}
              onValueChange={(value) => updateFilters("type", value)}
            >
              <SelectTrigger className="min-w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                {/* Display "All Types" if selectedType is "all", otherwise capitalize the selected type */}
                <span>
                  {selectedType === "all"
                    ? "All Types"
                    : selectedType.replace("_", " ")}
                </span>
              </SelectTrigger>
              <SelectContent>
                {/* Change value to "all" */}
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="email_template">Email Template</SelectItem>
                <SelectItem value="social_post">Social Post</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedStatus}
              onValueChange={(value) => updateFilters("status", value)}
            >
              <SelectTrigger className="min-w-[130px]">
                {/* Display "All Statuses" if selectedStatus is "all" */}
                <span>
                  {selectedStatus === "all"
                    ? "All Statuses"
                    : selectedStatus.charAt(0).toUpperCase() +
                      selectedStatus.slice(1)}
                </span>
              </SelectTrigger>
              <SelectContent>
                {/* Add an "all" option for status filter as well */}
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="gap-2"
          onClick={() => router.push("/admin/marketing/assets/new")}
        >
          <Plus className="h-4 w-4" />
          New Asset
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No assets found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Get started by creating your first marketing asset"}
          </p>
          <Button onClick={() => router.push("/admin/marketing/assets/new")}>
            Create New Asset
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {asset.thumbnail ? (
                  <img
                    src={getProxyUrl(asset.thumbnail)}
                    alt={asset.title}
                    className="object-cover w-full h-full"
                  />
                ) : asset.type === "image" ? (
                  <img
                    src={getProxyUrl(asset.fileUrl)}
                    alt={asset.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {getAssetTypeIcon(asset.type)}
                  </div>
                )}
                <Badge
                  className="absolute top-2 right-2 capitalize"
                  variant={asset.type === "image" ? "default" : "outline"}
                >
                  {asset.type.replace("_", " ")}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg truncate">
                  {asset.title}
                </CardTitle>
                <CardDescription>{asset.category}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {asset.description || "No description"}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <Badge
                    variant={
                      asset.status === "active"
                        ? "default"
                        : asset.status === "draft"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {asset.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/marketing/assets/${asset.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={getProxyUrl(asset.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={getProxyUrl(asset.fileUrl)} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setAssetToDelete(asset.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this asset? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAsset}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
