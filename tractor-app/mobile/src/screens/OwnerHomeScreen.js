import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTractors } from '../store/slices/tractorSlice';
import { fetchMyBookings } from '../store/slices/bookingSlice';
import { fetchWalletBalance } from '../store/slices/userSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';

const OwnerHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myTractors, loading: tractorsLoading } = useSelector((state) => state.tractors);
  const { bookings } = useSelector((state) => state.bookings);
  const { walletBalance } = useSelector((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchMyTractors()).unwrap(),
        dispatch(fetchMyBookings()).unwrap(),
        dispatch(fetchWalletBalance()).unwrap(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Calculate stats
  const stats = {
    totalTractors: myTractors.length,
    activeTractors: myTractors.filter((t) => t.isActive).length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    activeBookings: bookings.filter((b) =>
      ['accepted', 'in-progress'].includes(b.status)
    ).length,
    completedBookings: bookings.filter((b) => b.status === 'completed').length,
    totalEarnings: bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.ownerEarnings || 0), 0),
  };

  const renderStatCard = (title, value, icon, onPress, color = COLORS.primary) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentBooking = (booking) => {
    const statusColors = {
      pending: COLORS.warning,
      accepted: COLORS.info,
      'in-progress': COLORS.success,
      completed: COLORS.textLight,
      cancelled: COLORS.error,
    };

    return (
      <TouchableOpacity
        key={booking._id}
        style={styles.bookingItem}
        onPress={() => navigation.navigate('BookingDetails', { bookingId: booking._id })}
        activeOpacity={0.7}
      >
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingFarmer}>
            {booking.farmer?.name || 'Unknown Farmer'}
          </Text>
          <Text style={styles.bookingTractor}>
            {booking.tractor?.brand} {booking.tractor?.model}
          </Text>
          <Text style={styles.bookingDate}>
            {new Date(booking.startTime).toLocaleDateString()} •{' '}
            {booking.workType}
          </Text>
        </View>
        <View style={styles.bookingRight}>
          <View
            style={[
              styles.bookingStatus,
              { backgroundColor: statusColors[booking.status] },
            ]}
          >
            <Text style={styles.bookingStatusText}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.bookingAmount}>
            {formatCurrency(booking.totalAmount)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.headerSubtext}>Here's your business overview</Text>
      </View>

      {/* Wallet Card */}
      <Card style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <View>
            <Text style={styles.walletLabel}>Available Balance</Text>
            <Text style={styles.walletAmount}>{formatCurrency(walletBalance)}</Text>
          </View>
          <Button
            title="Withdraw"
            onPress={() => navigation.navigate('Wallet')}
            size="small"
            variant="outline"
          />
        </View>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard(
          'Total Tractors',
          stats.totalTractors,
          '🚜',
          () => navigation.navigate('MyTractors'),
          COLORS.primary
        )}
        {renderStatCard(
          'Active Tractors',
          stats.activeTractors,
          '✅',
          () => navigation.navigate('MyTractors'),
          COLORS.success
        )}
        {renderStatCard(
          'Pending Requests',
          stats.pendingBookings,
          '⏳',
          () => navigation.navigate('ActiveBookings'),
          COLORS.warning
        )}
        {renderStatCard(
          'Active Bookings',
          stats.activeBookings,
          '📅',
          () => navigation.navigate('ActiveBookings'),
          COLORS.info
        )}
        {renderStatCard(
          'Completed',
          stats.completedBookings,
          '✓',
          () => navigation.navigate('Earnings'),
          COLORS.textLight
        )}
        {renderStatCard(
          'Total Earnings',
          formatCurrency(stats.totalEarnings),
          '💰',
          () => navigation.navigate('Earnings'),
          COLORS.success
        )}
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <Button
            title="➕ Add Tractor"
            onPress={() => navigation.navigate('TractorForm')}
            variant="primary"
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="📋 View All Tractors"
            onPress={() => navigation.navigate('MyTractors')}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
        </View>
      </Card>

      {/* Recent Bookings */}
      <Card style={styles.recentCard}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ActiveBookings')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllLink}>View All →</Text>
          </TouchableOpacity>
        </View>
        {bookings.length > 0 ? (
          bookings.slice(0, 5).map((booking) => renderRecentBooking(booking))
        ) : (
          <View style={styles.emptyBookings}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>
              Your booking requests will appear here
            </Text>
          </View>
        )}
      </Card>

      {/* Tips Card */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Tips to get more bookings</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• Keep your tractors active and available</Text>
          <Text style={styles.tipItem}>• Respond quickly to booking requests</Text>
          <Text style={styles.tipItem}>• Maintain good ratings from farmers</Text>
          <Text style={styles.tipItem}>• Update your tractor details regularly</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  walletCard: {
    marginBottom: 20,
    backgroundColor: COLORS.primary,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: SIZES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  walletAmount: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statInfo: {
    gap: 4,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  actionsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  recentCard: {
    marginBottom: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingFarmer: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  bookingTractor: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  bookingDate: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textTransform: 'capitalize',
  },
  bookingRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bookingStatus: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  bookingStatusText: {
    fontSize: SIZES.small,
    color: COLORS.white,
    fontWeight: '600',
  },
  bookingAmount: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  tipsCard: {
    marginBottom: 20,
    backgroundColor: COLORS.lightBackground,
  },
  tipsTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
  },
});

export default OwnerHomeScreen;
