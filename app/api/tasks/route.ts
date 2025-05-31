import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// GET /api/tasks - Get all tasks for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view tasks' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    // Pagination
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : 10;
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {
      userId: session.user.id
    };
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    // Count total matching records for pagination
    const total = await prisma.task.count({ where });
    const totalPages = Math.ceil(total / limit);
    
    // Get tasks based on filters with pagination
    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    });
    
    return NextResponse.json({ 
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a task' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const data = await request.json();
    
    // Create the task
    const newTask = await prisma.task.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task created successfully',
      task: newTask 
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 