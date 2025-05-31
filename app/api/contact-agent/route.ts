import { NextRequest, NextResponse } from 'next/server';
import { transporter } from '@/utils/email';

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string;
  requestDate: string;
  consent: boolean;
};

export async function POST(request: NextRequest) {
  try {
    // Get form data from request
    const data: ContactFormData = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.message || !data.propertyId || !data.consent) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the date
    const formattedDate = new Date(data.requestDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create property link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.renograte.com';
    const propertyLink = `${baseUrl}/listings/property/${data.propertyId}`;
    
    // Property information section with link
    const propertyDetails = `
      <div style="margin-top: 20px; margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
        <h3 style="margin-top: 0; color: #1e40af;">Property Information</h3>
        <p><strong>Property ID:</strong> ${data.propertyId}</p>
        <p><strong>Property Link:</strong> <a href="${propertyLink}" style="color: #0369a1; text-decoration: underline;">${propertyLink}</a></p>
        <p style="margin-top: 15px;"><a href="${propertyLink}" style="background-color: #0369a1; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">View Property Details</a></p>
      </div>
    `;

    // Send email to Renograte team
    await transporter.sendMail({
      from: '"Renograte Contact System" <info@renograte.com>',
      to: 'info@renograte.com',
      subject: `New Property Inquiry: Property ID ${data.propertyId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${baseUrl}/logo.png" alt="Renograte Logo" style="max-height: 60px;">
          </div>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin-bottom: 25px;">
            <h2 style="margin-top: 0; color: #0369a1;">New Property Inquiry</h2>
            <p style="margin-bottom: 0;">A new customer has submitted an inquiry about property #${data.propertyId}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #0369a1; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Customer Information</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Submitted:</strong> ${formattedDate}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #0369a1; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Customer Message</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; line-height: 1.5;">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          ${propertyDetails}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
            <p>This is an automated message from the Renograte Contact System.</p>
            <p>Please respond to this inquiry as soon as possible.</p>
          </div>
        </div>
      `,
    });

    // Send confirmation email to the customer
    await transporter.sendMail({
      from: '"Renograte" <info@renograte.com>',
      to: data.email,
      subject: 'Thank You for Your Property Inquiry',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${baseUrl}/logo.png" alt="Renograte Logo" style="max-height: 60px;">
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #0369a1;">Thank You for Your Inquiry</h2>
            <p>Hello ${data.name},</p>
            <p>Thank you for contacting Renograte about Property ID #${data.propertyId}. We have received your inquiry and a member of our team will be in touch with you shortly.</p>
          </div>
          
          <div style="background-color: #f0f9ff; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <h3 style="margin-top: 0; color: #0369a1;">Your Inquiry Details</h3>
            <p><strong>Property ID:</strong> ${data.propertyId}</p>
            <p><strong>Property Link:</strong> <a href="${propertyLink}" style="color: #0369a1; text-decoration: underline;">View Property</a></p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 10px; line-height: 1.5;">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #0369a1;">What Happens Next?</h3>
            <p>Our team will:</p>
            <ul style="line-height: 1.6;">
              <li>Review your inquiry</li>
              <li>Connect you with the listing agent</li>
              <li>Provide additional information about renovation options</li>
              <li>Answer any questions you may have</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: center;">
            <p>If you have any immediate questions, please contact us at <a href="mailto:info@renograte.com" style="color: #0369a1;">info@renograte.com</a> or call us at (123) 456-7890.</p>
            <p>© ${new Date().getFullYear()} Renograte. All rights reserved.</p>
          </div>
        </div>
      `,
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