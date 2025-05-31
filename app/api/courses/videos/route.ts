import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3, getSignedFileUrl } from '@/lib/s3';

// GET /api/courses/videos?courseId=xxx - Get all videos for a course
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
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
      orderBy: { order: "asc" },
    });
    
    // If user is not admin, include progress information
    if (session.user.role !== "admin") {
      const userId = session.user.id;
      
      // Get user progress for these videos
      const userProgress = await prisma.userCourseProgress.findMany({
        where: {
          userId,
          videoId: { in: videos.map(video => video.id) }
        }
      });
      
      // Map progress to videos
      const videosWithProgress = await Promise.all(videos.map(async (video) => {
        const progress = userProgress.find(p => p.videoId === video.id);
        
        // Get signed URL for video
        let videoUrl;
        try {
          videoUrl = await getSignedFileUrl(video.videoUrl);
        } catch (error) {
          console.error(`Error getting signed URL for video ${video.id}:`, error);
          videoUrl = null;
        }
        
        return {
          ...video,
          videoUrl,
          completed: progress?.completed || false,
          watchedSeconds: progress?.watchedSeconds || 0,
          lastPosition: progress?.lastPosition || 0
        };
      }));
      
      return NextResponse.json({ videos: videosWithProgress });
    }

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error retrieving videos:", error);
    return NextResponse.json(
      { error: "Failed to retrieve videos" },
      { status: 500 }
    );
  }
}

// POST /api/courses/videos - Add a video to a course (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const courseId = formData.get('courseId') as string;
    const order = parseInt(formData.get('order') as string);
    const duration = parseInt(formData.get('duration') as string);
    const videoFile = formData.get('video') as File | null;
    
    // Validate required fields
    if (!title || !description || !courseId || isNaN(order) || isNaN(duration) || !videoFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Upload video to S3
    let videoUrl;
    try {
      videoUrl = await uploadFileToS3(videoFile, 'courses/videos/');
    } catch (error) {
      console.error("Error uploading video:", error);
      return NextResponse.json(
        { error: "Failed to upload video" },
        { status: 500 }
      );
    }
    
    // Create video in database
    const video = await prisma.courseVideo.create({
      data: {
        title,
        description,
        courseId,
        order,
        duration,
        videoUrl,
      }
    });
    
    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/videos?id=xxx - Delete a video (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }
    
    // Delete video
    await prisma.courseVideo.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
} 