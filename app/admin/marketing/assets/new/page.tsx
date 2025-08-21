"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Loader2,
  Upload,
  FileCheck,
  AlertCircle,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUploader } from "@/components/FileUploader";
import { uploadFileToS3 } from "@/lib/s3";
import { useAuth } from "@/hooks/useAuth";

// Define the form schema
const assetFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  type: z.string().min(1, "Please select a type"),
  category: z.string().min(1, "Please select a category"),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

// Asset type options
const assetTypes = [
  { value: "image", label: "Image" },
  { value: "document", label: "Document" },
  { value: "video", label: "Video" },
  { value: "email_template", label: "Email Template" },
  { value: "social_post", label: "Social Media Post" },
  { value: "presentation", label: "Presentation" },
];

// Asset category options
const assetCategories = [
  { value: "Property Marketing", label: "Property Marketing" },
  { value: "Brand Assets", label: "Brand Assets" },
  { value: "Email Templates", label: "Email Templates" },
  { value: "Social Media", label: "Social Media" },
  { value: "Video Content", label: "Video Content" },
  { value: "Presentations", label: "Presentations" },
  { value: "Flyers", label: "Flyers" },
  { value: "Brochures", label: "Brochures" },
];

export default function NewAssetPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Initialize the form
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      category: "",
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

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      setUploadError(null);
    } else {
      setUploadedFile(null);
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (files: File[]) => {
    if (files.length > 0) {
      setThumbnailFile(files[0]);
    } else {
      setThumbnailFile(null);
    }
  };

  // Get file accept string based on selected type
  const getAcceptString = (type: string) => {
    switch (type) {
      case "image":
        return "image/*";
      case "document":
        return ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx";
      case "video":
        return "video/*";
      case "email_template":
        return ".html,.htm";
      case "social_post":
        return "image/*,.mp4";
      case "presentation":
        return ".pdf,.ppt,.pptx";
      default:
        return undefined;
    }
  };

  // Handle form submission
  const onSubmit = async (data: AssetFormValues) => {
    // Validate file upload
    if (!uploadedFile) {
      setUploadError("Please upload a file for this marketing asset");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload the main file to S3
      const filePrefix = `marketing/${data.type}/`;
      const fileKey = await uploadFileToS3(uploadedFile, filePrefix);
      setUploadProgress(75);

      // Upload thumbnail if provided
      let thumbnailKey = null;
      if (thumbnailFile) {
        thumbnailKey = await uploadFileToS3(
          thumbnailFile,
          "marketing/thumbnails/"
        );
      }
      setUploadProgress(90);

      // Create the asset in the database
      // Note: fileUrl should be just the fileKey (S3 path) not a full URL
      // The S3 proxy endpoint will handle creating the proper URL
      const assetData = {
        ...data,
        fileUrl: fileKey,
        thumbnail: thumbnailKey,
      };

      const response = await fetch("/api/marketing/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assetData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 400 && responseData.details) {
          // Handle validation errors
          const validationErrors = responseData.details;
          Object.keys(validationErrors).forEach((field) => {
            form.setError(field as keyof AssetFormValues, {
              type: "server",
              message: validationErrors[field][0],
            });
          });
          throw new Error("Please check the form for errors");
        }
        throw new Error(responseData.error || "Failed to create asset");
      }

      setUploadProgress(100);
      toast({
        title: "Asset Created",
        description: "Your marketing asset has been created successfully",
      });

      router.push("/admin/marketing/assets");
    } catch (error) {
      console.error("Error creating asset:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to create asset"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create asset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Watch the type field to update file accept string
  const selectedType = form.watch("type");
  const acceptString = getAcceptString(selectedType);

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
          <h1 className="text-2xl font-bold">Create New Marketing Asset</h1>
        </div>
        <p className="text-muted-foreground">
          Upload and create a new marketing asset for campaigns
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
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
                        <FormLabel>Asset Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter asset title" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for your marketing asset
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
                            placeholder="Enter asset description"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe the purpose and content of this asset
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {assetTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of marketing asset
                          </FormDescription>
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
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {assetCategories.map((category) => (
                                <SelectItem
                                  key={category.value}
                                  value={category.value}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The category this asset belongs to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <FormLabel>Asset File</FormLabel>
                      <FileUploader
                        onUpload={handleFileUpload}
                        accept={acceptString}
                        maxFiles={1}
                        maxSize={50 * 1024 * 1024} // 50MB
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload the main file for this marketing asset (max 50MB)
                      </p>
                      {uploadError && (
                        <p className="text-sm text-destructive mt-1">
                          {uploadError}
                        </p>
                      )}
                    </div>

                    {(selectedType === "video" ||
                      selectedType === "presentation") && (
                      <div>
                        <FormLabel>Thumbnail Image (Optional)</FormLabel>
                        <FileUploader
                          onUpload={handleThumbnailUpload}
                          accept="image/*"
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024} // 5MB
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a thumbnail image for this {selectedType} (max
                          5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {uploadProgress !== null && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {uploadProgress}% uploaded
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/marketing/assets")}
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
                        "Create Asset"
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
              <CardTitle>Asset Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertTitle>File Requirements</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 text-sm">
                    <li>Images: JPG, PNG, GIF (max 10MB)</li>
                    <li>Documents: PDF, DOC, DOCX, PPT, PPTX (max 20MB)</li>
                    <li>Videos: MP4, MOV, WEBM (max 50MB)</li>
                    <li>Email Templates: HTML (max 2MB)</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Best Practices</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 text-sm">
                    <li>Use descriptive titles for better searchability</li>
                    <li>Include detailed descriptions for context</li>
                    <li>Select the appropriate category for organization</li>
                    <li>Add thumbnails for videos and presentations</li>
                    <li>Use high-quality images for better engagement</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  Assets will be stored securely in Amazon S3 and can be used in
                  marketing campaigns.
                </p>
                <p>
                  Once created, assets can be edited, archived, or deleted from
                  the asset management page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
