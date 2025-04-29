import asyncHandler from 'express-async-handler';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import { generateEmailVerificationToken } from '../Utils/tokenGenerator.js';
import { sendVerificationEmail } from '../Utils/emailService.js';
import { generateToken } from '../Utils/generateToken.js';

// Try to import OAuth2Client but don't crash if it's not available
let OAuth2Client = null;
let client = null;

try {
  const googleAuthLibrary = await import('google-auth-library');
  OAuth2Client = googleAuthLibrary.OAuth2Client;
  
  if (OAuth2Client && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID, 
      process.env.GOOGLE_CLIENT_SECRET, 
      `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`
    );
    console.log('Google OAuth client initialized successfully');
  } else {
    console.log('Google OAuth configuration incomplete, some features may be unavailable');
  }
} catch (error) {
  console.log('Google Auth Library not available:', error.message);
  console.log('Google OAuth features will be disabled');
}

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

// Redirect to Google OAuth2 - checks if Google Auth is available
const googleOAuthRedirect = (req, res) => {
  if (!client) {
    return res.status(501).json({ 
      success: false, 
      message: "Google OAuth is not available. Package 'google-auth-library' is not installed."
    });
  }
  
  try {
    console.log("Google OAuth redirect initiated");
    const redirectUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      prompt: 'consent'
    });
    console.log("Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in Google OAuth redirect:", error);
    res.status(500).json({ message: "Failed to initiate Google authentication" });
  }
};

// Handle Google OAuth2 callback - checks if Google Auth is available
const googleOAuthCallback = async (req, res) => {
  if (!client) {
    return res.status(501).json({ 
      success: false, 
      message: "Google OAuth is not available. Package 'google-auth-library' is not installed."
    });
  }
  
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

    console.log('Google auth payload:', { email, name, googleId, picture });

    // Check if user exists in Alumni or Student collections
    let user = await Alumni.findOne({ email });
    let userType = 'alumni';
    
    if (!user) {
      user = await Student.findOne({ email });
      userType = 'student';
    }

    // Create proper auth token if user exists
    let authToken = '';
    let isVerified = false;
    
    if (user) {
      // User exists, generate auth token
      authToken = generateToken(user._id);
      isVerified = userType === 'alumni' ? (user.isVerified || user.verificationStatus === 'approved') : true;
      
      // If the user exists but doesn't have googleId set, update it
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
        console.log(`Updated existing user with Google ID: ${googleId}`);
      }
    }

    // Return user data to client via a script that posts a message to the opener window
    const script = `
      <script>
        window.opener.postMessage({
          type: 'googleAuthSuccess',
          userData: ${JSON.stringify({
            name,
            email,
            googleId,  // Include googleId in the response
            picture,
            token: authToken,
            userType,
            isVerified,
            exists: !!user,
            userId: user ? user._id.toString() : null
          })}
        }, '${process.env.FRONTEND_URL || '*'}');
        window.close();
      </script>
    `;
    
    res.send(script);
  } catch (error) {
    console.error('Google OAuth2 error:', error);
    const errorScript = `
      <script>
        window.opener.postMessage({
          type: 'googleAuthError',
          error: ${JSON.stringify(error.message || 'Authentication failed')}
        }, '${process.env.FRONTEND_URL || '*'}');
        window.close();
      </script>
    `;
    res.status(500).send(errorScript);
  }
};

/**
 * Verify auth token
 * @route GET /api/auth/verify
 * @access Private
 */
const verifyToken = asyncHandler(async (req, res) => {
  try {
    // If the request made it past the protect middleware, the token is valid
    // and req.user is populated
    
    // Determine if the user is verified (for alumni)
    let isVerified = true;
    
    // For alumni, check verification status
    if (req.userRole === 'alumni') {
      isVerified = req.user.isVerified || 
                   req.user.verificationStatus === 'approved' || 
                   req.user.status === 'active';
    }
    
    return res.status(200).json({
      isValid: true,
      role: req.userRole,
      isVerified,
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({
      isValid: false,
      message: 'Invalid token'
    });
  }
});

export {
  verifyEmail,
  resendVerification,
  googleOAuthRedirect,
  googleOAuthCallback,
  verifyToken
};