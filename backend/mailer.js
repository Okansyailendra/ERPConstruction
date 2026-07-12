const nodemailer = require("nodemailer");

let transporter;

async function setupMailer() {
  // Create a test account on Ethereal Email
  let testAccount = await nodemailer.createTestAccount();

  // Create reusable transporter object using the default SMTP transport
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  console.log("Ethereal Email transporter setup complete");
  console.log("User:", testAccount.user);
}

setupMailer();

async function sendResetEmail(email, token) {
  if (!transporter) {
    await setupMailer();
  }

  const resetUrl = `http://localhost:5173/reset-password/${token}`;

  const info = await transporter.sendMail({
    from: '"ConstructERP Admin" <admin@constructerp.id>',
    to: email,
    subject: "Reset Password - ConstructERP",
    text: `Anda meminta reset password. Silakan klik link berikut untuk mereset password Anda: ${resetUrl}`,
    html: `<p>Anda meminta reset password.</p><p>Silakan klik link berikut untuk mereset password Anda:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  
  return nodemailer.getTestMessageUrl(info);
}

module.exports = {
  sendResetEmail,
};
