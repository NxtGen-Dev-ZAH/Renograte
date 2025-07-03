"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import React from "react";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
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
import { DatePicker } from "@/components/ui/date-picker";
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ImageIcon, Video, FileText, Mail } from "lucide-react";

// Define the form schema with proper types for the refine function
const campaignFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine(
  (data) => {
    if (!data.endDate || !data.startDate) return true;
    return data.endDate > data.startDate;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface MarketingAsset {
  id: string;
  title: string;
  type: string;
  category: string;
  thumbnail?: string;
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
  assets: CampaignAsset[];
}

export default function EditCampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = React.use(params);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [availableAssets, setAvailableAssets] = useState<MarketingAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<MarketingAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize the form
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "draft",
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

        // Set form values
        form.reset({
          title: data.title,
          description: data.description || "",
          status: data.status as "draft" | "active" | "archived",
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        });

        // Set selected assets
        if (data.assets && data.assets.length > 0) {
          setSelectedAssets(data.assets.map((item: CampaignAsset) => item.asset));
        }
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
  }, [campaignId, form, router, toast]);

  // Fetch available marketing assets
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoadingAssets(true);
      try {
        const response = await fetch("/api/marketing/assets");
        if (!response.ok) {
          throw new Error("Failed to fetch marketing assets");
        }
        const assets = await response.json();
        setAvailableAssets(assets);
      } catch (error) {
        console.error("Error fetching assets:", error);
        toast({
          title: "Error",
          description: "Failed to load marketing assets",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [toast]);

  // Handle form submission
  const onSubmit = async (data: CampaignFormValues) => {
    if (selectedAssets.length === 0) {
      toast({
        title: "No Assets Selected",
        description: "Please select at least one marketing asset for this campaign",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Format dates properly for API
      const formattedData = {
        ...data,
        startDate: data.startDate ? data.startDate.toISOString() : null,
        endDate: data.endDate ? data.endDate.toISOString() : null,
      };

      const campaignData = {
        id: campaignId,
        ...formattedData,
        assets: selectedAssets.map((asset, index) => ({
          id: asset.id,
          order: index,
        })),
      };

      const response = await fetch(`/api/marketing/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update campaign");
      }

      toast({
        title: "Campaign Updated",
        description: "Your marketing campaign has been updated successfully",
      });
      
      router.push("/admin/marketing/campaigns");
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update campaign",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle asset selection
  const toggleAssetSelection = (asset: MarketingAsset) => {
    const isSelected = selectedAssets.some((selected) => selected.id === asset.id);
    if (isSelected) {
      setSelectedAssets(selectedAssets.filter((selected) => selected.id !== asset.id));
    } else {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  // Get asset type icon
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

  // Handle delete campaign
  const handleDeleteCampaign = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/marketing/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }

      toast({
        title: "Campaign Deleted",
        description: "The marketing campaign has been deleted successfully",
      });
      
      router.push("/admin/marketing/campaigns");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete the campaign",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  return (
    <div className="container max-w-5xl py-6 min-h-screen mt-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/admin/marketing/campaigns")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Edit Campaign</CardTitle>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Campaign title" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give your campaign a clear, descriptive name
                          </FormDescription>
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
                            <Textarea
                              placeholder="Enter campaign description"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Describe the purpose and goals of this campaign
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Set the current status of this campaign
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <DatePicker
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-0"
                              />
                            </FormControl>
                            <FormDescription>
                              When the campaign will start
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <DatePicker
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-0"
                              />
                            </FormControl>
                            <FormDescription>
                              When the campaign will end (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/marketing/campaigns")}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Select Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Select marketing assets to include in this campaign
                  </p>
                  <Badge variant="outline" className="mb-2">
                    {selectedAssets.length} assets selected
                  </Badge>
                </div>

                {isLoadingAssets ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : availableAssets.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">No marketing assets found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      asChild
                    >
                      <Link href="/admin/marketing/assets/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Asset
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {availableAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className={cn(
                          "flex items-center p-2 border rounded-md cursor-pointer transition-colors",
                          selectedAssets.some((selected) => selected.id === asset.id)
                            ? "border-primary bg-primary/5"
                            : "hover:border-gray-400"
                        )}
                        onClick={() => toggleAssetSelection(asset)}
                      >
                        <div className="mr-3 text-lg">
                          {getAssetTypeIcon(asset.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{asset.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {asset.type.replace("_", " ")} • {asset.category}
                          </p>
                        </div>
                        <div className="ml-2">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center",
                              selectedAssets.some((selected) => selected.id === asset.id)
                                ? "bg-primary border-primary text-white"
                                : "border-gray-300"
                            )}
                          >
                            {selectedAssets.some((selected) => selected.id === asset.id) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
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
              onClick={handleDeleteCampaign}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Campaign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 