"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import RoleProtected from "@/components/RoleProtected";
import { 
  Download,
  Edit,
  ExternalLink,
  FileIcon,
  FileText,
  Filter,
  Grid3X3,
  Image as ImageIcon,
  LayoutList,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Video
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MarketingAsset {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  fileUrl: string;
  thumbnail?: string;
  status: string;
  createdAt: string;
}

export function MarketingAssetsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  // Helper to get S3 proxy URL
  const getProxyUrl = (fileKey: string) => {
    if (!fileKey) return "";
    // Check if already a full URL or a proxy URL
    if (fileKey.startsWith('http') || fileKey.startsWith('/api')) {
      return fileKey;
    }
    return `/api/s3-proxy?key=${encodeURIComponent(fileKey)}`;
  };

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      let url = "/api/marketing/assets";
      const params = new URLSearchParams();
      
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }
      
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load marketing assets");
      }
      
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error("Error loading marketing assets:", error);
      toast({
        title: "Error",
        description: "Failed to load marketing assets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [typeFilter, categoryFilter]);

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;
    
    try {
      const response = await fetch(`/api/marketing/assets?id=${assetToDelete}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete asset");
      }
      
      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
      
      // Reload assets
      loadAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setAssetToDelete(id);
    setDeleteDialogOpen(true);
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

  // Get unique categories and types for filters
  const categories = [...new Set(assets.map(asset => asset.category))];
  const types = [...new Set(assets.map(asset => asset.type))];

  const filteredAssets = assets.filter(asset => 
    asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Assets</h1>
          <p className="text-muted-foreground">
            Browse and manage marketing materials
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Marketing Materials</CardTitle>
              <CardDescription>
                Access and download marketing assets
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Loading assets...</p>
              </div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No marketing assets found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map(asset => (
                <Card key={asset.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    {asset.thumbnail ? (
                      <Image
                        src={getProxyUrl(asset.thumbnail)}
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
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium mb-1">{asset.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(asset)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={getProxyUrl(asset.fileUrl)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {asset.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {asset.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline">{asset.category}</Badge>
                      <Badge>{asset.type.replace('_', ' ')}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Asset</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} className="border-b">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            {asset.thumbnail ? (
                              <Image
                                src={getProxyUrl(asset.thumbnail)}
                                alt={asset.title}
                                width={40}
                                height={40}
                                className="object-cover rounded"
                              />
                            ) : (
                              getAssetIcon(asset.type)
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{asset.title}</div>
                            {asset.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {asset.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge>{asset.type.replace('_', ' ')}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{asset.category}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
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
                            <Link href={getProxyUrl(asset.fileUrl)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredAssets.length} of {assets.length} assets
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAsset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function MarketingAssetsProtectedWrapper() {
  return (
    <RoleProtected allowedRoles={["member", "agent", "contractor", "admin"]}>
      <MarketingAssetsPage />
    </RoleProtected>
  );
} 