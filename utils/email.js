const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // creating a transporter
  const transporter = nodemailer.createTransport({
    //everything here is received from nodemailer.
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // defining email options
  const mailOptions = {
    from: 'Ofek Malul <Natours@natours.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // send the email to the user
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
