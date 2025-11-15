const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Student Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Password Reset Request</h2>
        <p>You requested to reset your password for your Student Portal account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 8px;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #667eea; word-break: break-all;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, please ignore this email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Student Portal - Secure Password Reset
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendPasswordResetEmail };
