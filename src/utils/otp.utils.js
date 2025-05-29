import redis from "../config/redis.js";

const saveOtp = async (email, otp) => {
  const key = `otp:${email}`;
  const ttlSeconds = 600; // 10 phút

  await redis.set(key, otp, {
    EX: ttlSeconds, // Set TTL
  });
};

const saveOtpVerified = async (email) => {
  const key = `otp_verified:${email}`;
  const ttlSeconds = 300; // 5 phút

  await redis.set(key, "TRUE", {
    EX: ttlSeconds, // Set TTL
  });
};

const getOtpStored = async (email) => {
  const key = `otp:${email}`;
  const otpStored = await redis.get(key);
  return otpStored;
}

const getOtpVerified = async (email) => {
  const key = `otp_verified:${email}`;
  const otpVerified = await redis.get(key);
  return otpVerified === "TRUE";
}


const deleteOtpStored = async (email) => {
  const key = `otp:${email}`;
  await redis.del(key);
}

const deleteOtpVerified = async (email) => {
  const key = `otp_verified:${email}`;
  await redis.del(key);
}

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
    saveOtpVerified,
    generateOtp,
    getOtpStored,
    getOtpVerified,
    deleteOtpStored,
    deleteOtpVerified
}
