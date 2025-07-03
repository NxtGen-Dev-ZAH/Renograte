import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/utils/email";

export async function POST(req: NextRequest) {
  try {
    // Get the current session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to schedule consultations." },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await req.json();
    const { 
      name, 
      email, 
      phone, 
      date, 
      time, 
      message, 
      propertyTitle, 
      propertyAddress,
      contractorName, 
      contractorEmail 
    } = data;

    // Validate required fields
    if (!name || !email || !phone || !date || !time || !contractorEmail || !propertyTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format the date for better readability
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create email content
    const subject = `New Renovation Consultation Request for ${propertyTitle}`;
    
    const emailContent = `
      <h2>New Renovation Consultation Request</h2>
      <p>Hello ${contractorName},</p>
      <p>A user has requested a renovation consultation with you for the following property:</p>
      
      <h3>Property Details:</h3>
      <p><strong>Property:</strong> ${propertyTitle}</p>
      <p><strong>Address:</strong> ${propertyAddress}</p>
      
      <h3>Consultation Details:</h3>
      <p><strong>Requested Date:</strong> ${formattedDate}</p>
      <p><strong>Requested Time:</strong> ${time === 'morning' ? 'Morning (9AM - 12PM)' : 
                                           time === 'afternoon' ? 'Afternoon (12PM - 5PM)' : 
                                           'Evening (5PM - 8PM)'}</p>
      
      <h3>Client Information:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      
      ${message ? `<h3>Additional Message:</h3><p>${message}</p>` : ''}
      
      <p>Please contact the client to confirm the consultation details.</p>
      <p>Thank you for using Renograte!</p>
    `;

    // Send email to contractor
    await sendEmail({
      to: contractorEmail,
      subject,
      html: emailContent,
    });

    // Send confirmation email to user
    const userConfirmationSubject = `Your Renovation Consultation Request - ${propertyTitle}`;
    const userConfirmationContent = `
      <h2>Your Renovation Consultation Request</h2>
      <p>Hello ${name},</p>
      <p>Thank you for requesting a renovation consultation. Here's a summary of your request:</p>
      
      <h3>Property Details:</h3>
      <p><strong>Property:</strong> ${propertyTitle}</p>
      <p><strong>Address:</strong> ${propertyAddress}</p>
      
      <h3>Consultation Details:</h3>
      <p><strong>Requested Date:</strong> ${formattedDate}</p>
      <p><strong>Requested Time:</strong> ${time === 'morning' ? 'Morning (9AM - 12PM)' : 
                                           time === 'afternoon' ? 'Afternoon (12PM - 5PM)' : 
                                           'Evening (5PM - 8PM)'}</p>
      <p><strong>Contractor:</strong> ${contractorName}</p>
      
      <p>The contractor will contact you shortly to confirm the consultation details.</p>
      <p>Thank you for using Renograte!</p>
    `;

    await sendEmail({
      to: email,
      subject: userConfirmationSubject,
      html: userConfirmationContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error scheduling consultation:", error);
    return NextResponse.json(
      { error: "Failed to schedule consultation" },
      { status: 500 }
    );
  }
} 