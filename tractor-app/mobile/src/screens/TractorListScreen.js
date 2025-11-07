import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTractors } from '../store/slices/tractorSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency, calculateDistance } from '../utils/helpers';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const TractorListScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { nearbyTractors, loading } = useSelector((state) => state.tractors);

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    minHP: '',
    maxHP: '',
    maxPricePerHour: '',
    maxPricePerAcre: '',
    brand: '',
    availableOnly: false,
  });

  const [filteredTractors, setFilteredTractors] = useState([]);

  useEffect(() => {
    applyFilters();
  }, [nearbyTractors, filters]);

  const applyFilters = () => {
    let result = [...nearbyTractors];

    // Filter by horsepower
    if (filters.minHP) {
      result = result.filter((t) => t.horsepower >= parseInt(filters.minHP));
    }
    if (filters.maxHP) {
      result = result.filter((t) => t.horsepower <= parseInt(filters.maxHP));
    }

    // Filter by price per hour
    if (filters.maxPricePerHour) {
      result = result.filter((t) => t.pricePerHour <= parseInt(filters.maxPricePerHour));
    }

    // Filter by price per acre
    if (filters.maxPricePerAcre) {
      result = result.filter((t) => t.pricePerAcre <= parseInt(filters.maxPricePerAcre));
    }

    // Filter by brand
    if (filters.brand) {
      result = result.filter((t) =>
        t.brand.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    // Filter available only
    if (filters.availableOnly) {
      result = result.filter((t) => t.isAvailable);
    }

    setFilteredTractors(result);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh will use the location from previous fetch
    setRefreshing(false);
  };

  const handleClearFilters = () => {
    setFilters({
      minHP: '',
      maxHP: '',
      maxPricePerHour: '',
      maxPricePerAcre: '',
      brand: '',
      availableOnly: false,
    });
    setShowFilters(false);
  };

  const handleApplyFilters = () => {
    applyFilters();
    setShowFilters(false);
  };

  const handleTractorPress = (tractor) => {
    navigation.navigate('TractorDetails', { tractorId: tractor._id });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.minHP) count++;
    if (filters.maxHP) count++;
    if (filters.maxPricePerHour) count++;
    if (filters.maxPricePerAcre) count++;
    if (filters.brand) count++;
    if (filters.availableOnly) count++;
    return count;
  };

  const renderTractorCard = ({ item: tractor }) => {
    return (
      <Card onPress={() => handleTractorPress(tractor)} style={styles.tractorCard}>
        <View style={styles.tractorHeader}>
          <View style={styles.tractorInfo}>
            <Text style={styles.tractorName}>
              {tractor.brand} {tractor.model}
            </Text>
            <Text style={styles.tractorDetails}>
              {tractor.horsepower} HP • {tractor.year} • {tractor.village}
            </Text>
          </View>
          {tractor.isAvailable ? (
            <View style={styles.availableBadge}>
              <Text style={styles.availableBadgeText}>Available</Text>
            </View>
          ) : (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableBadgeText}>Busy</Text>
            </View>
          )}
        </View>

        <View style={styles.tractorPricing}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Per Hour</Text>
            <Text style={styles.priceValue}>{formatCurrency(tractor.pricePerHour)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Per Acre</Text>
            <Text style={styles.priceValue}>{formatCurrency(tractor.pricePerAcre)}</Text>
          </View>
        </View>

        <View style={styles.tractorFooter}>
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerLabel}>Owner:</Text>
            <Text style={styles.ownerName}>{tractor.owner?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>
              {tractor.rating?.toFixed(1) || 'N/A'}
            </Text>
            <Text style={styles.reviewCount}>
              ({tractor.totalReviews || 0})
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <View style={styles.container}>
      {/* Header with Filter Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {filteredTractors.length} Tractors Found
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.filterIcon}>🔍</Text>
          <Text style={styles.filterText}>Filters</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tractor List */}
      <FlatList
        data={filteredTractors}
        renderItem={renderTractorCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No tractors match your filters</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filter criteria
            </Text>
            {activeFilterCount > 0 && (
              <Button
                title="Clear Filters"
                onPress={handleClearFilters}
                variant="outline"
                style={styles.clearButton}
              />
            )}
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Tractors</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterForm}>
              {/* Horsepower Range */}
              <Text style={styles.filterSectionTitle}>Horsepower</Text>
              <View style={styles.filterRow}>
                <Input
                  label="Min HP"
                  value={filters.minHP}
                  onChangeText={(value) =>
                    setFilters({ ...filters, minHP: value })
                  }
                  placeholder="25"
                  keyboardType="number-pad"
                  style={styles.filterInput}
                />
                <Input
                  label="Max HP"
                  value={filters.maxHP}
                  onChangeText={(value) =>
                    setFilters({ ...filters, maxHP: value })
                  }
                  placeholder="75"
                  keyboardType="number-pad"
                  style={styles.filterInput}
                />
              </View>

              {/* Price Range */}
              <Text style={styles.filterSectionTitle}>Price</Text>
              <Input
                label="Max Price per Hour"
                value={filters.maxPricePerHour}
                onChangeText={(value) =>
                  setFilters({ ...filters, maxPricePerHour: value })
                }
                placeholder="1000"
                keyboardType="number-pad"
              />
              <Input
                label="Max Price per Acre"
                value={filters.maxPricePerAcre}
                onChangeText={(value) =>
                  setFilters({ ...filters, maxPricePerAcre: value })
                }
                placeholder="500"
                keyboardType="number-pad"
              />

              {/* Brand */}
              <Text style={styles.filterSectionTitle}>Brand</Text>
              <Input
                label="Brand Name"
                value={filters.brand}
                onChangeText={(value) =>
                  setFilters({ ...filters, brand: value })
                }
                placeholder="e.g. Mahindra, John Deere"
              />

              {/* Available Only Toggle */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() =>
                  setFilters({
                    ...filters,
                    availableOnly: !filters.availableOnly,
                  })
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    filters.availableOnly && styles.checkboxChecked,
                  ]}
                >
                  {filters.availableOnly && (
                    <Text style={styles.checkboxIcon}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Show available only</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Button
                title="Clear All"
                onPress={handleClearFilters}
                variant="outline"
                style={styles.modalActionButton}
              />
              <Button
                title="Apply Filters"
                onPress={handleApplyFilters}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.borderRadius,
    position: 'relative',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  filterText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
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
  tractorDetails: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  availableBadge: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  availableBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  unavailableBadge: {
    backgroundColor: COLORS.textLight,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  unavailableBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  tractorPricing: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
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
  tractorFooter: {
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
    color: COLORS.text,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
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
    marginBottom: 24,
  },
  clearButton: {
    minWidth: 150,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  filterForm: {
    padding: SIZES.padding,
  },
  filterSectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterInput: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxIcon: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalActionButton: {
    flex: 1,
  },
});

export default TractorListScreen;
