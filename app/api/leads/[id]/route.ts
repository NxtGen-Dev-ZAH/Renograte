import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/leads/[id] - Get a specific lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error(`Error retrieving lead ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to retrieve lead" },
      { status: 500 }
    );
  }
}

// PATCH /api/leads/[id] - Update a lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, roles, status, notes, address } = body;

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(roles && { roles }),
        ...(status && { status }),
        ...(notes && { notes }),
        ...(address && { address }),
      },
    });

    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    console.error(`Error updating lead ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] - Delete a lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lead.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting lead ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
} 