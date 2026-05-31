import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Sends an email using the configured Gmail transporter.
 * Ensure GMAIL_USER and GMAIL_APP_PASSWORD are set in the environment.
 */
export async function sendEmail(options: SendMailOptions) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("Missing Gmail credentials in environment variables.");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Online Vepar" <${process.env.GMAIL_USER}>`,
      ...options,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
