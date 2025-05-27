import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { sendOtpResetPassword } from '../template/email.template.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, otp }) => {

  //send email
  await transporter.sendMail({
    from: `Warehouse Management System`,
    to,
    subject,
    html: sendOtpResetPassword(otp)
  });
};
