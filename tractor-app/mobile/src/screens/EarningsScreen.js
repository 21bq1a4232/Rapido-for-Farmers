import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentHistory, fetchWalletSummary } from '../store/slices/userSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';

const EarningsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { paymentHistory, walletSummary, loading } = useSelector(
    (state) => state.user
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      await Promise.all([
        dispatch(fetchPaymentHistory()).unwrap(),
        dispatch(fetchWalletSummary()).unwrap(),
      ]);
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEarningsData();
    setRefreshing(false);
  };

  const renderPaymentItem = ({ item: payment }) => {
    const isCredit = payment.type === 'owner_payout';
    const icon = isCredit ? '💰' : '💸';
    const amountColor = isCredit ? COLORS.success : COLORS.error;

    return (
      <View style={styles.paymentItem}>
        <View style={styles.paymentLeft}>
          <Text style={styles.paymentIcon}>{icon}</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentType}>
              {payment.type === 'owner_payout'
                ? 'Booking Payment'
                : payment.type === 'wallet_credit'
                ? 'Wallet Credit'
                : payment.type}
            </Text>
            <Text style={styles.paymentDate}>
              {new Date(payment.createdAt).toLocaleDateString()} •{' '}
              {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {payment.booking && (
              <Text style={styles.paymentDetails}>
                Booking #{payment.booking.slice(-6)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.paymentRight}>
          <Text style={[styles.paymentAmount, { color: amountColor }]}>
            {isCredit ? '+' : '-'}
            {formatCurrency(payment.amount)}
          </Text>
          <View
            style={[
              styles.paymentStatus,
              {
                backgroundColor:
                  payment.status === 'completed'
                    ? COLORS.success
                    : payment.status === 'failed'
                    ? COLORS.error
                    : COLORS.warning,
              },
            ]}
          >
            <Text style={styles.paymentStatusText}>{payment.status}</Text>
          </View>
        </View>
      </View>
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
      {/* Summary Cards */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Earnings</Text>
        <Text style={styles.summaryAmount}>
          {formatCurrency(walletSummary?.totalEarnings || 0)}
        </Text>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statValue}>
            {formatCurrency(walletSummary?.monthlyEarnings || 0)}
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>
            {walletSummary?.completedBookings || 0} bookings
          </Text>
        </Card>
      </View>

      {/* Payment History */}
      <Card style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Payment History</Text>
          <Text style={styles.historyCount}>
            {paymentHistory.length} transactions
          </Text>
        </View>

        {paymentHistory.length > 0 ? (
          paymentHistory.map((payment) => (
            <View key={payment._id}>
              {renderPaymentItem({ item: payment })}
            </View>
          ))
        ) : (
          <View style={styles.emptyPayments}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No payment history</Text>
            <Text style={styles.emptySubtext}>
              Your earnings from completed bookings will appear here
            </Text>
          </View>
        )}
      </Card>

      {/* Withdraw Button */}
      <Button
        title="Withdraw to Bank"
        onPress={() => navigation.navigate('Wallet')}
        fullWidth
        style={styles.withdrawButton}
      />
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
  summaryCard: {
    marginBottom: 16,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    paddingVertical: 24,
  },
  summaryTitle: {
    fontSize: SIZES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  statValue: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyCard: {
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyCount: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  paymentLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  paymentDate: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  paymentRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  paymentAmount: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paymentStatus: {
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  paymentStatusText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyPayments: {
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
    paddingHorizontal: 20,
  },
  withdrawButton: {
    marginBottom: 20,
  },
});

export default EarningsScreen;
