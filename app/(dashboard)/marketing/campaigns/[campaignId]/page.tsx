"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import RoleProtected from "@/components/RoleProtected";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface MarketingCampaignFormProps {
  params: {
    campaignId: string;
  };
  searchParams: {
    id?: string;
  };
}

interface MarketingAsset {
  id: string;
  title: string;
  type: string;
  category: string;
  thumbnail?: string;
  fileUrl?: string;
}

export function MarketingCampaignForm({ params, searchParams }: MarketingCampaignFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = params.campaignId !== "new";
  const campaignId = isEdit ? params.campaignId : searchParams.id;

  const [isLoading, setIsLoading] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<MarketingAsset[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    startDate: "",
    endDate: "",
    assets: [] as { id: string; order: number }[],
  });

  // Load available assets
  useEffect(() => {
    fetch("/api/marketing/assets")
      .then((res) => res.json())
      .then((data) => {
        setAvailableAssets(data);
      })
      .catch((error) => {
        console.error("Error loading assets:", error);
        toast({
          title: "Error",
          description: "Failed to load marketing assets",
          variant: "destructive",
        });
      });
  }, []);

  // Load campaign data if editing
  useEffect(() => {
    if (isEdit && campaignId) {
      setIsLoading(true);
      fetch(`/api/marketing/campaigns?id=${campaignId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            ...data,
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            assets: data.assets.map((asset: any) => ({
              id: asset.assetId,
              order: asset.order,
            })),
          });
        })
        .catch((error) => {
          console.error("Error loading campaign:", error);
          toast({
            title: "Error",
            description: "Failed to load campaign data",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isEdit, campaignId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/marketing/campaigns", {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isEdit ? { id: campaignId, ...formData } : formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save campaign");
      }

      toast({
        title: "Success",
        description: `Campaign ${isEdit ? "updated" : "created"} successfully`,
      });

      router.push("/marketing");
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast({
        title: "Error",
        description: "Failed to save campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAsset = (assetId: string) => {
    setFormData({
      ...formData,
      assets: [
        ...formData.assets,
        { id: assetId, order: formData.assets.length },
      ],
    });
  };

  const handleRemoveAsset = (assetId: string) => {
    setFormData({
      ...formData,
      assets: formData.assets
        .filter((asset) => asset.id !== assetId)
        .map((asset, index) => ({ ...asset, order: index })),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit Campaign" : "Create Campaign"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit
            ? "Update the details of an existing marketing campaign"
            : "Create a new marketing campaign"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2 flex-1">
                  <Label>Start Date</Label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.startDate ? new Date(formData.startDate) : undefined}
                      onSelect={(date: Date | undefined) => 
                        setFormData({
                          ...formData,
                          startDate: date ? date.toISOString() : ""
                        })
                      }
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                  </div>
                </div>

                <div className="grid gap-2 flex-1">
                  <Label>End Date</Label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.endDate ? new Date(formData.endDate) : undefined}
                      onSelect={(date: Date | undefined) => 
                        setFormData({
                          ...formData,
                          endDate: date ? date.toISOString() : ""
                        })
                      }
                      min={formData.startDate ? format(new Date(formData.startDate), "yyyy-MM-dd") : ""}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Campaign Assets</Label>
                <div className="grid gap-4">
                  {/* Selected Assets */}
                  <div className="space-y-2">
                    {formData.assets.map((asset) => {
                      const assetData = availableAssets.find((a) => a.id === asset.id);
                      return assetData ? (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            {assetData.thumbnail && (
                              <img
                                src={assetData.thumbnail}
                                alt={assetData.title}
                                className="w-8 h-8 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{assetData.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {assetData.type}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAsset(asset.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>

                  {/* Add Asset */}
                  <div>
                    <Select
                      onValueChange={handleAddAsset}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add asset to campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAssets
                          .filter(
                            (asset) =>
                              !formData.assets.some((a) => a.id === asset.id)
                          )
                          .map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEdit ? "Update Campaign" : "Create Campaign"}</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/marketing")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarketingCampaignFormProtectedWrapper(props: MarketingCampaignFormProps) {
  return (
    <RoleProtected allowedRoles={['admin']}>
      <MarketingCampaignForm {...props} />
    </RoleProtected>
  );
} 