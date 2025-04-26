import asyncHandler from 'express-async-handler';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import { generateEmailVerificationToken, generatePasswordResetToken } from '../Utils/tokenGenerator.js';
import { sendPasswordResetEmail } from '../Utils/emailService.js';
import { OAuth2Client } from 'google-auth-library';
import { generateToken } from '../Utils/generateToken.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.BACKEND_URL}/api/auth/google/callback`);

/**
 * Verify email token
 * @route   GET /api/auth/verify-email/:userType/:token
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { userType, token } = req.params;
  
  if (!token) {
    res.status(400);
    throw new Error('Invalid verification token');
  }
  
  const Model = userType.toLowerCase() === 'student' ? Student : Alumni;
  
  const user = await Model.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }
  
  // Update user verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  
  res.redirect(`${process.env.FRONTEND_URL}/login?verified=true&userType=${userType}`);
});

/**
 * Request password reset
 * @route   POST /api/auth/forgot-password/:userType
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { userType } = req.params;
  
  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }
  
  // Determine the model to use
  const Model = userType.toLowerCase() === 'student' ? Student : Alumni;
  
  // Find user by email
  const user = await Model.findOne({ email });
  
  if (!user) {
    // Don't reveal that the user doesn't exist for security
    res.status(200).json({
      message: 'If your email exists in our system, you will receive a password reset link'
    });
    return;
  }
  
  // Generate reset token
  const { token } = generatePasswordResetToken(user);
  await user.save();
  
  // Send password reset email
  const emailSent = await sendPasswordResetEmail(
    user.email,
    user.name,
    token,
    userType
  );
  
  if (!emailSent) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(500);
    throw new Error('Error sending password reset email. Please try again later.');
  }
  
  res.status(200).json({
    message: 'Password reset link sent to your email'
  });
});

/**
 * Reset password with token
 * @route   POST /api/auth/reset-password/:userType/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { userType, token } = req.params;
  
  if (!password) {
    res.status(400);
    throw new Error('Please provide a new password');
  }
  
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }
  
  // Determine the model to use
  const Model = userType.toLowerCase() === 'student' ? Student : Alumni;
  
  // Find user with this token and token not expired
  const user = await Model.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }
  
  // Set new password and clear reset token
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  await user.save();
  
  res.status(200).json({
    message: 'Password reset successfully. You can now log in with your new password.'
  });
});

/**
 * Resend verification email
 * @route   POST /api/auth/resend-verification/:userType
 * @access  Public
 */
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { userType } = req.params;
  
  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }
  
  // Determine the model to use
  const Model = userType.toLowerCase() === 'student' ? Student : Alumni;
  
  // Find user by email
  const user = await Model.findOne({ email });
  
  if (!user) {
    // Don't reveal that the user doesn't exist for security
    res.status(200).json({
      message: 'If your email exists in our system, you will receive a verification link'
    });
    return;
  }
  
  // If already verified
  if (user.isEmailVerified) {
    res.status(400);
    throw new Error('Email is already verified');
  }
  
  // Generate verification token
  const { token } = generateEmailVerificationToken(user);
  await user.save();
  
  // Send verification email
  const emailSent = await sendVerificationEmail(
    user.email,
    user.name,
    token,
    userType
  );
  
  if (!emailSent) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.status(500);
    throw new Error('Error sending verification email. Please try again later.');
  }
  
  res.status(200).json({
    message: 'Verification link sent to your email'
  });
});

// Redirect to Google OAuth2
const googleOAuthRedirect = (req, res) => {
  const redirectUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });
  res.redirect(redirectUrl);
};

// Handle Google OAuth2 callback
const googleOAuthCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // Don't create a user yet - just return the Google data to the frontend
    // so the user can complete their profile information
    
    // Return user data to client via a script that posts a message to the opener window
    const script = `
      <script>
        window.opener.postMessage({
          type: 'googleAuthSuccess',
          userData: ${JSON.stringify({
            name,
            email,
            googleId, // Ensure this is correct
            picture,
            token: tokens.id_token
          })}
        }, '${process.env.FRONTEND_URL}');
        window.close();
      </script>
    `;
    
    res.send(script);
  } catch (error) {
    console.error('Google OAuth2 error:', error);
    res.status(500).send('Authentication failed');
  }
};

// Enhance email verification with better templates
const sendVerificationEmail = async (email, name, token, userType) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-account/${userType.toLowerCase()}/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4361ee;">Student-Alumni Interaction Platform</h1>
      </div>
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for registering as a ${userType} on our platform. Please verify your email address to continue.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4361ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p>This link will expire in 24 hours.</p>
      <p style="color: #666; font-size: 14px;">If you did not create an account, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, 'Verify Your Email Address', html);
};

export {
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
  googleOAuthRedirect,
  googleOAuthCallback
};