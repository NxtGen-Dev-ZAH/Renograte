import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Find all users who are contractors (have contractor membership)
    const contractors = await prisma.user.findMany({
      where: {
        role: 'contractor',
        memberProfile: {
          plan: {
            contains: 'Contractor',
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
    const safeContractors = contractors.map(contractor => ({
      id: contractor.id,
      name: contractor.name,
      email: contractor.email,
      image: contractor.image,
      company: contractor.memberProfile?.company || null,
      phone: contractor.memberProfile?.phone || null,
      businessType: contractor.memberProfile?.businessType || null,
      licenseNumber: contractor.memberProfile?.licenseNumber || null,
      // Include additional fields from customFields if available
      website: contractor.customFields?.website || null,
      agencyName: contractor.customFields?.agencyName || null,
      title: contractor.customFields?.title || null,
      serviceAreas: contractor.customFields?.serviceAreas || [],
      specialties: contractor.customFields?.specialties || [],
      aboutAgency: contractor.customFields?.aboutAgency || null,
    }));

    return NextResponse.json({ contractors: safeContractors });
  } catch (error) {
    console.error('Error fetching contractors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contractors' },
      { status: 500 }
    );
  }
}
