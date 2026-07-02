const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = {
  sendMail: async function (options) {
    if (process.env.BREVO_API_KEY) {
      console.log("Sending email via Brevo HTTP API...");
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sender: {
            email: options.from || process.env.EMAIL_USER
          },
          to: [
            {
              email: options.to
            }
          ],
          subject: options.subject,
          htmlContent: options.html
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Brevo API error: ${response.status} - ${errText}`);
      }

      return await response.json();
    } else {
      console.log("Sending email via Nodemailer SMTP...");
      return await transporter.sendMail(options);
    }
  }
};