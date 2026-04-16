const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in', // use smtp.zoho.com if not India
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD
  }
});

const sendAdminMail = async (data) => {
  const {
    first_name,
    last_name,
    email,
    company,
    service,
    message
  } = data;

  const mailOptions = {
    from: `"AstranovaHR" <${process.env.ZOHO_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🚀 New Contact Submission from ${first_name} ${last_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color:#333;">📩 New Contact Form Submission</h2>
        
        <p><strong>Name:</strong> ${first_name} ${last_name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Service Interested:</strong> ${service || 'N/A'}</p>

        <hr />

        <h3>📝 Message</h3>
        <p style="background:#f4f4f4; padding:10px; border-radius:5px;">
          ${message}
        </p>

        <hr />

        <p style="font-size:12px; color:gray;">
          This message was sent from AstranovaHR website contact form.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendUserConfirmationMail = async (data) => {
  const { first_name, email } = data;

  const mailOptions = {
    from: `"AstranovaHR" <${process.env.ZOHO_EMAIL}>`,
    to: email,
    subject: `✅ We received your message - AstranovaHR`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${first_name},</h2>

        <p>Thank you for reaching out to <strong>AstranovaHR</strong>.</p>

        <p>We have received your message and our team will get back to you shortly.</p>

        <br/>

        <p>Best Regards,</p>
        <p><strong>AstranovaHR Team</strong></p>

        <hr />
        <p style="font-size:12px; color:gray;">
          This is an automated confirmation email.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendAdminMail,
  sendUserConfirmationMail
};