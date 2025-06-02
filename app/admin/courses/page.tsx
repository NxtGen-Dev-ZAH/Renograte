"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Video, 
  Upload, 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Search,
  Filter,
  Eye,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { uploadFileToS3 } from "@/lib/s3";

const courseCategories = [
  { id: "basics", name: "Real Estate Basics" },
  { id: "renovation", name: "Renovation Strategies" },
  { id: "financing", name: "Financing & Investment" },
  { id: "marketing", name: "Marketing & Sales" },
];

interface CourseVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  videos: CourseVideo[];
  _count: {
    videos: number;
  };
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "basics",
  });
  const [videoFormData, setVideoFormData] = useState({
    title: "",
    description: "",
    order: 1,
    duration: 0,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses");
      
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      
      const data = await response.json();
      setCourses(data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }
      
      const response = await fetch("/api/courses", {
        method: "POST",
        body: formDataToSend,
      });
      
      if (!response.ok) {
        throw new Error("Failed to create course");
      }
      
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      
      setFormData({
        title: "",
        description: "",
        category: "basics",
      });
      setThumbnailFile(null);
      setIsAddingCourse(false);
      fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) return;
    
    try {
      setIsSubmitting(true);
      setUploadProgress(0);
      
      if (!videoFile) {
        toast({
          title: "Error",
          description: "Please select a video file",
          variant: "destructive",
        });
        return;
      }
      
      // Show upload starting toast
      toast({
        title: "Upload starting",
        description: "Beginning video upload. This may take several minutes for large files.",
      });
      
      const formDataToSend = new FormData();
      formDataToSend.append("title", videoFormData.title);
      formDataToSend.append("description", videoFormData.description);
      formDataToSend.append("courseId", selectedCourse.id);
      formDataToSend.append("order", videoFormData.order.toString());
      formDataToSend.append("duration", videoFormData.duration.toString());
      formDataToSend.append("video", videoFile);
      
      // Set longer timeout for large files
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes timeout
      
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 0;
          // Gradually increase progress, but never reach 100% until complete
          if (prev < 90) {
            return prev + (Math.random() * 5);
          }
          return prev;
        });
      }, 1000);
      
      try {
        const response = await fetch("/api/courses/videos", {
          method: "POST",
          body: formDataToSend,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add video");
        }
        
        const data = await response.json();
        
        toast({
          title: "Success",
          description: data.message || "Video added successfully",
        });
        
        setVideoFormData({
          title: "",
          description: "",
          order: selectedCourse.videos.length + 1,
          duration: 0,
        });
        setVideoFile(null);
        setIsAddingVideo(false);
        fetchCourses();
      } catch (fetchError) {
        clearInterval(progressInterval);
        setUploadProgress(null);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          toast({
            title: "Upload timeout",
            description: "The upload took too long and was cancelled. Try with a smaller file or check your connection.",
            variant: "destructive",
          });
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error("Error adding video:", error);
      setUploadProgress(null);
      
      let errorMessage = "Failed to add video. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This will also delete all videos in the course.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/courses?id=${courseId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete course");
      }
      
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/courses/videos?id=${videoId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete video");
      }
      
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      
      fetchCourses();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Invalid file type. Please upload JPG, PNG, WEBP, or GIF images.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (limit to 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        toast({
          title: "Error",
          description: "Image file is too large. Maximum size is 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setThumbnailFile(file);
      
      // Create thumbnail preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Thumbnail selected",
        description: file.name,
      });
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 50MB)
      const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSizeInBytes) {
        toast({
          title: "Error",
          description: "Video file is too large. Maximum size is 50MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Invalid file type. Please upload MP4, WebM, or MOV video files.",
          variant: "destructive",
        });
        return;
      }
      
      setVideoFile(file);
      toast({
        title: "Video selected",
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      });
      
      // Get video duration
      const video = document.createElement("video");
      video.preload = "metadata";
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const durationInSeconds = Math.round(video.duration);
        setVideoFormData(prev => ({
          ...prev,
          duration: durationInSeconds
        }));
        
        // Show duration in toast
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        toast({
          title: "Video duration",
          description: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        });
      };
      
      video.onerror = () => {
        toast({
          title: "Error",
          description: "Could not read video metadata. The file might be corrupted.",
          variant: "destructive",
        });
      };
      
      video.src = URL.createObjectURL(file);
    }
  };

  const triggerThumbnailInput = () => {
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.click();
    }
  };

  const triggerVideoInput = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 mt-16 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Management</h2>
          <p className="text-muted-foreground">
            Create and manage courses for Renograte University
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddingCourse(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {courseCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery || selectedCategory !== "all" 
              ? "Try adjusting your search or filter" 
              : "Create your first course to get started"}
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/4 bg-gray-100 relative">
                  {course.thumbnail ? (
                    <div className="aspect-video w-full h-full relative">
                      <Image
                        src={`/api/s3-proxy?key=${encodeURIComponent(course.thumbnail)}`}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
                      <CardDescription>
                        {courseCategories.find((cat) => cat.id === course.category)?.name || course.category}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setVideoFormData({
                            title: "",
                            description: "",
                            order: course.videos.length + 1,
                            duration: 0,
                          });
                          setIsAddingVideo(true);
                        }}
                      >
                        <Video className="mr-2 h-4 w-4" /> Add Video
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm mb-4">{course.description}</div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Video className="h-3 w-3" /> 
                        {course._count.videos} {course._count.videos === 1 ? "video" : "videos"}
                      </Badge>
                      
                      {course.videos.length > 0 && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTotalDuration(course.videos)}
                        </div>
                      )}
                    </div>
                    
                    {course.videos.length > 0 ? (
                      <Tabs defaultValue="list" className="w-full">
                        <TabsList className="mb-2">
                          <TabsTrigger value="list">List View</TabsTrigger>
                          <TabsTrigger value="table">Table View</TabsTrigger>
                        </TabsList>
                        <TabsContent value="list">
                          <div className="space-y-2">
                            {course.videos
                              .sort((a, b) => a.order - b.order)
                              .map((video) => (
                                <div 
                                  key={video.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                      <Video className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{video.order}. {video.title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDuration(video.duration)}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteVideo(video.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="table">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {course.videos
                                .sort((a, b) => a.order - b.order)
                                .map((video) => (
                                  <TableRow key={video.id}>
                                    <TableCell>{video.order}</TableCell>
                                    <TableCell>{video.title}</TableCell>
                                    <TableCell>
                                      {formatDuration(video.duration)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteVideo(video.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-center py-8 border border-dashed rounded-lg">
                        <Video className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-muted-foreground mt-2">No videos added yet</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            setSelectedCourse(course);
                            setVideoFormData({
                              title: "",
                              description: "",
                              order: 1,
                              duration: 0,
                            });
                            setIsAddingVideo(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add First Video
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Create a new course for Renograte University.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCourseSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    <Button type="button" variant="outline" onClick={triggerThumbnailInput}>
                      <Upload className="mr-2 h-4 w-4" /> Upload Thumbnail
                    </Button>
                    {thumbnailFile && (
                      <span className="text-sm text-muted-foreground">
                        {thumbnailFile.name}
                      </span>
                    )}
                  </div>
                  
                  {thumbnailPreview && (
                    <div className="relative aspect-video w-full max-w-[300px] mx-auto border rounded-md overflow-hidden">
                      <Image 
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddingCourse(false);
                setThumbnailPreview(null);
                setThumbnailFile(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Video Dialog */}
      <Dialog open={isAddingVideo} onOpenChange={(open) => {
        setIsAddingVideo(open);
        if (!open) {
          setUploadProgress(null);
          setVideoFile(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Video to Course</DialogTitle>
            <DialogDescription>
              {selectedCourse && `Adding video to: ${selectedCourse.title}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVideoSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="videoTitle">Video Title</Label>
                <Input
                  id="videoTitle"
                  value={videoFormData.title}
                  onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="videoDescription">Description</Label>
                <Textarea
                  id="videoDescription"
                  rows={4}
                  value={videoFormData.description}
                  onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Order in Course</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={videoFormData.order}
                  onChange={(e) => setVideoFormData({ ...videoFormData, order: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="video">Video File</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={videoInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                  <Button type="button" variant="outline" onClick={triggerVideoInput}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Video
                  </Button>
                  {videoFile && (
                    <span className="text-sm text-muted-foreground">
                      {videoFile.name} ({videoFormData.duration > 0 ? `${Math.floor(videoFormData.duration / 60)}:${(videoFormData.duration % 60).toString().padStart(2, "0")}` : "Processing..."})
                    </span>
                  )}
                </div>
                
                {uploadProgress !== null && (
                  <div className="mt-2">
                    <div className="text-sm flex justify-between mb-1">
                      <span>Upload Progress</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    {uploadProgress === 100 && (
                      <p className="text-sm text-green-600 mt-1 flex items-center">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Upload complete! Processing video...
                      </p>
                    )}
                  </div>
                )}
                
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Video Upload Guidelines:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Maximum file size: 50MB</li>
                      <li>Supported formats: MP4, WebM, MOV</li>
                      <li>Recommended resolution: 720p or 1080p</li>
                      <li>Keep videos concise and focused on a single topic</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddingVideo(false);
                setUploadProgress(null);
                setVideoFile(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !videoFile}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Video
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Helper function to calculate total duration of all videos
function formatTotalDuration(videos: CourseVideo[]): string {
  const totalSeconds = videos.reduce((acc, video) => acc + video.duration, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m total`;
  }
  return `${minutes}m total`;
} 