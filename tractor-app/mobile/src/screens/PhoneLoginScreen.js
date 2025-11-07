import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, clearError } from '../store/slices/authSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t, getCurrentLanguage, setLanguage } from '../utils/i18n';
import { isValidPhoneNumber } from '../utils/helpers';
import Input from '../components/Input';
import Button from '../components/Button';

const PhoneLoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error, otpSent } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    if (otpSent) {
      // Navigate to OTP verification
      navigation.navigate('OTPVerification', { phone });
    }
  }, [otpSent]);

  useEffect(() => {
    // Clear errors when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, []);

  const loadLanguage = async () => {
    const lang = await getCurrentLanguage();
    setCurrentLang(lang || 'en');
  };

  const toggleLanguage = async () => {
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    await setLanguage(newLang);
    setCurrentLang(newLang);
  };

  const validatePhone = (phoneNumber) => {
    if (!phoneNumber) {
      setPhoneError(t('auth.errors.phoneRequired'));
      return false;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setPhoneError(t('auth.errors.invalidPhone'));
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (text) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '');

    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);

    setPhone(limited);

    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      return;
    }

    try {
      await dispatch(sendOTP(phone)).unwrap();
      // Navigation happens via useEffect when otpSent becomes true
    } catch (err) {
      // Error is stored in Redux state
      console.error('Send OTP error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Language Toggle */}
        <TouchableOpacity
          style={styles.languageToggle}
          onPress={toggleLanguage}
          activeOpacity={0.7}
        >
          <Text style={styles.languageToggleText}>
            {currentLang === 'en' ? 'अ' : 'A'}
          </Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoEmoji}>🚜</Text>
          </View>
          <Text style={styles.title}>{t('auth.login.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
        </View>

        {/* Phone Input Form */}
        <View style={styles.form}>
          <Input
            label={t('auth.login.phoneLabel')}
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder={t('auth.login.phonePlaceholder')}
            keyboardType="phone-pad"
            maxLength={10}
            error={phoneError || error}
            style={styles.phoneInput}
            inputStyle={styles.phoneInputField}
          />

          <Text style={styles.hint}>{t('auth.login.phoneHint')}</Text>

          <Button
            title={t('auth.login.sendOTP')}
            onPress={handleSendOTP}
            loading={loading}
            disabled={loading || phone.length !== 10}
            fullWidth
            style={styles.button}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>{t('auth.login.infoText')}</Text>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            {t('auth.login.termsPrefix')}{' '}
            <Text style={styles.termsLink}>{t('auth.login.terms')}</Text>
            {' ' + t('common.and') + ' '}
            <Text style={styles.termsLink}>{t('auth.login.privacy')}</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.padding,
  },
  languageToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  languageToggleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoEmoji: {
    fontSize: 48,
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
  },
  form: {
    marginBottom: 32,
  },
  phoneInput: {
    marginBottom: 8,
  },
  phoneInputField: {
    fontSize: SIZES.h4,
    letterSpacing: 2,
  },
  hint: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 24,
  },
  infoText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  termsSection: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  termsText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default PhoneLoginScreen;
