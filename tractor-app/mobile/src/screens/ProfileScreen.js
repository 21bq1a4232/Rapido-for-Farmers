import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { fetchUserProfile } from '../store/slices/userSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t, getCurrentLanguage, setLanguage } from '../utils/i18n';
import { formatPhoneNumber } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.user);

  const [currentLang, setCurrentLang] = useState('en');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
    loadLanguage();
  }, []);

  const loadProfileData = async () => {
    try {
      await dispatch(fetchUserProfile()).unwrap();
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadLanguage = async () => {
    const lang = await getCurrentLanguage();
    setCurrentLang(lang || 'en');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleLanguageToggle = async (value) => {
    const newLang = value ? 'hi' : 'en';
    setCurrentLang(newLang);
    await setLanguage(newLang);

    Alert.alert('Language Changed', 'Please restart the app to see all changes.');
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile feature coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'farmer':
        return COLORS.success;
      case 'owner':
        return COLORS.secondary;
      case 'both':
        return COLORS.primary;
      default:
        return COLORS.textLight;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'farmer':
        return '🌾';
      case 'owner':
        return '🚜';
      case 'both':
        return '⚡';
      default:
        return '👤';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'farmer':
        return 'Farmer';
      case 'owner':
        return 'Tractor Owner';
      case 'both':
        return 'Farmer & Owner';
      default:
        return 'No Role';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarIcon}>
                {getRoleIcon(user?.role)}
              </Text>
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userPhone}>
                {formatPhoneNumber(user?.phone || '')}
              </Text>

              {user?.role && (
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleBadgeColor(user.role) },
                  ]}
                >
                  <Text style={styles.roleBadgeText}>
                    {getRoleLabel(user.role)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.rating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>⭐ Rating</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.totalBookings || 0}
              </Text>
              <Text style={styles.statLabel}>📋 Bookings</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.totalEarnings || 0}
              </Text>
              <Text style={styles.statLabel}>💰 Earnings</Text>
            </View>
          </View>
        </Card>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🌐</Text>
                <View>
                  <Text style={styles.settingTitle}>Language</Text>
                  <Text style={styles.settingSubtext}>
                    {currentLang === 'hi' ? 'हिन्दी' : 'English'}
                  </Text>
                </View>
              </View>
              <Switch
                value={currentLang === 'hi'}
                onValueChange={handleLanguageToggle}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </Card>

          <Card style={styles.settingCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Alert.alert('Notifications', 'Feature coming soon!')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔔</Text>
                <View>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingSubtext}>
                    Manage notification preferences
                  </Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Card style={styles.settingCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('BookingHistory')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📋</Text>
                <Text style={styles.settingTitle}>Booking History</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </Card>

          {user?.role === 'owner' || user?.role === 'both' ? (
            <Card style={styles.settingCard}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => navigation.navigate('MyTractors')}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🚜</Text>
                  <Text style={styles.settingTitle}>My Tractors</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            </Card>
          ) : null}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <Card style={styles.settingCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Alert.alert('Help', 'Help & Support coming soon!')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>❓</Text>
                <Text style={styles.settingTitle}>Help & Support</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </Card>

          <Card style={styles.settingCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Alert.alert('About', 'FarmShare v1.0.0')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>ℹ️</Text>
                <Text style={styles.settingTitle}>About</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />

        <Text style={styles.versionText}>FarmShare v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  headerCard: {
    marginBottom: SIZES.margin,
    padding: SIZES.padding,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarIcon: {
    fontSize: 40,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.borderRadius,
  },
  roleBadgeText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.white,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  statsCard: {
    marginBottom: SIZES.margin,
    padding: SIZES.padding,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  section: {
    marginBottom: SIZES.margin * 1.5,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingCard: {
    marginBottom: 12,
    padding: SIZES.padding,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingSubtext: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  logoutButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  versionText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ProfileScreen;
