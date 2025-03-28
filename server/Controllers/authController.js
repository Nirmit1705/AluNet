import asyncHandler from 'express-async-handler';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import { generateEmailVerificationToken, generatePasswordResetToken } from '../Utils/tokenGenerator.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../Utils/emailService.js';
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
  
  // Determine the model to use
  const Model = userType.toLowerCase() === 'student' ? Student : Alumni;
  
  // Find user with this token and token not expired
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
  
  res.status(200).json({
    message: 'Email verified successfully. You can now log in.'
  });
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
    const { email, name, sub: googleId } = payload;

    // Check if user exists
    let user = await Alumni.findOne({ email }) || await Student.findOne({ email });

    if (!user) {
      // Create a new user (default to student role)
      user = await Student.create({
        name,
        email,
        googleId,
        isEmailVerified: true, // Google accounts are verified
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  } catch (error) {
    console.error('Google OAuth2 error:', error);
    res.status(500).send('Authentication failed');
  }
};

export {
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
  googleOAuthRedirect,
  googleOAuthCallback
};