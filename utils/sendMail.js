import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const redirect_uri = "https://developers.google.com/oauthplayground";
const googleAuthClient = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, redirect_uri);

googleAuthClient.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const accessToken = await googleAuthClient.getAccessToken();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: accessToken.token,
  },
});
export const setMailOptions = (to, text) => {
  console.log(process.env.GMAIL_USER);
  console.log(process.env.REFRESH_TOKEN);
  return {
    from: {
      name: "eventify",
      address: process.env.GMAIL_USER,
    }, // sender address
    to: to, // list of receivers
    subject: "Eventify reset password otp", // Subject line
    text: `This is your OTP for verification ${text}`, // plain text body
    html: `<b>This is your OTP for verification ${text}</b>`, // html body
  };
};
