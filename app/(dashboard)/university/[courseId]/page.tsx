"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { Loader2, Play, CheckCircle, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { use } from "react";

interface CourseVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  completed: boolean;
  watchedSeconds: number;
  lastPosition: number;
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
}

export default function CourseDetailsPage(props: {
  params: Promise<{ courseId: string }>;
}) {
  // Use React.use() to unwrap the params Promise in a client component
  const { courseId } = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedVideos, setCompletedVideos] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch course details and progress
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/courses/progress?courseId=${String(courseId)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch course details");
        }

        const data = await response.json();

        if (data.videos && data.videos.length > 0) {
          setCourse({
            id: String(courseId),
            title: data.videos[0].course?.title || "Course",
            description: data.videos[0].course?.description || "",
            category: data.videos[0].course?.category || "",
            thumbnail: data.videos[0].course?.thumbnail || null,
            createdAt: data.videos[0].course?.createdAt || "",
            updatedAt: data.videos[0].course?.updatedAt || "",
            videos: data.videos,
          });

          // Set the first uncompleted video as active, or the first video if all are completed
          const firstUncompletedVideo = data.videos.find(
            (video: CourseVideo) => !video.completed
          );
          setActiveVideo(firstUncompletedVideo || data.videos[0]);

          setOverallProgress(data.overallProgress);
          setCompletedVideos(data.completedVideos);
          setTotalVideos(data.totalVideos);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, toast]);

  // Set up video progress tracking
  useEffect(() => {
    if (!activeVideo || !videoRef.current) return;

    // Set initial position if there's saved progress
    if (activeVideo.lastPosition > 0) {
      videoRef.current.currentTime = activeVideo.lastPosition;
    }

    const handleTimeUpdate = () => {
      if (!videoRef.current) return;
      setCurrentTime(Math.floor(videoRef.current.currentTime));
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    // Update progress every 5 seconds while playing
    const startProgressTracking = () => {
      setIsPlaying(true);
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }

      progressUpdateInterval.current = setInterval(() => {
        if (!videoRef.current || !activeVideo) return;

        try {
          const currentPos = Math.floor(videoRef.current.currentTime);
          const duration = isFinite(videoRef.current.duration)
            ? videoRef.current.duration
            : 0;

          // Skip updates if we don't have valid numbers
          if (
            !isFinite(currentPos) ||
            currentPos < 0 ||
            !isFinite(duration) ||
            duration <= 0
          ) {
            return;
          }

          const watchedSecs = Math.max(
            activeVideo.watchedSeconds || 0,
            currentPos
          );
          const isCompleted = watchedSecs >= duration * 0.9;

          // Update progress in database
          updateVideoProgress(
            activeVideo.id,
            watchedSecs,
            currentPos,
            isCompleted
          );
        } catch (err) {
          console.error("Error in progress tracking:", err);
        }
      }, 5000);
    };

    const stopProgressTracking = () => {
      setIsPlaying(false);
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
        progressUpdateInterval.current = null;
      }

      // Final update when video is paused
      if (videoRef.current && activeVideo) {
        try {
          const currentPos = Math.floor(videoRef.current.currentTime);
          const duration = isFinite(videoRef.current.duration)
            ? videoRef.current.duration
            : 0;

          // Skip updates if we don't have valid numbers
          if (
            !isFinite(currentPos) ||
            currentPos < 0 ||
            !isFinite(duration) ||
            duration <= 0
          ) {
            return;
          }

          const watchedSecs = Math.max(
            activeVideo.watchedSeconds || 0,
            currentPos
          );
          const isCompleted = watchedSecs >= duration * 0.9;

          updateVideoProgress(
            activeVideo.id,
            watchedSecs,
            currentPos,
            isCompleted
          );
        } catch (err) {
          console.error("Error in final progress update:", err);
        }
      }
    };

    const handleVideoEnded = () => {
      if (!videoRef.current || !activeVideo) return;

      try {
        // Mark as completed when ended
        updateVideoProgress(activeVideo.id, activeVideo.duration, 0, true);

        // Auto-play next video if available
        const currentIndex =
          course?.videos.findIndex((v) => v.id === activeVideo.id) || 0;
        if (course && currentIndex < course.videos.length - 1) {
          setActiveVideo(course.videos[currentIndex + 1]);
        }
      } catch (err) {
        console.error("Error handling video end:", err);
      }
    };

    videoElement.addEventListener("play", startProgressTracking);
    videoElement.addEventListener("pause", stopProgressTracking);
    videoElement.addEventListener("ended", handleVideoEnded);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("play", startProgressTracking);
      videoElement.removeEventListener("pause", stopProgressTracking);
      videoElement.removeEventListener("ended", handleVideoEnded);

      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, [activeVideo, course]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, []);

  const updateVideoProgress = async (
    videoId: string,
    watchedSeconds: number,
    lastPosition: number,
    completed: boolean
  ) => {
    try {
      // Validate inputs to ensure we're sending valid data
      if (!videoId || !courseId) {
        console.error("Missing required IDs for progress update");
        return;
      }

      // Ensure we're sending numbers for these values
      const validWatchedSeconds = Math.max(0, Math.floor(watchedSeconds) || 0);
      const validLastPosition = Math.max(0, Math.floor(lastPosition) || 0);

      const response = await fetch("/api/courses/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          courseId: String(courseId),
          watchedSeconds: validWatchedSeconds,
          lastPosition: validLastPosition,
          completed,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update progress: ${errorText}`);
      }

      // If video was marked as completed, update the UI
      if (completed && !activeVideo?.completed) {
        setCompletedVideos((prev) => prev + 1);
        setOverallProgress(
          Math.round(((completedVideos + 1) / totalVideos) * 100)
        );

        // Update the active video in state
        setActiveVideo((prev) => (prev ? { ...prev, completed: true } : null));

        // Update the video in the course list
        setCourse((prev) => {
          if (!prev) return null;

          const updatedVideos = prev.videos.map((video) =>
            video.id === videoId ? { ...video, completed: true } : video
          );

          return { ...prev, videos: updatedVideos };
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update video progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVideoSelect = (video: CourseVideo) => {
    setActiveVideo(video);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatProgress = (current: number, total: number): string => {
    return `${formatDuration(current)} / ${formatDuration(total)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course || !activeVideo) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Course not found</h2>
        <p className="text-muted-foreground mt-2">
          The requested course could not be loaded.
        </p>
        <Button className="mt-4" onClick={() => router.push("/university")}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.push("/university")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-muted-foreground mt-1">{course.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-black relative">
              {activeVideo.videoUrl ? (
                <video
                  ref={videoRef}
                  src={activeVideo.videoUrl}
                  className="w-full h-full"
                  controls
                  playsInline
                  preload="metadata"
                  onCanPlay={(e) => {
                    // Set buffer mode to improve performance
                    const video = e.currentTarget;
                    if (video.buffered.length === 0) return;

                    // Try to preload more of the video
                    try {
                      video.preload = "auto";
                    } catch (err) {
                      console.error("Error setting preload:", err);
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle>{activeVideo.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {activeVideo.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatProgress(currentTime, activeVideo.duration)}
                </div>
                {activeVideo.completed && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Progress</CardTitle>
              <div className="flex justify-between text-sm mt-2">
                <span>
                  {completedVideos} of {totalVideos} completed
                </span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {course.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                      activeVideo.id === video.id
                        ? "bg-secondary"
                        : "hover:bg-secondary/50"
                    }`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      {video.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {index + 1}. {video.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(video.duration)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
