import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailWithPdfAttachment } from "@/utils/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, documentUrl, recipientEmail, recipientName, contractTitle } = body;
    
    if (!contractId || !documentUrl || !recipientEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Verify that the contract exists
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { title: true, documentUrl: true }
    });
    
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }
    
    // Create email content
    const title = contractTitle || contract.title;
    const emailSubject = `Your signed document: ${title}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Signed Document</h2>
        <p>Hello ${recipientName || 'there'},</p>
        <p>Thank you for signing the document "${title}". Please find attached a copy of the signed document.</p>
        <p>If you have any questions or need further assistance, please contact our team.</p>
        <p>Best regards,<br/>Renograte Team</p>
      </div>
    `;
    
    // Send email with PDF attachment
    const emailSent = await sendEmailWithPdfAttachment(
      recipientEmail,
      emailSubject,
      emailHtml,
      documentUrl,
      `${title.replace(/\s+/g, '_')}.pdf`,
      title
    );
    
    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending document:", error);
    return NextResponse.json(
      { error: "Failed to send document" },
      { status: 500 }
    );
  }
} 