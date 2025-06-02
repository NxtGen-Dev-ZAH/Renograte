import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';

// GET /api/courses - Get all courses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    
    // Build query filters
    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }
    
    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        videos: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            duration: true,
            order: true
          }
        },
        _count: {
          select: { videos: true }
        }
      }
    });

    // If user is not admin, include progress information
    if (session.user.role !== "admin") {
      const userId = session.user.id;
      
      // Get user progress for all videos in these courses
      const userProgress = await prisma.userCourseProgress.findMany({
        where: {
          userId,
          courseId: { in: courses.map((course: any) => course.id) }
        }
      });
      
      // Calculate progress for each course
      const coursesWithProgress = courses.map((course: any) => {
        const courseVideos = course.videos || [];
        const totalVideos = courseVideos.length;
        
        if (totalVideos === 0) return { ...course, progress: 0 };
        
        const completedVideos = userProgress.filter(
          (progress: any) => progress.courseId === course.id && progress.completed
        ).length;
        
        const progressPercentage = Math.round((completedVideos / totalVideos) * 100);
        
        return {
          ...course,
          progress: progressPercentage
        };
      });
      
      return NextResponse.json({ courses: coursesWithProgress });
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Error retrieving courses:", error);
    return NextResponse.json(
      { error: "Failed to retrieve courses" },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course (admin only)
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
    const category = formData.get('category') as string;
    const thumbnail = formData.get('thumbnail') as File | null;
    
    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Upload thumbnail to S3 if provided
    let thumbnailUrl = null;
    if (thumbnail) {
      try {
        thumbnailUrl = await uploadFileToS3(thumbnail, 'courses/thumbnails/');
        console.log(`Thumbnail uploaded successfully: ${thumbnailUrl}`);
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
        return NextResponse.json(
          { error: "Failed to upload thumbnail" },
          { status: 500 }
        );
      }
    }
    
    // Create course in database
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        thumbnail: thumbnailUrl,
      }
    });
    
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses?id=xxx - Delete a course (admin only)
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
        { error: "Course ID is required" },
        { status: 400 }
      );
    }
    
    // Delete course and related videos (cascade delete will handle this)
    await prisma.course.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
} 