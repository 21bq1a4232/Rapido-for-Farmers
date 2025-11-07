/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} Generated OTP
 */
const generateOTP = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return otp.toString();
};

/**
 * Check if OTP has expired
 * @param {Date} expiryTime - OTP expiry time
 * @returns {boolean} True if expired
 */
const isOTPExpired = (expiryTime) => {
  return Date.now() > new Date(expiryTime).getTime();
};

/**
 * Get OTP expiry time (default: 5 minutes from now)
 * @param {number} minutes - Minutes until expiry (default: 5)
 * @returns {Date} Expiry date
 */
const getOTPExpiry = (minutes = 5) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = {
  generateOTP,
  isOTPExpired,
  getOTPExpiry
};
