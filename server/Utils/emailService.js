import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email content (HTML)
 * @returns {Promise} - Email sending promise
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Student-Alumni Interaction" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send account verification email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} token - Verification token
 * @param {string} userType - Student or Alumni
 */
const sendVerificationEmail = async (email, name, token, userType) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-account/${userType.toLowerCase()}/${token}`;
  
  const html = `
    <h1>Account Verification</h1>
    <p>Hello ${name},</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not create an account, please ignore this email.</p>
  `;

  return sendEmail(email, 'Verify Your Email Address', html);
};

export {
  sendEmail,
  sendVerificationEmail
};