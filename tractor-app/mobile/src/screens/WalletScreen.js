import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../store/slices/userSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency } from '../utils/helpers';
import { paymentAPI } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

const WalletScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      // Load user profile to get wallet balance
      await dispatch(fetchUserProfile()).unwrap();

      // Load transactions
      await loadTransactions();
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await paymentAPI.getPaymentHistory({ limit: 20 });
      setTransactions(response.payments || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleAddMoney = () => {
    // Navigate to AddMoney screen (to be created in future)
    Alert.alert(
      'Add Money',
      'Add Money feature will be implemented with Razorpay integration.',
      [
        { text: 'OK' },
        {
          text: 'Add ₹500 (Test)',
          onPress: () => console.log('Test add money'),
        },
      ]
    );
  };

  const walletBalance = user?.wallet || 0;
  const isLowBalance = walletBalance < 500;

  const renderTransaction = ({ item }) => {
    const isCredit = item.type === 'credit';
    const icon = isCredit ? '💰' : '💸';
    const color = isCredit ? COLORS.success : COLORS.error;

    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionRow}>
          <View style={styles.transactionLeft}>
            <Text style={styles.transactionIcon}>{icon}</Text>
            <View>
              <Text style={styles.transactionTitle}>
                {item.description || `${isCredit ? 'Credit' : 'Debit'} Transaction`}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color }]}>
              {isCredit ? '+' : '-'} {formatCurrency(item.amount)}
            </Text>
            <Text style={styles.transactionStatus}>
              {item.status || 'completed'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Wallet Balance Card */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
            <TouchableOpacity onPress={handleRefresh} disabled={loading}>
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>{formatCurrency(walletBalance)}</Text>

          {isLowBalance && (
            <View style={styles.lowBalanceWarning}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                Low balance! Add money to book tractors.
              </Text>
            </View>
          )}

          <View style={styles.balanceActions}>
            <Button
              title="Add Money"
              onPress={handleAddMoney}
              style={styles.addMoneyButton}
            />
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{profile?.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>
              {profile?.rating?.toFixed(1) || 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>💵</Text>
            <Text style={styles.statValue}>
              {formatCurrency(profile?.totalEarnings || 0)}
            </Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </Card>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingTransactions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              style={styles.transactionsList}
            />
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📜</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Your transaction history will appear here
              </Text>
            </Card>
          )}
        </View>
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
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.margin,
    padding: SIZES.padding * 1.5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: SIZES.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  refreshIcon: {
    fontSize: 20,
  },
  balanceAmount: {
    fontSize: SIZES.h1 * 1.5,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  lowBalanceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    fontSize: SIZES.small,
    color: COLORS.white,
    flex: 1,
  },
  balanceActions: {
    marginTop: 8,
  },
  addMoneyButton: {
    backgroundColor: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SIZES.margin,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.padding,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
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
  transactionsSection: {
    marginBottom: SIZES.margin,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  transactionsList: {
    marginTop: 8,
  },
  transactionCard: {
    marginBottom: 12,
    padding: SIZES.padding,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textTransform: 'capitalize',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default WalletScreen;
