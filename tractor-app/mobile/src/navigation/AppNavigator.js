import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { COLORS } from '../utils/constants';

// Auth Screens
import SplashScreen from '../screens/SplashScreen';
import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

// Main App
import MainTabNavigator from './MainTabNavigator';

// Farmer Flow Screens
import TractorListScreen from '../screens/TractorListScreen';
import TractorDetailsScreen from '../screens/TractorDetailsScreen';
import BookingFlowScreen from '../screens/BookingFlowScreen';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';

// Owner Flow Screens
import MyTractorsScreen from '../screens/MyTractorsScreen';
import TractorFormScreen from '../screens/TractorFormScreen';
import ActiveBookingsScreen from '../screens/ActiveBookingsScreen';
import EarningsScreen from '../screens/EarningsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack (Phase 9)
        <Stack.Group>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PhoneLogin"
            component={PhoneLoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OTPVerification"
            component={OTPVerificationScreen}
            options={{
              title: 'Verify OTP',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
            options={{
              title: 'Select Role',
              headerLeft: null, // Prevent going back
            }}
          />
        </Stack.Group>
      ) : (
        // Main App Stack (Phases 10-12)
        <Stack.Group>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />

          {/* Farmer Flow Screens */}
          <Stack.Screen
            name="TractorList"
            component={TractorListScreen}
            options={{
              title: 'All Tractors',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen
            name="TractorDetails"
            component={TractorDetailsScreen}
            options={{
              title: 'Tractor Details',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen
            name="BookingFlow"
            component={BookingFlowScreen}
            options={{
              title: 'Book Tractor',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen
            name="BookingHistory"
            component={BookingHistoryScreen}
            options={{
              title: 'My Bookings',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />

          {/* Owner Flow Screens */}
          <Stack.Screen
            name="MyTractors"
            component={MyTractorsScreen}
            options={{
              title: 'My Tractors',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen
            name="TractorForm"
            component={TractorFormScreen}
            options={{
              title: 'Tractor Form',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen
            name="ActiveBookings"
            component={ActiveBookingsScreen}
            options={{
              title: 'Manage Bookings',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen
            name="Earnings"
            component={EarningsScreen}
            options={{
              title: 'Earnings',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
