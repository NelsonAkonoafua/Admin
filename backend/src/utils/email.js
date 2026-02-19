const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const emailTemplates = {
  emailVerification: ({ name, url }) => ({
    subject: 'Welcome to forAbby - Verify Your Email',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: Georgia, serif; font-style: italic; color: #1a1a1a; font-size: 32px; margin: 0;">forAbby</h1>
        </div>
        <h2 style="color: #1a1a1a; font-weight: 400;">Welcome, ${name}!</h2>
        <p style="color: #555; line-height: 1.6;">Thank you for creating an account with forAbby. Please verify your email address to get started.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background: #1a1a1a; color: #fff; padding: 14px 32px; text-decoration: none; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Verify Email</a>
        </div>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours. If you didn't create this account, please ignore this email.</p>
      </div>
    `
  }),

  passwordReset: ({ name, url }) => ({
    subject: 'forAbby - Password Reset Request',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: Georgia, serif; font-style: italic; color: #1a1a1a; font-size: 32px; margin: 0;">forAbby</h1>
        </div>
        <h2 style="color: #1a1a1a; font-weight: 400;">Password Reset Request</h2>
        <p style="color: #555; line-height: 1.6;">Hi ${name}, we received a request to reset your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background: #1a1a1a; color: #fff; padding: 14px 32px; text-decoration: none; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 12px;">This link expires in 30 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `
  }),

  orderConfirmation: ({ name, orderNumber, items, total }) => ({
    subject: `forAbby - Order Confirmation #${orderNumber}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: Georgia, serif; font-style: italic; color: #1a1a1a; font-size: 32px; margin: 0;">forAbby</h1>
        </div>
        <h2 style="color: #1a1a1a; font-weight: 400;">Thank you for your order!</h2>
        <p style="color: #555;">Hi ${name}, your order <strong>#${orderNumber}</strong> has been confirmed.</p>
        <div style="border: 1px solid #eee; padding: 20px; margin: 20px 0;">
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
              <span>${item.name} (${item.size}, ${item.color}) × ${item.quantity}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <div style="text-align: right; margin-top: 15px; font-weight: bold; font-size: 18px;">
            Total: $${total.toFixed(2)}
          </div>
        </div>
        <p style="color: #555; font-size: 14px;">We'll send you a shipping confirmation when your order is on its way.</p>
      </div>
    `
  })
};

const sendEmail = async ({ to, subject, template, data, html }) => {
  const transporter = createTransporter();

  let emailContent = { html };
  if (template && emailTemplates[template]) {
    emailContent = emailTemplates[template](data);
  }

  const mailOptions = {
    from: `"forAbby" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: emailContent.subject || subject,
    html: emailContent.html || html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;
