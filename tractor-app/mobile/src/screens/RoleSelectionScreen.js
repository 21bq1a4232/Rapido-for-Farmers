import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserRole } from '../store/slices/authSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import Button from '../components/Button';

const ROLES = [
  {
    key: 'farmer',
    icon: '🌾',
    titleKey: 'auth.role.farmer.title',
    descriptionKey: 'auth.role.farmer.description',
    features: [
      'auth.role.farmer.feature1',
      'auth.role.farmer.feature2',
      'auth.role.farmer.feature3',
    ],
  },
  {
    key: 'owner',
    icon: '🚜',
    titleKey: 'auth.role.owner.title',
    descriptionKey: 'auth.role.owner.description',
    features: [
      'auth.role.owner.feature1',
      'auth.role.owner.feature2',
      'auth.role.owner.feature3',
    ],
  },
  {
    key: 'both',
    icon: '⚡',
    titleKey: 'auth.role.both.title',
    descriptionKey: 'auth.role.both.description',
    features: [
      'auth.role.both.feature1',
      'auth.role.both.feature2',
      'auth.role.both.feature3',
    ],
  },
];

const RoleSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    try {
      await dispatch(updateUserRole(selectedRole)).unwrap();

      // Navigate to main app
      navigation.replace('Main');
    } catch (err) {
      console.error('Update role error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoEmoji}>🚜</Text>
          </View>
          <Text style={styles.title}>{t('auth.role.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.role.subtitle')}</Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[
                styles.roleCard,
                selectedRole === role.key && styles.roleCardSelected,
              ]}
              onPress={() => handleRoleSelect(role.key)}
              activeOpacity={0.8}
            >
              {/* Role Icon */}
              <Text style={styles.roleIcon}>{role.icon}</Text>

              {/* Role Title */}
              <Text style={styles.roleTitle}>{t(role.titleKey)}</Text>

              {/* Role Description */}
              <Text style={styles.roleDescription}>
                {t(role.descriptionKey)}
              </Text>

              {/* Features List */}
              <View style={styles.featuresList}>
                {role.features.map((featureKey, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>✓</Text>
                    <Text style={styles.featureText}>{t(featureKey)}</Text>
                  </View>
                ))}
              </View>

              {/* Selected Indicator */}
              {selectedRole === role.key && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>
                    {t('auth.role.selected')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{t('auth.role.infoText')}</Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title={t('common.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={!selectedRole || loading}
          fullWidth
        />
      </View>
    </View>
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
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 36,
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
  rolesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBackground,
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresList: {
    width: '100%',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureBullet: {
    color: COLORS.success,
    fontSize: SIZES.body,
    fontWeight: 'bold',
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.text,
    lineHeight: 20,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  selectedBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
  },
  infoText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding + 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default RoleSelectionScreen;
