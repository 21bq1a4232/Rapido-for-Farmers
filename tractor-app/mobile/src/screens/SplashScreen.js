import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { COLORS, SIZES, STORAGE_KEYS } from '../utils/constants';
import { t, setLanguage, getCurrentLanguage } from '../utils/i18n';

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLanguageAndAuth();
  }, []);

  const checkLanguageAndAuth = async () => {
    try {
      // Check if language is already set
      const currentLang = await getCurrentLanguage();

      if (!currentLang) {
        // First time - show language selection
        setShowLanguageSelection(true);
        setLoading(false);
        return;
      }

      // Language exists - check auth token
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (token && userJson) {
        // User is logged in - navigate to main app
        const user = JSON.parse(userJson);
        dispatch({ type: 'auth/setUser', payload: { user, token } });

        // Navigate based on role
        setTimeout(() => {
          navigation.replace('Main');
        }, 1500);
      } else {
        // No auth - navigate to login
        setTimeout(() => {
          navigation.replace('PhoneLogin');
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking language/auth:', error);
      setShowLanguageSelection(true);
      setLoading(false);
    }
  };

  const handleLanguageSelect = async (lang) => {
    try {
      await setLanguage(lang);
      setShowLanguageSelection(false);
      setLoading(true);

      // After language selection, check auth
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

      setTimeout(() => {
        if (token) {
          navigation.replace('Main');
        } else {
          navigation.replace('PhoneLogin');
        }
      }, 500);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  if (showLanguageSelection) {
    return (
      <View style={styles.container}>
        <View style={styles.languageContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoEmoji}>🚜</Text>
          </View>

          <Text style={styles.title}>FarmShare</Text>
          <Text style={styles.subtitle}>Choose Your Language / अपनी भाषा चुनें</Text>

          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.8}
            >
              <Text style={styles.languageButtonText}>English</Text>
              <Text style={styles.languageButtonSubtext}>Continue in English</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageButton, styles.languageButtonHindi]}
              onPress={() => handleLanguageSelect('hi')}
              activeOpacity={0.8}
            >
              <Text style={styles.languageButtonText}>हिन्दी</Text>
              <Text style={styles.languageButtonSubtext}>हिन्दी में जारी रखें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoEmoji}>🚜</Text>
      </View>
      <Text style={styles.title}>FarmShare</Text>
      <Text style={styles.tagline}>{t('common.appTagline')}</Text>

      {loading && (
        <ActivityIndicator
          size="large"
          color={COLORS.white}
          style={styles.loader}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  languageContainer: {
    alignItems: 'center',
    width: '100%',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  tagline: {
    fontSize: SIZES.body,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.9,
  },
  languageButtons: {
    width: '100%',
    gap: 16,
  },
  languageButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  languageButtonHindi: {
    backgroundColor: COLORS.secondary,
  },
  languageButtonText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  languageButtonSubtext: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  loader: {
    marginTop: 32,
  },
});

export default SplashScreen;
