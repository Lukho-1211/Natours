const nodemailer = require('nodemailer');
const { MailtrapTransport } = require("mailtrap");

const sendEmail = async options =>{
    //1) Create transportor

    // const transporter = nodemailer.createTransport({
    //     host: process.env.EMAIL_HOST,
    //     port: process.env.EMAIL_PORT,
    //     auth: { 
    //         user: process.env.EMAIL_USERNAME,
    //         password: process.env.EMAIL_PASSWORD
    //     }
    // })
    const TOKEN = "aae6004b2b9bb4ce4b865a75f07f923f";

    const transporter = nodemailer.createTransport(
      MailtrapTransport({
        token: TOKEN,
        testInboxId: 3203522,
      })
    );
    
    //2) Difine the email options

    // const mailOptions = {
    //     from: 'Lukho Spambo <aluluthospambo@gmail.com>',
    //     to: options.email,
    //     subject: options.subject,
    //     text: options.message
    // }

    const mailOptions = {
        from: 'Lukho Spambo <aluluthospambo@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        category: "Integration Test",
        sandbox: true
      }

    //3) Actually send the email
    await transporter.sendMail(mailOptions);

};







module.exports = sendEmail;