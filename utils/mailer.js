const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAIL_USER || "7ff5b1c0cf5f7d",
    pass: process.env.MAIL_PASS || "eca172eee689a1"
  }
});

const sendMail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: '"PeopleHub HR" <hr@peoplehub.com>',
      to: to,
      subject: subject,
      html: htmlContent
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
};

module.exports = { sendMail };
