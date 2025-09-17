import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/tasks/[id] - Get a single task by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view tasks' },
        { status: 401 }
      );
    }
    
    // Ensure id exists
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    // Find the task with the given ID
    const task = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if the task belongs to the current user
    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view this task' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update tasks' },
        { status: 401 }
      );
    }
    
    // Ensure id exists
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    // Find the task with the given ID
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if the task belongs to the current user
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this task' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const data = await request.json();
    
    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task updated successfully',
      task: updatedTask 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete tasks' },
        { status: 401 }
      );
    }
    
    // Ensure id exists
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    // Find the task with the given ID
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if the task belongs to the current user
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this task' },
        { status: 403 }
      );
    }
    
    // Delete the task
    await prisma.task.delete({
      where: { id },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 