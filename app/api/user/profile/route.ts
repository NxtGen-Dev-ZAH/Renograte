import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        memberProfile: {
          select: {
            phone: true,
            company: true,
            businessType: true,
            licenseNumber: true,
            plan: true,
            billingCycle: true,
            status: true,
          }
        },
        customFields: {
          select: {
            website: true,
            agencyName: true,
            title: true,
            license: true,
            whatsapp: true,
            taxNumber: true,
            faxNumber: true,
            languages: true,
            serviceAreas: true,
            specialties: true,
            aboutAgency: true,
            facebookUsername: true,
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;
    const profileImage = formData.get('profileImage') as File | null;
    
    // Custom fields
    const website = formData.get('website') as string;
    const agencyName = formData.get('agencyName') as string;
    const title = formData.get('title') as string;
    const license = formData.get('license') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const taxNumber = formData.get('taxNumber') as string;
    const faxNumber = formData.get('faxNumber') as string;
    const languages = formData.getAll('languages') as string[];
    const serviceAreas = formData.getAll('serviceAreas') as string[];
    const specialties = formData.getAll('specialties') as string[];
    const aboutAgency = formData.get('aboutAgency') as string;
    const facebookUsername = formData.get('facebookUsername') as string;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 });
      }
    }
    
    // Upload profile image to S3 if provided
    let imageUrl = undefined;
    if (profileImage) {
      try {
        const s3Key = await uploadFileToS3(profileImage, 'profiles/');
        imageUrl = s3Key;
      } catch (error) {
        console.error('Error uploading profile image:', error);
        return NextResponse.json({ error: 'Failed to upload profile image' }, { status: 500 });
      }
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        email: email || undefined,
        image: imageUrl || undefined,
        memberProfile: {
          upsert: {
            create: {
              phone,
              company,
              // Set default values for required fields
              businessType: 'individual',
              plan: 'free',
              billingCycle: 'monthly',
            },
            update: {
              phone: phone || undefined,
              company: company || undefined,
            }
          }
        },
        customFields: {
          upsert: {
            create: {
              website,
              agencyName,
              title,
              license,
              whatsapp,
              taxNumber,
              faxNumber,
              languages: languages.length > 0 ? languages : [],
              serviceAreas: serviceAreas.length > 0 ? serviceAreas : [],
              specialties: specialties.length > 0 ? specialties : [],
              aboutAgency,
              facebookUsername,
            },
            update: {
              website: website || undefined,
              agencyName: agencyName || undefined,
              title: title || undefined,
              license: license || undefined,
              whatsapp: whatsapp || undefined,
              taxNumber: taxNumber || undefined,
              faxNumber: faxNumber || undefined,
              languages: languages.length > 0 ? languages : undefined,
              serviceAreas: serviceAreas.length > 0 ? serviceAreas : undefined,
              specialties: specialties.length > 0 ? specialties : undefined,
              aboutAgency: aboutAgency || undefined,
              facebookUsername: facebookUsername || undefined,
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        memberProfile: {
          select: {
            phone: true,
            company: true,
          }
        },
        customFields: true
      }
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 