import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getSignedFileUrl } from '@/lib/s3';
import axios from 'axios';

// Create reusable transporter object using SMTP
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'info@renograte.com',
    pass: process.env.SMTP_PASSWORD,
  },
});

const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

export const generateVerificationToken = async (email: string): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TOKEN_EXPIRY);

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
    },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
};

export const verifyEmailToken = async (token: string): Promise<string | null> => {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) return null;
  if (new Date() > verificationToken.expires) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return null;
  }

  // Delete the token after successful verification
  await prisma.verificationToken.delete({
    where: { token },
  });

  return verificationToken.identifier;
};

export const sendVerificationEmail = async (
  email: string,
  name: string | null,
  verificationToken: string
) => {
  // Use a dynamic base URL based on environment
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_APP_URL || 'https://www.renograte.com'
    : 'http://localhost:3000';
    
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

  try {
    await transporter.sendMail({
      from: '"Renograte" <info@renograte.com>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Renograte!</h2>
          <p>Hello ${name || 'there'},</p>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
          <p>Best regards,<br>The Renograte Team</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

/**
 * Send an email with a PDF attachment
 * @param to Recipient email address
 * @param subject Email subject
 * @param htmlContent HTML content of the email
 * @param documentUrl URL or S3 key of the PDF document
 * @param documentName Name to use for the PDF attachment
 * @param contractTitle Title of the contract (for the email subject)
 */
export const sendEmailWithPdfAttachment = async (
  to: string,
  subject: string,
  htmlContent: string,
  documentUrl: string,
  documentName: string,
  contractTitle: string
): Promise<boolean> => {
  try {
    console.log(`Preparing to send email with PDF attachment to ${to}`);
    
    // Get the PDF file content
    let pdfBuffer: Buffer;
    
    if (documentUrl.startsWith('http')) {
      // If it's already a URL, fetch it directly
      const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
      pdfBuffer = Buffer.from(response.data);
    } else if (documentUrl.startsWith('/api')) {
      // If it's an internal API URL, fetch it with the base URL
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL || 'https://www.renograte.com'
        : 'http://localhost:3000';
      
      const response = await axios.get(`${baseUrl}${documentUrl}`, { 
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN || ''}`
        }
      });
      pdfBuffer = Buffer.from(response.data);
    } else {
      // If it's an S3 key, use the S3 proxy endpoint with proper authentication
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL || 'https://www.renograte.com'
        : 'http://localhost:3000';
      
      const response = await axios.get(`${baseUrl}/api/s3-proxy?key=${encodeURIComponent(documentUrl)}`, { 
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN || ''}`
        }
      });
      pdfBuffer = Buffer.from(response.data);
    }
    
    console.log(`Successfully fetched PDF document (${pdfBuffer.length} bytes)`);
    
    // Send email with attachment
    await transporter.sendMail({
      from: '"Renograte" <info@renograte.com>',
      to,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: documentName || `${contractTitle.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    
    console.log(`Successfully sent email with PDF attachment to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email with PDF attachment:', error);
    return false;
  }
};

/**
 * Send a simple email without attachments
 * @param options Email options including to, subject, and html content
 */
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: options.from || '"Renograte" <info@renograte.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send email notification to admin when a new listing is submitted for review
 * @param listingData The listing data that was submitted
 * @param agentName The name of the agent who submitted the listing
 */
export const sendNewListingNotificationEmail = async (
  listingData: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    listingPrice: number;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    propertyType: string;
    description: string;
    createdAt: string;
  },
  agentName: string
): Promise<boolean> => {
  try {
    // Use a dynamic base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL || 'https://www.renograte.com'
      : 'http://localhost:3000';
    
    const adminReviewUrl = `${baseUrl}/admin/listings?tab=pending`;

    // Format currency for display
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const subject = `New Property Listing Submitted for Review - ${listingData.title}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0C71C3; margin: 0; font-size: 28px;">New Listing Review Required</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">A new property listing has been submitted and requires your review</p>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
            <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 18px;">⚠️ Action Required</h3>
            <p style="color: #856404; margin: 0; font-size: 14px;">Please review this listing in the admin panel to approve or reject it.</p>
          </div>

          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Property Details</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <h3 style="color: #0C71C3; margin: 0 0 10px 0; font-size: 16px;">Basic Information</h3>
                <p style="margin: 5px 0; color: #333;"><strong>Title:</strong> ${listingData.title}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Address:</strong> ${listingData.address}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Location:</strong> ${listingData.city}, ${listingData.state} ${listingData.zipCode}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Property Type:</strong> ${listingData.propertyType}</p>
              </div>
              
              <div>
                <h3 style="color: #0C71C3; margin: 0 0 10px 0; font-size: 16px;">Property Specs</h3>
                <p style="margin: 5px 0; color: #333;"><strong>Price:</strong> <span style="color: #28a745; font-weight: bold;">${formatCurrency(listingData.listingPrice)}</span></p>
                <p style="margin: 5px 0; color: #333;"><strong>Bedrooms:</strong> ${listingData.bedrooms}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Bathrooms:</strong> ${listingData.bathrooms}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Square Footage:</strong> ${listingData.squareFootage.toLocaleString()} sqft</p>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #0C71C3; margin: 0 0 10px 0; font-size: 16px;">Description</h3>
              <p style="margin: 0; color: #333; line-height: 1.6; background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #0C71C3;">${listingData.description}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <h3 style="color: #0C71C3; margin: 0 0 10px 0; font-size: 16px;">Submission Details</h3>
                <p style="margin: 5px 0; color: #333;"><strong>Submitted by:</strong> ${agentName}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Submitted on:</strong> ${formatDate(listingData.createdAt)}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Status:</strong> <span style="background-color: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">PENDING REVIEW</span></p>
              </div>
              
              <div>
                <h3 style="color: #0C71C3; margin: 0 0 10px 0; font-size: 16px;">Quick Actions</h3>
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Click the button below to review this listing in the admin panel.</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${adminReviewUrl}" 
               style="background-color: #0C71C3; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block; 
                      font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(12, 113, 195, 0.3);">
              Review Listing in Admin Panel
            </a>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; margin: 0; text-align: center;">
              This is an automated notification from the Renograte platform.<br>
              Please review the listing promptly to ensure timely processing.
            </p>
          </div>
        </div>
      </div>
    `;

    const success = await sendEmail({
      to: 'info@renograte.com',
      subject: subject,
      html: htmlContent,
    });

    if (success) {
      console.log(`✅ New listing notification email sent successfully for listing: ${listingData.title}`);
    } else {
      console.error(`❌ Failed to send new listing notification email for listing: ${listingData.title}`);
    }

    return success;
  } catch (error) {
    console.error('Error sending new listing notification email:', error);
    return false;
  }
}; 