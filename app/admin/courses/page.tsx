"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Video, Upload } from "lucide-react";
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
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
      
      if (!videoFile) {
        toast({
          title: "Error",
          description: "Please select a video file",
          variant: "destructive",
        });
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append("title", videoFormData.title);
      formDataToSend.append("description", videoFormData.description);
      formDataToSend.append("courseId", selectedCourse.id);
      formDataToSend.append("order", videoFormData.order.toString());
      formDataToSend.append("duration", videoFormData.duration.toString());
      formDataToSend.append("video", videoFile);
      
      const response = await fetch("/api/courses/videos", {
        method: "POST",
        body: formDataToSend,
      });
      
      if (!response.ok) {
        throw new Error("Failed to add video");
      }
      
      toast({
        title: "Success",
        description: "Video added successfully",
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
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
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
      setThumbnailFile(file);
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      
      // Get video duration
      const video = document.createElement("video");
      video.preload = "metadata";
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        setVideoFormData(prev => ({
          ...prev,
          duration: Math.round(video.duration)
        }));
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Management</h2>
          <p className="text-muted-foreground">
            Create and manage courses for Renograte University
          </p>
        </div>
        <Button onClick={() => setIsAddingCourse(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No courses found. Create your first course.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
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
                <div className="text-sm text-muted-foreground mb-4">
                  <span className="font-medium">Category:</span>{" "}
                  {courseCategories.find((cat) => cat.id === course.category)?.name || course.category}
                </div>
                <div className="text-sm mb-4">{course.description}</div>
                
                {course.videos.length > 0 ? (
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
                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
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
                ) : (
                  <p className="text-sm text-muted-foreground">No videos added yet.</p>
                )}
              </CardContent>
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
                <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
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
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddingCourse(false)}>
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
      <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
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
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddingVideo(false)}>
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