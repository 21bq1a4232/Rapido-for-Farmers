import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { COLORS } from '../utils/constants';
import FarmerHomeScreen from '../screens/FarmerHomeScreen';
import OwnerHomeScreen from '../screens/OwnerHomeScreen';

// Placeholder screens for tabs (to be created in later phases)
const WalletScreen = () => null;
const ProfileScreen = () => null;

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  // Determine which tabs to show based on user role
  const showFarmerTabs = role === 'farmer' || role === 'both';
  const showOwnerTabs = role === 'owner' || role === 'both';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {showFarmerTabs && (
        <Tab.Screen
          name="FarmerHome"
          component={FarmerHomeScreen}
          options={{
            title: 'Find Tractors',
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => <TabIcon icon="🏠" color={color} size={size} />,
          }}
        />
      )}

      {showOwnerTabs && (
        <Tab.Screen
          name="OwnerHome"
          component={OwnerHomeScreen}
          options={{
            title: 'My Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => <TabIcon icon="📊" color={color} size={size} />,
          }}
        />
      )}

      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <TabIcon icon="💰" color={color} size={size} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <TabIcon icon="👤" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Simple emoji icon component
const TabIcon = ({ icon, color, size }) => (
  <Text style={{ fontSize: size, opacity: color === COLORS.primary ? 1 : 0.5 }}>
    {icon}
  </Text>
);

export default MainTabNavigator;
