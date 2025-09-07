import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/utils/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, agentEmail, agentName, name, email, phone, message } = body;

    // Validate required fields
    if (!agentEmail || !name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !emailRegex.test(agentEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create email content for the agent
    const agentEmailSubject = `New Inquiry from ${name} - Renograte`;
    
    const agentEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0C71C3; margin: 0; font-size: 24px;">New Client Inquiry</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">You have received a new inquiry through Renograte</p>
          </div>

          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Client Information</h2>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 5px 0; color: #333;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0C71C3;">${email}</a></p>
              ${phone ? `<p style="margin: 5px 0; color: #333;"><strong>Phone:</strong> <a href="tel:${phone}" style="color: #0C71C3;">${phone}</a></p>` : ''}
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">Message</h2>
            <div style="background-color: white; border-left: 4px solid #0C71C3; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <div style="background-color: #e3f2fd; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px;">💡 Quick Actions</h3>
            <p style="color: #1976d2; margin: 0; font-size: 14px;">
              Reply directly to this email to respond to ${name}, or contact them at 
              <a href="mailto:${email}" style="color: #0C71C3; font-weight: bold;">${email}</a>
              ${phone ? ` or <a href="tel:${phone}" style="color: #0C71C3; font-weight: bold;">${phone}</a>` : ''}.
            </p>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; margin: 0; text-align: center;">
              This inquiry was sent through the Renograte platform.<br>
              Please respond promptly to maintain good client relationships.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email to the agent
    const emailSent = await sendEmail({
      to: agentEmail,
      subject: agentEmailSubject,
      html: agentEmailHtml,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Send confirmation email to the client
    const clientEmailSubject = `Message sent to ${agentName} - Renograte`;
    
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0C71C3; margin: 0; font-size: 24px;">Message Sent Successfully!</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your message has been delivered to ${agentName}</p>
          </div>

          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
            <h3 style="color: #155724; margin: 0 0 10px 0; font-size: 16px;">✅ Confirmation</h3>
            <p style="color: #155724; margin: 0; font-size: 14px;">
              Your inquiry has been sent to <strong>${agentName}</strong> and they will get back to you soon.
            </p>
          </div>

          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h2>
            <ul style="color: #333; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">${agentName} will review your message and respond within 24-48 hours</li>
              <li style="margin-bottom: 8px;">Check your email regularly for their response</li>
              <li style="margin-bottom: 8px;">If you don't hear back, feel free to contact them directly</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.renograte.com/agents" 
               style="background-color: #0C71C3; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block; 
                      font-weight: bold;">
              Browse More Agents
            </a>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; margin: 0; text-align: center;">
              Thank you for using Renograte!<br>
              We're here to help you find the perfect renovation-ready property.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send confirmation email to client
    await sendEmail({
      to: email,
      subject: clientEmailSubject,
      html: clientEmailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in contact-agent API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}