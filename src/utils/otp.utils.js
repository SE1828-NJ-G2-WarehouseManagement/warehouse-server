import redis from "../config/redis.js";

const saveOtp = async (email, otp) => {
  const key = `otp:${email}`;
  const ttlSeconds = 600; // 10 phút

  await redis.set(key, otp, {
    EX: ttlSeconds, // Set TTL
  });
};

const generateOtp = (length = 4) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

export {
    saveOtp,
    generateOtp
}
