"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Play, BookOpen, Clock, Award, Loader2 } from "lucide-react";
import Image from "next/image";

const courseCategories = [
  { id: "basics", name: "Real Estate Basics" },
  { id: "renovation", name: "Renovation Strategies" },
  { id: "financing", name: "Financing & Investment" },
  { id: "marketing", name: "Marketing & Sales" },
];

interface CourseVideo {
  id: string;
  title: string;
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
  progress?: number;
}

export default function UniversityPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalHours: 0,
    completedCourses: 0,
    overallProgress: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/courses${selectedCategory !== "all" ? `?category=${selectedCategory}` : ""}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data.courses);

        // Calculate stats
        const totalCourses = data.courses.length;
        let totalMinutes = 0;
        let completedCourses = 0;
        let totalProgress = 0;

        data.courses.forEach((course: Course) => {
          // Calculate total duration in minutes
          course.videos.forEach((video: CourseVideo) => {
            totalMinutes += Math.ceil(video.duration / 60);
          });

          // Count completed courses (100% progress)
          if (course.progress === 100) {
            completedCourses++;
          }

          // Add to total progress
          totalProgress += course.progress || 0;
        });

        const overallProgress =
          totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

        setStats({
          totalCourses,
          totalHours: Math.ceil(totalMinutes / 60),
          completedCourses,
          overallProgress,
        });
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCategory]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCourseClick = (courseId: string) => {
    router.push(`/university/${courseId}`);
  };

  const formatDuration = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Renograte University
        </h2>
        <p className="text-muted-foreground">
          Learn everything about real estate investment and renovation
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hours of Content
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <Progress value={stats.overallProgress} className="w-[60px]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
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

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No courses found. Try adjusting your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {filteredCourses.map((course) => {
            const totalMinutes = course.videos.reduce(
              (acc, video) => acc + Math.ceil(video.duration / 60),
              0
            );
            const duration = formatDuration(totalMinutes);

            return (
              <Card
                key={course.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="aspect-video bg-gray-100 relative">
                  {course.thumbnail ? (
                    <Image
                      src={`/api/s3-proxy?key=${encodeURIComponent(course.thumbnail)}`}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Play className="absolute inset-0 m-auto h-8 w-8 text-gray-400" />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription>
                    {courseCategories.find((cat) => cat.id === course.category)
                      ?.name || course.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span>{course._count.videos} lessons</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <Progress value={course.progress || 0} />
                    </div>
                    <Button className="w-full">
                      {course.progress && course.progress > 0
                        ? "Continue Learning"
                        : "Start Course"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
