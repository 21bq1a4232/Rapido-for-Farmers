const twilio = require('twilio');

class SMSService {
  constructor() {
    this.smsEnabled = process.env.SMS_ENABLED === 'true';

    if (this.smsEnabled) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    }
  }

  /**
   * Send SMS message
   * @param {string} to - Phone number to send to (with country code)
   * @param {string} message - Message to send
   * @returns {Promise<object>} SMS result
   */
  async sendSMS(to, message) {
    try {
      // Format phone number with +91 if not already present
      const phoneNumber = to.startsWith('+') ? to : `+91${to}`;

      if (this.smsEnabled) {
        // Send real SMS via Twilio
        const result = await this.client.messages.create({
          body: message,
          from: this.fromNumber,
          to: phoneNumber
        });

        console.log(`📱 SMS sent to ${phoneNumber} - SID: ${result.sid}`);
        return {
          success: true,
          sid: result.sid,
          status: result.status
        };
      } else {
        // Development mode: Log to console instead of sending
        console.log('\n📱 SMS (Development Mode - Not Actually Sent)');
        console.log('='.repeat(50));
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log('='.repeat(50) + '\n');

        return {
          success: true,
          mode: 'development',
          message: 'SMS logged to console (not sent)'
        };
      }
    } catch (error) {
      console.error('❌ Error sending SMS:', error.message);
      throw new Error('Failed to send SMS');
    }
  }

  /**
   * Send OTP via SMS
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise<object>} SMS result
   */
  async sendOTP(phone, otp) {
    const message = `Your FarmShare verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send booking confirmation SMS
   * @param {string} phone - Phone number
   * @param {object} bookingDetails - Booking details
   * @returns {Promise<object>} SMS result
   */
  async sendBookingConfirmation(phone, bookingDetails) {
    const { tractorModel, startTime, otp } = bookingDetails;
    const message = `Your tractor booking (${tractorModel}) is confirmed for ${startTime}. Start OTP: ${otp}. Happy farming!`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send booking status update
   * @param {string} phone - Phone number
   * @param {string} status - New status
   * @param {string} bookingId - Booking ID
   * @returns {Promise<object>} SMS result
   */
  async sendBookingStatusUpdate(phone, status, bookingId) {
    const statusMessages = {
      accepted: 'Your booking has been accepted by the owner!',
      rejected: 'Your booking request was declined. Please try another tractor.',
      'in-progress': 'Your booking is now in progress. Safe farming!',
      completed: 'Your booking is completed. Please rate your experience.',
      cancelled: 'Your booking has been cancelled.'
    };

    const message = `FarmShare Update: ${statusMessages[status] || 'Booking status updated'} (ID: ${bookingId})`;
    return this.sendSMS(phone, message);
  }
}

// Export singleton instance
module.exports = new SMSService();
