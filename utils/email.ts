import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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