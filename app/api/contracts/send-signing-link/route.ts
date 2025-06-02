import { NextResponse } from "next/server";
import { generateSigningLink } from "@/lib/contracts/contractService";
import { ContractRole } from "@/lib/contracts/contractService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transporter } from "@/utils/email";
import { prisma } from "@/lib/prisma";
import { sendEmailWithPdfAttachment } from "@/utils/email";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { contractId, role, email, name, attachPdf } = body;
    
    if (!contractId || !role || !email || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Generate signing link
    const signingLink = await generateSigningLink(contractId, role as ContractRole, email, name);
    
    // Construct the full URL
    const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_APP_URL || 'https://www.renograte.com'
    : 'http://localhost:3000';    
    const fullSigningUrl = `${baseUrl}${signingLink}`;
    
    // Get contract details if PDF attachment is requested
    let contract = null;
    if (attachPdf) {
      contract = await prisma.contract.findUnique({
        where: { id: contractId },
        select: { title: true, documentUrl: true }
      });
      
      if (!contract) {
        return NextResponse.json(
          { error: "Contract not found" },
          { status: 404 }
        );
      }
    }
    
    // Send email with signing link
    const emailSubject = `You have a document to sign`;
    const emailBody = `
     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Document Signing Request</h2>
  <p>Hello ${name},</p>
  <p>You have been invited to sign a document.</p>
  <p>Please review the PDF of the contract below and then proceed to sign it:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${fullSigningUrl}"
       style="background-color: #0C71C3; color: white; padding: 12px 24px;
              text-decoration: none; border-radius: 4px; display: inline-block;">
      Review and Sign Document
    </a>
  </div>
  <p>This link will expire in 7 days.</p>
  <p>If you didn't expect this request, please contact our team.</p>
  <p>Thank you,<br/>Renograte Team</p>
</div>
    `;
    
    try {
      // If PDF attachment is requested, use sendEmailWithPdfAttachment
      if (attachPdf && contract && contract.documentUrl) {
        const emailSent = await sendEmailWithPdfAttachment(
          email,
          emailSubject,
          emailBody,
          contract.documentUrl,
          `${contract.title.replace(/\s+/g, '_')}.pdf`,
          contract.title
        );
        
        if (!emailSent) {
          throw new Error("Failed to send email with attachment");
        }
      } else {
        // Otherwise send regular email
        await transporter.sendMail({
          from: '"Renograte" <info@renograte.com>',
          to: email,
          subject: emailSubject,
          html: emailBody,
        });
      }
    } catch (error: any) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, signingLink });
  } catch (error) {
    console.error("Error sending signing link:", error);
    return NextResponse.json(
      { error: "Failed to send signing link" },
      { status: 500 }
    );
  }
} 