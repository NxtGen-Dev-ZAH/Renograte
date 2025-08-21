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
// import { useAuth } from "@/hooks/useAuth";
import RoleProtected from "@/components/RoleProtected";
import { FileUploader } from "@/components/FileUploader";
import { useSearchParams } from "next/navigation";

const assetTypes = [
  { value: "email_template", label: "Email Template" },
  { value: "social_post", label: "Social Media Post" },
  { value: "flyer", label: "Property Flyer" },
  { value: "brochure", label: "Brochure" },
  { value: "video", label: "Video" },
];

const assetCategories = [
  { value: "property_marketing", label: "Property Marketing" },
  { value: "brand_assets", label: "Brand Assets" },
  { value: "email_templates", label: "Email Templates" },
  { value: "social_media", label: "Social Media" },
];

interface MarketingAssetFormProps {
  params: {
    assetId: string;
  };
  searchParams: {
    id?: string;
  };
}

export function MarketingAssetForm({
  params,
  searchParams,
}: MarketingAssetFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = params.assetId !== "new";
  const searchParamsHook = useSearchParams();
  const assetId = isEdit
    ? params.assetId
    : searchParamsHook.get("id") || searchParams.id;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    fileUrl: "",
    thumbnail: "",
  });

  // Load asset data if editing
  useEffect(() => {
    if (isEdit && assetId) {
      setIsLoading(true);
      fetch(`/api/marketing/assets?id=${assetId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData(data);
        })
        .catch((error) => {
          console.error("Error loading asset:", error);
          toast({
            title: "Error",
            description: "Failed to load asset data",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isEdit, assetId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/marketing/assets", {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isEdit ? { id: assetId, ...formData } : formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save asset");
      }

      toast({
        title: "Success",
        description: `Marketing asset ${isEdit ? "updated" : "created"} successfully`,
      });

      router.push("/marketing");
    } catch (error) {
      console.error("Error saving asset:", error);
      toast({
        title: "Error",
        description: "Failed to save marketing asset",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    // TODO: Implement file upload to S3 or other storage service
    // For now, we'll just use a placeholder URL
    setFormData({
      ...formData,
      fileUrl: URL.createObjectURL(file),
    });
  };

  const handleThumbnailUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    // TODO: Implement thumbnail upload to S3 or other storage service
    // For now, we'll just use a placeholder URL
    setFormData({
      ...formData,
      thumbnail: URL.createObjectURL(file),
    });
  };

  // Function to get proper display URL for assets
  const getDisplayUrl = (
    url: string,
    assetId: string,
    type: string = "file"
  ) => {
    if (!url) return "";

    // If it's already an API URL, return it as is
    if (url.startsWith("/api/assets/")) {
      return url;
    }

    // If we have an asset ID, return the proxy URL
    if (assetId) {
      return type === "thumbnail"
        ? `/api/assets/${assetId}/thumbnail`
        : `/api/assets/${assetId}`;
    }

    // Otherwise return the original URL
    return url;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit Marketing Asset" : "Create Marketing Asset"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit
            ? "Update the details of an existing marketing asset"
            : "Add a new marketing asset to your library"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
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
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Asset File</Label>
                <FileUploader
                  onUpload={handleFileUpload}
                  accept={formData.type === "video" ? "video/*" : undefined}
                />
                {formData.fileUrl && (
                  <p className="text-sm text-muted-foreground">
                    Current file:{" "}
                    {isEdit
                      ? getDisplayUrl(formData.fileUrl, assetId as string)
                      : formData.fileUrl}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Thumbnail</Label>
                <FileUploader
                  onUpload={handleThumbnailUpload}
                  accept="image/*"
                />
                {formData.thumbnail && (
                  <p className="text-sm text-muted-foreground">
                    Current thumbnail:{" "}
                    {isEdit
                      ? getDisplayUrl(
                          formData.thumbnail,
                          assetId as string,
                          "thumbnail"
                        )
                      : formData.thumbnail}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEdit
                    ? "Update Asset"
                    : "Create Asset"}
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

export default function MarketingAssetFormProtectedWrapper(
  props: MarketingAssetFormProps
) {
  return (
    <RoleProtected allowedRoles={["admin"]}>
      <MarketingAssetForm {...props} />
    </RoleProtected>
  );
}
