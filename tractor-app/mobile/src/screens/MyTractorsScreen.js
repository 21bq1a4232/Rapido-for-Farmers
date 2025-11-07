import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTractors, deleteTractor, updateTractor } from '../store/slices/tractorSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';

const MyTractorsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myTractors, loading } = useSelector((state) => state.tractors);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTractors();
  }, []);

  const loadTractors = async () => {
    try {
      await dispatch(fetchMyTractors()).unwrap();
    } catch (error) {
      console.error('Error loading tractors:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTractors();
    setRefreshing(false);
  };

  const handleAddTractor = () => {
    navigation.navigate('TractorForm');
  };

  const handleEditTractor = (tractor) => {
    navigation.navigate('TractorForm', { tractorId: tractor._id, tractor });
  };

  const handleDeleteTractor = (tractor) => {
    Alert.alert(
      'Delete Tractor',
      `Are you sure you want to delete ${tractor.brand} ${tractor.model}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteTractor(tractor._id)).unwrap();
              Alert.alert('Success', 'Tractor deleted successfully');
            } catch (error) {
              Alert.alert('Error', error || 'Could not delete tractor');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (tractor) => {
    try {
      await dispatch(
        updateTractor({
          id: tractor._id,
          data: { isActive: !tractor.isActive },
        })
      ).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Could not update tractor status');
    }
  };

  const renderTractorCard = ({ item: tractor }) => {
    return (
      <Card style={styles.tractorCard}>
        {/* Header */}
        <View style={styles.tractorHeader}>
          <View style={styles.tractorInfo}>
            <Text style={styles.tractorName}>
              {tractor.brand} {tractor.model}
            </Text>
            <Text style={styles.tractorDetails}>
              {tractor.horsepower} HP • {tractor.year}
            </Text>
          </View>
          <View style={styles.activeToggle}>
            <Switch
              value={tractor.isActive}
              onValueChange={() => handleToggleActive(tractor)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.success }}
              thumbColor={COLORS.white}
            />
            <Text style={styles.activeLabel}>
              {tractor.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingRow}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Per Hour</Text>
            <Text style={styles.priceValue}>{formatCurrency(tractor.pricePerHour)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Per Acre</Text>
            <Text style={styles.priceValue}>{formatCurrency(tractor.pricePerAcre)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statText}>
              {tractor.rating?.toFixed(1) || 'N/A'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statText}>
              {tractor.totalBookings || 0} bookings
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statText}>
              {formatCurrency(tractor.totalEarnings || 0)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title="Edit"
            onPress={() => handleEditTractor(tractor)}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
          <Button
            title="View Details"
            onPress={() =>
              navigation.navigate('TractorDetails', { tractorId: tractor._id })
            }
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
          <TouchableOpacity
            onPress={() => handleDeleteTractor(tractor)}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Tractors</Text>
          <Text style={styles.headerSubtitle}>
            {myTractors.length} tractor{myTractors.length !== 1 ? 's' : ''} listed
          </Text>
        </View>
        <Button
          title="➕ Add"
          onPress={handleAddTractor}
          size="small"
        />
      </View>

      {/* Tractors List */}
      <FlatList
        data={myTractors}
        renderItem={renderTractorCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚜</Text>
            <Text style={styles.emptyText}>No tractors listed yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first tractor to start receiving booking requests
            </Text>
            <Button
              title="Add Tractor"
              onPress={handleAddTractor}
              style={styles.emptyButton}
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  listContent: {
    padding: SIZES.padding,
  },
  tractorCard: {
    marginBottom: SIZES.margin,
  },
  tractorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  tractorDetails: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  activeToggle: {
    alignItems: 'center',
  },
  activeLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 4,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: COLORS.lightBackground,
    borderRadius: SIZES.borderRadius,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 20,
  },
  statText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deleteIcon: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
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
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    minWidth: 150,
  },
});

export default MyTractorsScreen;
