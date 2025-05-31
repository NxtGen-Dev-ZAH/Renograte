import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/courses/progress - Update user progress for a video
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const data = await request.json();
    
    const { videoId, courseId, watchedSeconds, lastPosition, completed } = data;
    
    // Validate required fields
    if (!videoId || !courseId || watchedSeconds === undefined || lastPosition === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Update or create progress record
    const progress = await prisma.userCourseProgress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      },
      update: {
        watchedSeconds,
        lastPosition,
        completed: completed || false,
        completedAt: completed ? new Date() : null
      },
      create: {
        userId,
        videoId,
        courseId,
        watchedSeconds,
        lastPosition,
        completed: completed || false,
        completedAt: completed ? new Date() : null
      }
    });
    
    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

// GET /api/courses/progress?courseId=xxx - Get user progress for a course
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }
    
    // Get all videos for the course
    const videos = await prisma.courseVideo.findMany({
      where: { courseId },
      orderBy: { order: "asc" }
    });
    
    // Get user progress for these videos
    const progress = await prisma.userCourseProgress.findMany({
      where: {
        userId,
        videoId: { in: videos.map(video => video.id) }
      }
    });
    
    // Calculate overall course progress
    const totalVideos = videos.length;
    const completedVideos = progress.filter(p => p.completed).length;
    const overallProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    
    // Map progress to videos
    const videosWithProgress = videos.map(video => {
      const videoProgress = progress.find(p => p.videoId === video.id);
      
      return {
        ...video,
        completed: videoProgress?.completed || false,
        watchedSeconds: videoProgress?.watchedSeconds || 0,
        lastPosition: videoProgress?.lastPosition || 0
      };
    });
    
    return NextResponse.json({
      videos: videosWithProgress,
      overallProgress,
      completedVideos,
      totalVideos
    });
  } catch (error) {
    console.error("Error retrieving progress:", error);
    return NextResponse.json(
      { error: "Failed to retrieve progress" },
      { status: 500 }
    );
  }
} 