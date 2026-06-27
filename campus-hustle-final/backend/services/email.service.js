// backend/services/email.service.js
'use strict';

const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: env.email.user, pass: env.email.pass },
  tls: { rejectUnauthorized: false },
});

const emailBase = (content) => `
  <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;
              padding:30px;border:1px solid #e2e8f0;border-radius:14px;background:#fff">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:1.6rem;font-weight:800;color:#0f172a;letter-spacing:-0.03em">
        Hustle<span style="color:#0288d1">Grad</span>
      </span>
    </div>
    ${content}
    <hr style="border:0;border-top:1px solid #edf2f7;margin:24px 0"/>
    <small style="color:#a0aec0;display:block;text-align:center;font-size:0.78rem">
      © ${new Date().getFullYear()} HustleGrad · Strathmore University
    </small>
  </div>
`;

const sendTwoFactorCode = async (toEmail, userName, code) => {
  await transporter.sendMail({
    from: `"${env.email.fromName}" <${env.email.user}>`,
    to: toEmail,
    subject: '🔒 Your HustleGrad Verification Code',
    html: emailBase(`
      <h2 style="color:#0288d1;margin-top:0;text-align:center">Security Verification</h2>
      <p style="color:#2d3748">Hi <strong>${userName}</strong>,</p>
      <p style="color:#4a5568;line-height:1.5">Enter the code below to complete your login:</p>
      <div style="text-align:center;margin:28px 0">
        <span style="display:inline-block;font-family:monospace;font-size:2.25rem;
                     font-weight:800;letter-spacing:6px;color:#0f172a;
                     background:#f1f5f9;padding:12px 28px;border-radius:8px;
                     border:1px dashed #cbd5e1">${code}</span>
      </div>
      <p style="font-size:0.82rem;color:#e53935;text-align:center;font-weight:600;margin:0">
        ⏳ This code expires in 5 minutes.
      </p>
    `),
  });
};

const sendPasswordResetCode = async (toEmail, userName, code) => {
  await transporter.sendMail({
    from: `"${env.email.fromName}" <${env.email.user}>`,
    to: toEmail,
    subject: '🔑 HustleGrad — Password Reset Code',
    html: emailBase(`
      <h2 style="color:#0288d1;margin-top:0;text-align:center">Reset Your Password</h2>
      <p style="color:#2d3748">Hi <strong>${userName}</strong>,</p>
      <p style="color:#4a5568;line-height:1.5">
        We received a request to reset your HustleGrad password.
        Use the code below to continue:
      </p>
      <div style="text-align:center;margin:28px 0">
        <span style="display:inline-block;font-family:monospace;font-size:2.25rem;
                     font-weight:800;letter-spacing:6px;color:#0f172a;
                     background:#fff7ed;padding:12px 28px;border-radius:8px;
                     border:1px dashed #fed7aa">${code}</span>
      </div>
      <p style="font-size:0.82rem;color:#e53935;text-align:center;font-weight:600;margin:0">
        ⏳ This code expires in 10 minutes.
      </p>
      <p style="font-size:0.82rem;color:#718096;text-align:center;margin-top:14px">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    `),
  });
};

module.exports = { sendTwoFactorCode, sendPasswordResetCode };