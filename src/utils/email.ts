import nodemailer from "nodemailer";

interface SendVerificationEmailOptions {
  email: string;
  firstName: string;
  code: string;
}

export async function sendVerificationEmail({
  email,
  firstName,
  code,
}: SendVerificationEmailOptions) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM ||
    `"The Handmade Vendor Concierge" <concierge@thehandmadevendor.com>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Your Atelier Verification Code</title>
      <style>
        body { margin: 0; padding: 0; background-color: #FFFAF5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #3D2B1F; }
        .wrapper { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #E3C9A8; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(61,43,31,0.06); }
        .header { background: linear-gradient(155deg, #1F150E 0%, #35241A 50%, #4A3324 100%); padding: 36px 30px; text-align: center; color: #FFFFFF; }
        .brand-title { font-size: 20px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #FFFFFF; margin: 0; }
        .brand-subtitle { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #C4896A; margin-top: 6px; }
        .content { padding: 40px 36px; text-align: center; }
        .salutation { font-size: 18px; font-weight: 600; color: #3D2B1F; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #7A6B5D; margin-bottom: 28px; }
        .code-container { background: #FFFAF5; border: 1px dashed #C4896A; border-radius: 12px; padding: 22px; display: inline-block; margin: 0 auto 24px auto; }
        .code { font-size: 32px; font-weight: 700; letter-spacing: 0.25em; color: #3D2B1F; font-family: 'Courier New', Courier, monospace; }
        .expiry-badge { display: inline-block; background: #FEF5EC; color: #C4896A; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1px solid #E3C9A8; margin-bottom: 24px; }
        .footer { background: #FFFAF5; border-top: 1px solid #E3C9A8; padding: 24px 30px; text-align: center; font-size: 11px; color: #A09082; letter-spacing: 0.08em; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1 class="brand-title">The Handmade Vendor</h1>
          <p class="brand-subtitle">Atelier Concierge • Private Client Services</p>
        </div>
        <div class="content">
          <div class="salutation">Welcome, ${firstName || "Valued Client"}</div>
          <p class="text">
            Thank you for requesting membership into The Handmade Vendor Atelier. 
            To activate your bespoke privileges and complete your registration, 
            please enter the verification code below:
          </p>
          <div class="code-container">
            <span class="code">${code}</span>
          </div>
          <br>
          <div class="expiry-badge">
            ⏱ Active for 5 minutes only
          </div>
          <p class="text" style="font-size: 12px; margin-bottom: 0;">
            If you did not initiate this request, please safely disregard this notice. 
            For artisan assistance, contact <a href="mailto:concierge@thehandmadevendor.com" style="color: #C4896A;">concierge@thehandmadevendor.com</a>.
          </p>
        </div>
        <div class="footer">
          Artisan Mastery • Since 2018 • Florence, Italy
        </div>
      </div>
    </body>
    </html>
  `;

  // If user has not yet configured SMTP credentials in .env, log code for seamless local development
  if (!user || !pass) {
    console.log(`\n========================================================`);
    console.log(`[THE HANDMADE VENDOR] Verification Code Generated:`);
    console.log(`Recipient: ${email} (${firstName})`);
    console.log(`CODE: >>> ${code} <<< (Expires in 5 minutes)`);
    console.log(`(Configure SMTP_USER & SMTP_PASS in .env to dispatch live emails)`);
    console.log(`========================================================\n`);
    return { success: true, simulated: true, code };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from,
    to: email,
    subject: `${code} is your Handmade Vendor Atelier verification code`,
    html: htmlContent,
    text: `Your Handmade Vendor Atelier verification code is: ${code}. This code is active for 5 minutes only.`,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, simulated: false };
}
