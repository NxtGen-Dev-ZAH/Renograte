 import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/agreements/[id] - Get a single agreement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first
    const { id } = await params;
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view agreements" },
        { status: 401 }
      );
    }
    
    // Find the agreement by ID
    const agreement = await prisma.agreement.findUnique({
      where: { id },
    });
    
    // Check if the agreement exists
    if (!agreement) {
      return NextResponse.json(
        { error: "Agreement not found" },
        { status: 404 }
      );
    }
    
    // Check if the user has permission to view this agreement
    if (agreement.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have permission to view this agreement" },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ agreement });
    
  } catch (error: any) {
    console.error("Error retrieving agreement:", error);
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to retrieve agreement",
      error: error.message,
    }, { status: 500 });
  }
}

// PATCH /api/agreements/[id] - Update an agreement by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first
    const { id } = await params;
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update agreements" },
        { status: 401 }
      );
    }
    const body = await request.json();
    
    // Find the agreement by ID
    const existingAgreement = await prisma.agreement.findUnique({
      where: { id },
    });
    
    // Check if the agreement exists
    if (!existingAgreement) {
      return NextResponse.json(
        { error: "Agreement not found" },
        { status: 404 }
      );
    }
    
    // Check if the user has permission to update this agreement
    if (existingAgreement.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have permission to update this agreement" },
        { status: 403 }
      );
    }
    
    // Only allow updating certain fields based on user role
    const updateData: any = {};
    
    // Regular users can only update the data field
    if (body.data) {
      updateData.data = body.data;
    }
    
    // Admins can update status and provide feedback
    if (session.user.role === "admin") {
      if (body.status) {
        updateData.status = body.status;
      }
      
      if (body.adminFeedback) {
        updateData.adminFeedback = body.adminFeedback;
        updateData.reviewedBy = session.user.name || session.user.email;
        updateData.reviewedAt = new Date();
      }
    }
    
    // Update the agreement
    const updatedAgreement = await prisma.agreement.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      message: "Agreement updated successfully",
      agreement: updatedAgreement,
    });
    
  } catch (error: any) {
    console.error("Error updating agreement:", error);
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update agreement",
      error: error.message,
    }, { status: 500 });
  }
}

// DELETE /api/agreements/[id] - Delete an agreement by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first
    const { id } = await params;
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete agreements" },
        { status: 401 }
      );
    }
    
    // Find the agreement by ID
    const existingAgreement = await prisma.agreement.findUnique({
      where: { id },
    });
    
    // Check if the agreement exists
    if (!existingAgreement) {
      return NextResponse.json(
        { error: "Agreement not found" },
        { status: 404 }
      );
    }
    
    // Check if the user has permission to delete this agreement
    // Only admins or the owner can delete
    if (existingAgreement.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have permission to delete this agreement" },
        { status: 403 }
      );
    }
    
    // Delete the agreement
    await prisma.agreement.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Agreement deleted successfully",
    });
    
  } catch (error: any) {
    console.error("Error deleting agreement:", error);
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to delete agreement",
      error: error.message,
    }, { status: 500 });
  }
} 