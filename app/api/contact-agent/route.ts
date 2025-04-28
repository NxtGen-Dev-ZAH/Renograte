import { NextRequest, NextResponse } from 'next/server';

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string;
  requestDate: string;
};

export async function POST(request: NextRequest) {
  try {
    // Get form data from request
    const data: ContactFormData = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.message || !data.propertyId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a production environment, here you would:
    // 1. Store the contact request in your database
    // 2. Send notification emails
    // 3. Create a task in your CRM or lead management system

    // Example: Create a record of this inquiry in your database
    // await prisma.leadInquiry.create({ data: { ...data } });

    // Example: Send email to Renograte team
    // const emailResult = await sendEmail({
    //   to: 'leads@renograte.com',
    //   subject: `New Property Inquiry: ${data.propertyId}`,
    //   html: `
    //     <h2>New Property Inquiry</h2>
    //     <p><strong>Property ID:</strong> ${data.propertyId}</p>
    //     <p><strong>Customer Name:</strong> ${data.name}</p>
    //     <p><strong>Email:</strong> ${data.email}</p>
    //     <p><strong>Phone:</strong> ${data.phone}</p>
    //     <p><strong>Message:</strong></p>
    //     <div>${data.message}</div>
    //     <p><strong>Date Submitted:</strong> ${new Date(data.requestDate).toLocaleString()}</p>
    //   `,
    // });

    // Log the inquiry for demo purposes
    console.log('Received property inquiry:', {
      propertyId: data.propertyId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      requestDate: data.requestDate
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Inquiry submitted successfully. Renograte will contact you shortly.' 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing contact form submission:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to process your request' },
      { status: 500 }
    );
  }
} 