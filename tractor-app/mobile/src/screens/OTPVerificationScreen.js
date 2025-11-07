import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, resendOTP, clearError } from '../store/slices/authSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatPhoneNumber } from '../utils/helpers';
import Button from '../components/Button';

const OTPVerificationScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { phone } = route.params;
  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Refs for OTP inputs
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      dispatch(clearError());
    };
  }, []);

  useEffect(() => {
    // Navigate to role selection or main app after successful verification
    if (isAuthenticated && user) {
      if (!user.role || user.role.length === 0) {
        // User hasn't selected role yet
        navigation.replace('RoleSelection');
      } else {
        // User has role - go to main app
        navigation.replace('Main');
      }
    }
  }, [isAuthenticated, user]);

  const handleOtpChange = (value, index) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '');

    if (digit.length > 1) {
      // Paste scenario - distribute digits
      const digits = digit.slice(0, 6).split('');
      const newOtp = [...otp];

      digits.forEach((d, i) => {
        if (index + i < 6) {
          newOtp[index + i] = d;
        }
      });

      setOtp(newOtp);

      // Focus last filled input or submit if complete
      const lastIndex = Math.min(index + digits.length, 5);
      if (lastIndex < 5) {
        inputRefs.current[lastIndex + 1]?.focus();
      } else if (newOtp.every((d) => d !== '')) {
        handleVerifyOTP(newOtp.join(''));
      }
      return;
    }

    // Single digit entry
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 5 && newOtp.every((d) => d !== '')) {
      handleVerifyOTP(newOtp.join(''));
    }

    // Clear error when user types
    if (error) {
      dispatch(clearError());
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    const otpString = otpCode || otp.join('');

    if (otpString.length !== 6) {
      return;
    }

    try {
      await dispatch(verifyOTP({ phone, otp: otpString })).unwrap();
      // Navigation happens via useEffect
    } catch (err) {
      console.error('Verify OTP error:', err);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await dispatch(resendOTP(phone)).unwrap();

      // Reset timer
      setCanResend(false);
      setResendTimer(60);

      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Resend OTP error:', err);
    }
  };

  const handleEditPhone = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.otp.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.otp.subtitle')} {formatPhoneNumber(phone)}
          </Text>
          <TouchableOpacity onPress={handleEditPhone} activeOpacity={0.7}>
            <Text style={styles.editPhone}>{t('auth.otp.editPhone')}</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                error && styles.otpInputError,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textContentType="oneTimeCode"
            />
          ))}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Verify Button */}
        <Button
          title={t('auth.otp.verify')}
          onPress={() => handleVerifyOTP()}
          loading={loading}
          disabled={loading || otp.some((d) => !d)}
          fullWidth
          style={styles.verifyButton}
        />

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP} activeOpacity={0.7}>
              <Text style={styles.resendText}>{t('auth.otp.resend')}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              {t('auth.otp.resendIn')} {resendTimer}s
            </Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{t('auth.otp.infoText')}</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  editPhone: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    fontSize: SIZES.h3,
    textAlign: 'center',
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBackground,
  },
  otpInputError: {
    borderColor: COLORS.error,
  },
  errorContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.body,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  timerText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  infoContainer: {
    marginTop: 32,
    backgroundColor: COLORS.lightBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  infoText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OTPVerificationScreen;
