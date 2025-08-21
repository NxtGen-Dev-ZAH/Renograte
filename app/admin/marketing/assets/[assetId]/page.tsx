"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import React from "react";
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Mail,
  Instagram,
  ExternalLink,
  Download,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { PDFViewer } from "@/components/PDFViewer";

const assetFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["active", "draft", "archived"]),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

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
  updatedAt: string;
}

interface Campaign {
  id: string;
  title: string;
}

interface AssetCampaign {
  id: string;
  campaign: Campaign;
}

interface AssetWithCampaigns extends MarketingAsset {
  campaigns: AssetCampaign[];
}

export default function EditAssetPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = React.use(params);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [asset, setAsset] = useState<AssetWithCampaigns | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize the form
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      status: "active",
    },
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

  // Fetch asset data
  useEffect(() => {
    const fetchAsset = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/marketing/assets/${assetId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch asset");
        }
        const data = await response.json();
        setAsset(data);

        // Set form values
        form.reset({
          title: data.title,
          description: data.description || "",
          category: data.category,
          status: data.status as "active" | "draft" | "archived",
        });
      } catch (error) {
        console.error("Error fetching asset:", error);
        toast({
          title: "Error",
          description: "Failed to load asset data",
          variant: "destructive",
        });
        router.push("/admin/marketing/assets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [assetId, form, router, toast]);

  // Get proxy URL for assets to ensure secure access and proper rendering
  const getProxyUrl = (fileKey: string) => {
    if (!fileKey) return "";
    // Check if already a full URL or a proxy URL
    if (fileKey.startsWith("http") || fileKey.startsWith("/api")) {
      return fileKey;
    }
    return `/api/s3-proxy?key=${encodeURIComponent(fileKey)}`;
  };

  // Get specific preview component based on file type
  const renderPreviewContent = () => {
    if (!asset) return null;

    const proxyUrl = getProxyUrl(asset.fileUrl);

    switch (asset.type) {
      case "image":
        return (
          <img
            src={proxyUrl}
            alt={asset.title}
            className="object-contain w-full h-full"
          />
        );
      case "video":
        return (
          <video controls className="w-full h-full">
            <source src={proxyUrl} />
            Your browser does not support the video tag.
          </video>
        );
      case "document":
        if (asset.fileUrl.toLowerCase().endsWith(".pdf")) {
          return (
            <div className="h-full w-full flex items-center justify-center">
              <PDFViewer url={proxyUrl} fileName={asset.title} />
            </div>
          );
        } else {
          // For non-PDF documents, show download button
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="h-16 w-16 text-amber-500 mb-4" />
              <p className="text-center mb-4">
                This document cannot be previewed directly
              </p>
              <Button asChild>
                <a href={proxyUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </a>
              </Button>
            </div>
          );
        }
      case "email_template":
        return (
          <iframe
            src={proxyUrl}
            className="w-full h-full"
            title={asset.title}
            sandbox="allow-same-origin allow-scripts"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        );
      case "social_post":
        if (asset.fileUrl.toLowerCase().endsWith(".mp4")) {
          return (
            <video controls className="w-full h-full">
              <source src={proxyUrl} />
              Your browser does not support the video tag.
            </video>
          );
        } else {
          return (
            <img
              src={proxyUrl}
              alt={asset.title}
              className="object-contain w-full h-full"
            />
          );
        }
      default:
        return (
          <div className="flex items-center justify-center h-full">
            {getAssetTypeIcon(asset.type || "")}
          </div>
        );
    }
  };

  // Handle form submission
  const onSubmit = async (data: AssetFormValues) => {
    setIsSaving(true);

    try {
      const assetData = {
        id: assetId,
        ...data,
      };

      const response = await fetch(`/api/marketing/assets/${assetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update asset");
      }

      toast({
        title: "Asset Updated",
        description: "Your marketing asset has been updated successfully",
      });

      router.push("/admin/marketing/assets");
    } catch (error) {
      console.error("Error updating asset:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update asset",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAsset = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/marketing/assets/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete asset");
      }

      toast({
        title: "Asset Deleted",
        description: "The marketing asset has been deleted successfully",
      });

      router.push("/admin/marketing/assets");
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Error",
        description: "Failed to delete the marketing asset",
        variant: "destructive",
      });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
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
      case "social_post":
        return <Instagram className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container max-w-5xl py-6 min-h-screen mt-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/admin/marketing/assets")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assets
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Asset Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Asset Preview</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      asset?.status === "active" ? "default" : "secondary"
                    }
                  >
                    {asset?.status}
                  </Badge>
                  <Badge className="capitalize" variant="outline">
                    {asset?.type?.replace("_", " ")}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview based on asset type */}
                <div
                  className={`relative ${asset?.type === "document" ? "min-h-[500px]" : "aspect-video"} bg-muted rounded-lg overflow-hidden`}
                >
                  {renderPreviewContent()}
                </div>

                {/* Asset metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>
                      {asset?.createdAt
                        ? format(new Date(asset.createdAt), "PPP")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>
                      {asset?.updatedAt
                        ? format(new Date(asset.updatedAt), "PPP")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="branding">Branding</SelectItem>
                        <SelectItem value="social_media">
                          Social Media
                        </SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="print">Print</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Asset
                </Button>
                <Button type="submit" className="gap-2" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
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
