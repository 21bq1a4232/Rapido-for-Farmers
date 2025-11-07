import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

const translations = {
  en: {
    common: {
      appName: 'FarmShare',
      appTagline: 'Rent Tractors, Grow Together',
      welcome: 'Welcome',
      continue: 'Continue',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      and: 'and',
    },

    auth: {
      login: {
        title: 'Welcome to FarmShare',
        subtitle: 'Enter your phone number to continue',
        phoneLabel: 'Phone Number',
        phonePlaceholder: '9876543210',
        phoneHint: 'Enter 10-digit mobile number without +91',
        sendOTP: 'Send OTP',
        infoText: 'We will send you a one-time password (OTP) to verify your phone number.',
        termsPrefix: 'By continuing, you agree to our',
        terms: 'Terms & Conditions',
        privacy: 'Privacy Policy',
      },
      otp: {
        title: 'Verify OTP',
        subtitle: 'Enter the OTP sent to',
        editPhone: 'Change Number',
        verify: 'Verify',
        resend: 'Resend OTP',
        resendIn: 'Resend in',
        infoText: 'Please enter the 6-digit code sent to your phone number.',
      },
      role: {
        title: 'Tell us about yourself',
        subtitle: 'Select your role to personalize your experience',
        selected: 'Selected',
        infoText: 'You can change your role anytime from settings',
        farmer: {
          title: 'I am a Farmer',
          description: 'Looking to rent tractors for farming',
          feature1: 'Find nearby tractors instantly',
          feature2: 'Book and track in real-time',
          feature3: 'Secure payments with wallet',
        },
        owner: {
          title: 'I am a Tractor Owner',
          description: 'Want to rent out my tractors',
          feature1: 'List your tractors for free',
          feature2: 'Manage bookings easily',
          feature3: 'Earn money from idle tractors',
        },
        both: {
          title: 'I am Both',
          description: 'Farmer and tractor owner',
          feature1: 'Access all features',
          feature2: 'Rent and lend tractors',
          feature3: 'Flexible role switching',
        },
      },
      errors: {
        phoneRequired: 'Phone number is required',
        invalidPhone: 'Please enter a valid 10-digit phone number',
        otpRequired: 'OTP is required',
        invalidOTP: 'Invalid OTP',
      },
    },

    // Home
    search_tractors: 'Search Tractors',
    nearby_tractors: 'Nearby Tractors',
    my_bookings: 'My Bookings',
    my_tractors: 'My Tractors',
    profile: 'Profile',
    wallet: 'Wallet',

    // Tractor
    tractor_details: 'Tractor Details',
    horsepower: 'Horsepower',
    price_per_hour: 'Price per Hour',
    price_per_acre: 'Price per Acre',
    book_now: 'Book Now',
    available: 'Available',
    not_available: 'Not Available',

    // Booking
    create_booking: 'Create Booking',
    booking_details: 'Booking Details',
    start_time: 'Start Time',
    duration: 'Duration',
    hours: 'Hours',
    acres: 'Acres',
    work_type: 'Work Type',
    total_amount: 'Total Amount',
    confirm_booking: 'Confirm Booking',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',

    // Payment
    add_money: 'Add Money',
    pay_now: 'Pay Now',
    payment_successful: 'Payment Successful',
    insufficient_balance: 'Insufficient Balance',
    wallet_balance: 'Wallet Balance',

    // Errors
    network_error: 'Network error. Please check your connection.',
    server_error: 'Server error. Please try again.',
    unauthorized: 'Please login to continue.',
    not_found: 'Not found.',
    validation_error: 'Please check your input.',
  },

  hi: {
    common: {
      appName: 'फार्मशेयर',
      appTagline: 'ट्रैक्टर किराए पर लें, साथ बढ़ें',
      welcome: 'स्वागत है',
      continue: 'जारी रखें',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      confirm: 'पुष्टि करें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      and: 'और',
    },

    auth: {
      login: {
        title: 'फार्मशेयर में आपका स्वागत है',
        subtitle: 'जारी रखने के लिए अपना फ़ोन नंबर दर्ज करें',
        phoneLabel: 'फ़ोन नंबर',
        phonePlaceholder: '9876543210',
        phoneHint: '+91 के बिना 10 अंकों का मोबाइल नंबर दर्ज करें',
        sendOTP: 'OTP भेजें',
        infoText: 'हम आपके फ़ोन नंबर को सत्यापित करने के लिए एक OTP भेजेंगे।',
        termsPrefix: 'जारी रखकर, आप हमारे',
        terms: 'नियम और शर्तें',
        privacy: 'गोपनीयता नीति',
      },
      otp: {
        title: 'OTP सत्यापित करें',
        subtitle: 'इस नंबर पर भेजा गया OTP दर्ज करें',
        editPhone: 'नंबर बदलें',
        verify: 'सत्यापित करें',
        resend: 'OTP फिर से भेजें',
        resendIn: 'फिर से भेजें',
        infoText: 'कृपया आपके फ़ोन नंबर पर भेजा गया 6 अंकों का कोड दर्ज करें।',
      },
      role: {
        title: 'हमें अपने बारे में बताएं',
        subtitle: 'अपना अनुभव वैयक्तिकृत करने के लिए अपनी भूमिका चुनें',
        selected: 'चयनित',
        infoText: 'आप सेटिंग्स से कभी भी अपनी भूमिका बदल सकते हैं',
        farmer: {
          title: 'मैं किसान हूँ',
          description: 'खेती के लिए ट्रैक्टर किराए पर लेना चाहता हूँ',
          feature1: 'पास के ट्रैक्टर तुरंत खोजें',
          feature2: 'रियल-टाइम में बुक और ट्रैक करें',
          feature3: 'वॉलेट से सुरक्षित भुगतान',
        },
        owner: {
          title: 'मैं ट्रैक्टर मालिक हूँ',
          description: 'अपने ट्रैक्टर किराए पर देना चाहता हूँ',
          feature1: 'अपने ट्रैक्टर मुफ्त में सूचीबद्ध करें',
          feature2: 'बुकिंग आसानी से प्रबंधित करें',
          feature3: 'खाली ट्रैक्टर से पैसे कमाएं',
        },
        both: {
          title: 'मैं दोनों हूँ',
          description: 'किसान और ट्रैक्टर मालिक',
          feature1: 'सभी सुविधाओं तक पहुंच',
          feature2: 'ट्रैक्टर किराए पर लें और दें',
          feature3: 'लचीली भूमिका स्विचिंग',
        },
      },
      errors: {
        phoneRequired: 'फ़ोन नंबर आवश्यक है',
        invalidPhone: 'कृपया मान्य 10 अंकों का फ़ोन नंबर दर्ज करें',
        otpRequired: 'OTP आवश्यक है',
        invalidOTP: 'अमान्य OTP',
      },
    },

    // Home
    search_tractors: 'ट्रैक्टर खोजें',
    nearby_tractors: 'पास के ट्रैक्टर',
    my_bookings: 'मेरी बुकिंग',
    my_tractors: 'मेरे ट्रैक्टर',
    profile: 'प्रोफ़ाइल',
    wallet: 'वॉलेट',

    // Tractor
    tractor_details: 'ट्रैक्टर विवरण',
    horsepower: 'हॉर्सपावर',
    price_per_hour: 'प्रति घंटा किराया',
    price_per_acre: 'प्रति एकड़ किराया',
    book_now: 'अभी बुक करें',
    available: 'उपलब्ध',
    not_available: 'उपलब्ध नहीं',

    // Booking
    create_booking: 'बुकिंग करें',
    booking_details: 'बुकिंग विवरण',
    start_time: 'शुरुआत का समय',
    duration: 'अवधि',
    hours: 'घंटे',
    acres: 'एकड़',
    work_type: 'काम का प्रकार',
    total_amount: 'कुल राशि',
    confirm_booking: 'बुकिंग पक्का करें',
    pending: 'लंबित',
    accepted: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    in_progress: 'चल रहा है',
    completed: 'पूर्ण',
    cancelled: 'रद्द',

    // Payment
    add_money: 'पैसे जोड़ें',
    pay_now: 'अभी भुगतान करें',
    payment_successful: 'भुगतान सफल',
    insufficient_balance: 'अपर्याप्त शेष',
    wallet_balance: 'वॉलेट बैलेंस',

    // Errors
    network_error: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
    server_error: 'सर्वर त्रुटि। कृपया पुनः प्रयास करें।',
    unauthorized: 'जारी रखने के लिए कृपया लॉगिन करें।',
    not_found: 'नहीं मिला।',
    validation_error: 'कृपया अपना इनपुट जांचें।',
  },
};

let currentLanguage = 'hi'; // Default to Hindi

export const setLanguage = async (lang) => {
  currentLanguage = lang;
  await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
};

export const getCurrentLanguage = async () => {
  const savedLang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
  return savedLang || currentLanguage;
};

export const t = (key) => {
  // Support nested keys like 'auth.login.title'
  const keys = key.split('.');
  let value = translations[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if path not found
    }
  }

  return value || key;
};

export const initializeLanguage = async () => {
  const savedLang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
  if (savedLang) {
    currentLanguage = savedLang;
  }
};

export default {
  t,
  setLanguage,
  getCurrentLanguage,
  initializeLanguage,
};
