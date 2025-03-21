import asyncHandler from 'express-async-handler';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import { generateEmailVerificationToken, generatePasswordResetToken } from '../Utils/tokenGenerator.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../Utils/emailService.js';

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

export {
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification
};