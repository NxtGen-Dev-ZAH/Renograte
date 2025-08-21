"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Loader2, Plus } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// Define the form schema with proper types for the refine function
const campaignFormSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    status: z.enum(["draft", "active", "archived"]),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })
  .refine(
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

export default function NewCampaignPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<MarketingAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<MarketingAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);

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
        description:
          "Please select at least one marketing asset for this campaign",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const campaignData = {
        ...data,
        assets: selectedAssets.map((asset, index) => ({
          id: asset.id,
          order: index,
        })),
      };

      const response = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }

      toast({
        title: "Campaign Created",
        description: "Your marketing campaign has been created successfully",
      });

      router.push("/admin/marketing/campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssetSelection = (asset: MarketingAsset) => {
    if (selectedAssets.some((selected) => selected.id === asset.id)) {
      setSelectedAssets(
        selectedAssets.filter((selected) => selected.id !== asset.id)
      );
    } else {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "video":
        return "🎬";
      case "document":
        return "📄";
      case "email_template":
        return "📧";
      case "social_post":
        return "📱";
      default:
        return "📁";
    }
  };

  // Get today's date in ISO format for min date attribute
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().split("T")[0];

  // Get start date for end date validation
  const startDate = form.watch("startDate");
  const startDateISO = startDate ? format(startDate, "yyyy-MM-dd") : todayISO;

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
          <h1 className="text-2xl font-bold">Create New Campaign</h1>
        </div>
        <p className="text-muted-foreground">
          Create a new marketing campaign and associate marketing assets
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter campaign title"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for your marketing campaign
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
                            defaultValue={field.value}
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
                              min={todayISO}
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
                              min={startDateISO}
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
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Campaign"
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
                  <p className="text-muted-foreground">
                    No marketing assets found
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
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
                        selectedAssets.some(
                          (selected) => selected.id === asset.id
                        )
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
                            selectedAssets.some(
                              (selected) => selected.id === asset.id
                            )
                              ? "bg-primary border-primary text-white"
                              : "border-gray-300"
                          )}
                        >
                          {selectedAssets.some(
                            (selected) => selected.id === asset.id
                          ) && (
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
    </div>
  );
}
