import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transporter } from '@/utils/email';
import crypto from 'crypto';

// Token expiry time: 1 hour
const TOKEN_EXPIRY = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    // For security reasons, don't reveal if the user exists or not
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + TOKEN_EXPIRY);

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
      }
    });

    // Use a dynamic base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL || 'https://www.renograte.com'
      : 'http://localhost:3000';
      
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send email with reset link
    await transporter.sendMail({
      from: '"Renograte" <info@renograte.com>',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hello ${user.name || 'there'},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #0C71C3; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>Best regards,<br>The Renograte Team</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Error in forgot-password route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 