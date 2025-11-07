import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings } from '../store/slices/bookingSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency, formatDateTime, getBookingStatusColor } from '../utils/helpers';
import Card from '../components/Card';

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const BookingHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.bookings);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredBookings, setFilteredBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [bookings, selectedFilter]);

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
    if (selectedFilter === 'all') {
      setFilteredBookings(bookings);
    } else if (selectedFilter === 'active') {
      setFilteredBookings(
        bookings.filter((b) => ['accepted', 'in-progress'].includes(b.status))
      );
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === selectedFilter));
    }
  };

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking._id });
  };

  const renderBookingCard = ({ item: booking }) => {
    const statusColor = getBookingStatusColor(booking.status);

    return (
      <Card onPress={() => handleBookingPress(booking)} style={styles.bookingCard}>
        {/* Header */}
        <View style={styles.bookingHeader}>
          <View style={styles.tractorInfo}>
            <Text style={styles.tractorName}>
              {booking.tractor?.brand} {booking.tractor?.model}
            </Text>
            <Text style={styles.workType}>{booking.workType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>
              {new Date(booking.startTime).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⏰</Text>
            <Text style={styles.detailText}>
              {new Date(booking.startTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          {booking.acres && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📏</Text>
              <Text style={styles.detailText}>{booking.acres} acres</Text>
            </View>
          )}
          {booking.estimatedHours && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>⏱️</Text>
              <Text style={styles.detailText}>{booking.estimatedHours} hours</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.bookingFooter}>
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerLabel}>Owner:</Text>
            <Text style={styles.ownerName}>{booking.owner?.name || 'Unknown'}</Text>
          </View>
          <Text style={styles.amount}>{formatCurrency(booking.totalAmount)}</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === item.value && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(item.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === item.value && styles.filterTabTextActive,
                ]}
              >
                {item.label}
              </Text>
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
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'all'
                ? 'Start booking tractors to see them here'
                : `No ${selectedFilter} bookings`}
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
  filterContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterList: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.lightBackground,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
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
    marginBottom: 12,
  },
  tractorInfo: {
    flex: 1,
  },
  tractorName: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  workType: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textTransform: 'capitalize',
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
  bookingDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginRight: 4,
  },
  ownerName: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
  },
  amount: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
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
  },
  emptySubtext: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default BookingHistoryScreen;
