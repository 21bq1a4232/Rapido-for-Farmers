import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
} from '../store/slices/bookingSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency, formatDateTime, getBookingStatusColor } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';

const STATUS_TABS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
];

const ActiveBookingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bookings, loading, actionLoading } = useSelector((state) => state.bookings);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [filteredBookings, setFilteredBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [bookings, selectedTab]);

  const loadBookings = async () => {
    try {
      await dispatch(fetchMyBookings()).unwrap();
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const applyFilter = () => {
    setFilteredBookings(bookings.filter((b) => b.status === selectedTab));
  };

  const handleAcceptBooking = (booking) => {
    Alert.alert(
      'Accept Booking',
      `Accept booking request from ${booking.farmer?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await dispatch(acceptBooking(booking._id)).unwrap();
              Alert.alert('Success', 'Booking accepted successfully');
            } catch (error) {
              Alert.alert('Error', error || 'Could not accept booking');
            }
          },
        },
      ]
    );
  };

  const handleRejectBooking = (booking) => {
    Alert.alert(
      'Reject Booking',
      'Are you sure you want to reject this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                rejectBooking({ id: booking._id, reason: 'Tractor not available' })
              ).unwrap();
              Alert.alert('Success', 'Booking rejected');
            } catch (error) {
              Alert.alert('Error', error || 'Could not reject booking');
            }
          },
        },
      ]
    );
  };

  const handleCompleteBooking = (booking) => {
    Alert.alert(
      'Complete Booking',
      'Mark this booking as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await dispatch(completeBooking(booking._id)).unwrap();
              Alert.alert('Success', 'Booking completed successfully');
            } catch (error) {
              Alert.alert('Error', error || 'Could not complete booking');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (booking) => {
    // Navigate to booking details
    navigation.navigate('BookingDetails', { bookingId: booking._id });
  };

  const renderBookingCard = ({ item: booking }) => {
    const statusColor = getBookingStatusColor(booking.status);

    return (
      <Card style={styles.bookingCard}>
        {/* Header */}
        <View style={styles.bookingHeader}>
          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>
              {booking.farmer?.name || 'Unknown Farmer'}
            </Text>
            <Text style={styles.farmerPhone}>
              {booking.farmer?.phone || 'N/A'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Tractor & Work Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tractor:</Text>
            <Text style={styles.detailValue}>
              {booking.tractor?.brand} {booking.tractor?.model}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Work Type:</Text>
            <Text style={[styles.detailValue, styles.capitalize]}>
              {booking.workType}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>
              {new Date(booking.startTime).toLocaleDateString()} at{' '}
              {new Date(booking.startTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          {booking.acres && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Acres:</Text>
              <Text style={styles.detailValue}>{booking.acres} acres</Text>
            </View>
          )}
          {booking.estimatedHours && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hours:</Text>
              <Text style={styles.detailValue}>{booking.estimatedHours} hours</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{booking.location}</Text>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.earningsSection}>
          <View>
            <Text style={styles.earningsLabel}>Your Earnings</Text>
            <Text style={styles.earningsValue}>
              {formatCurrency(booking.ownerEarnings || booking.totalAmount * 0.85)}
            </Text>
          </View>
          <Text style={styles.totalAmount}>
            Total: {formatCurrency(booking.totalAmount)}
          </Text>
        </View>

        {/* Actions based on status */}
        {booking.status === 'pending' && (
          <View style={styles.actionsRow}>
            <Button
              title="Reject"
              onPress={() => handleRejectBooking(booking)}
              variant="outline"
              size="small"
              style={styles.actionButton}
              disabled={actionLoading}
            />
            <Button
              title="Accept"
              onPress={() => handleAcceptBooking(booking)}
              variant="primary"
              size="small"
              style={styles.actionButton}
              loading={actionLoading}
            />
          </View>
        )}

        {booking.status === 'accepted' && (
          <View style={styles.actionsRow}>
            <Button
              title="View Details"
              onPress={() => handleViewDetails(booking)}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
            <Button
              title="Start Work"
              onPress={() => handleViewDetails(booking)}
              variant="primary"
              size="small"
              style={styles.actionButton}
            />
          </View>
        )}

        {booking.status === 'in-progress' && (
          <View style={styles.actionsRow}>
            <Button
              title="View Details"
              onPress={() => handleViewDetails(booking)}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
            <Button
              title="Complete"
              onPress={() => handleCompleteBooking(booking)}
              variant="primary"
              size="small"
              style={styles.actionButton}
              loading={actionLoading}
            />
          </View>
        )}

        {booking.status === 'completed' && (
          <Button
            title="View Details"
            onPress={() => handleViewDetails(booking)}
            variant="outline"
            size="small"
            fullWidth
          />
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === item.value && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(item.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === item.value && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
              {bookings.filter((b) => b.status === item.value).length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {bookings.filter((b) => b.status === item.value).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              No {selectedTab} bookings
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'pending'
                ? 'New booking requests will appear here'
                : `No bookings in ${selectedTab} status`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsList: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.lightBackground,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  listContent: {
    padding: SIZES.padding,
  },
  bookingCard: {
    marginBottom: SIZES.margin,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  farmerPhone: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailLabel: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  earningsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  totalAmount: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    textTransform: 'capitalize',
  },
  emptySubtext: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default ActiveBookingsScreen;
