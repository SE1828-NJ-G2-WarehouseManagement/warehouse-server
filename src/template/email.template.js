const sendOtpResetPassword = (otp) => {
  return `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #2c3e50;">🔐 Reset Your Password</h2>
  <p>Hello,</p>
  <p>You requested to reset your password. Please use the OTP code below to continue:</p>

  <div style="margin: 20px 0; text-align: center;">
    <span style="font-size: 28px; font-weight: bold; color: #e74c3c; letter-spacing: 4px;">${otp}</span>
  </div>

  <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>

  <p style="margin-top: 30px;">Thanks,<br/><strong>WDP301 G2</strong></p>
  <hr style="margin-top: 40px;">
  <small style="color: #999;">If you’re having trouble, contact support at tranlong280403@gmail.com</small>
</div>
`;
}

export {
    sendOtpResetPassword
}
