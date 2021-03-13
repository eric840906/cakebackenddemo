const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  // 1. create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_PASS
    }
  })
  // 2. define the email options
  const mailOptions = {
    from: 'ASDFASDF sadfsdf <HELLO@WORLD>',
    to: options.email,
    subject: options.subject,
    text: options.message
  }
  // 3. send email with nodemailer
  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail