import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API endpoint to force a session refresh
 * This is useful when user data (like role) has been updated 
 * and we need to make sure the session reflects these changes
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // The session update will be triggered by the next client-side request
    // due to our modified JWT callback in [...nextauth]/route.ts
    
    return NextResponse.json({ 
      success: true, 
      message: "Session refresh requested",
      userId: session.user.id,
      role: session.user.role
    });
  } catch (error) {
    console.error("Error refreshing session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST method is also supported and does the same thing as GET
 * This is for flexibility in how the endpoint is called
 */
export async function POST(req: NextRequest) {
  return GET(req);
} 