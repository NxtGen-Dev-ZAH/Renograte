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