// Looking to send emails in production? Check out our Email API/SMTP product!
const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const TOKEN = "aae6004b2b9bb4ce4b865a75f07f923f";

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
    testInboxId: 3203522,
  })
);

const sender = {
  address: "hello@example.com",
  name: "Mailtrap Test",
};
const recipients = [
  "aluluthospambo@gmail.com",
];

// transport
//   .sendMail({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//     sandbox: true
//   })
//   .then(console.log, console.error);


  const em = ()=>{
    transport
      .sendMail({
        from: sender,
        to: recipients,
        subject: "You are awesome!",
        text: "Hi lukho boi\n Jonga nhe know you are sending emails with your application.\nRegards\nUtswempu",
        category: "Integration Test",
        sandbox: true
      })
  }

  em();
  console.log(em);