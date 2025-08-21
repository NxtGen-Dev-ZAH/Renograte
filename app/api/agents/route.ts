import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Find all users who are agents (have agent membership)
    const agents = await prisma.user.findMany({
      where: {
        role: 'agent',
        memberProfile: {
          plan: {
            contains: 'Agent',
          },
        },
      },
      include: {
        memberProfile: true,
        customFields: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform the data to include only necessary fields and protect sensitive information
    const safeAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      image: agent.image,
      company: agent.memberProfile?.company || null,
      phone: agent.memberProfile?.phone || null,
      businessType: agent.memberProfile?.businessType || null,
      licenseNumber: agent.memberProfile?.licenseNumber || null,
      // Include additional fields from customFields if available
      website: agent.customFields?.website || null,
      agencyName: agent.customFields?.agencyName || null,
      title: agent.customFields?.title || null,
      serviceAreas: agent.customFields?.serviceAreas || [],
      specialties: agent.customFields?.specialties || [],
      aboutAgency: agent.customFields?.aboutAgency || null,
    }));

    return NextResponse.json({ agents: safeAgents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
