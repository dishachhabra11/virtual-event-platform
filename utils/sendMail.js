import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    type: "login",
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const setMailOptions = (to, text) => { 
    console.log(process.env.GMAIL_USER);
    console.log(process.env.GMAIL_PASSWORD);
   return {
     from: {
       name: "eventify",
       address: process.env.GMAIL_USER,
     }, // sender address
     to: to, // list of receivers
     subject: "Eventify reset password otp", // Subject line
     text: `this is your OTP ${text}`, // plain text body
     html: `<b>this is your OTP ${text}</b>`, // html body
   };
}
