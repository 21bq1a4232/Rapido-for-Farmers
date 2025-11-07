import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTractorById } from '../store/slices/tractorSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency, formatPhoneNumber } from '../utils/helpers';
import Button from '../components/Button';
import Card from '../components/Card';

const TractorDetailsScreen = ({ route, navigation }) => {
  const { tractorId } = route.params;
  const dispatch = useDispatch();
  const { selectedTractor, loading } = useSelector((state) => state.tractors);

  const [activeTab, setActiveTab] = useState('details'); // details, specifications, reviews

  useEffect(() => {
    loadTractorDetails();
  }, [tractorId]);

  const loadTractorDetails = async () => {
    try {
      await dispatch(fetchTractorById(tractorId)).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Could not load tractor details');
      navigation.goBack();
    }
  };

  const handleBookNow = () => {
    if (!selectedTractor.isAvailable) {
      Alert.alert('Not Available', 'This tractor is currently not available for booking.');
      return;
    }

    navigation.navigate('BookingFlow', { tractor: selectedTractor });
  };

  const handleCallOwner = () => {
    if (selectedTractor?.owner?.phone) {
      const phoneNumber = `tel:${selectedTractor.owner.phone}`;
      Linking.openURL(phoneNumber);
    }
  };

  if (loading || !selectedTractor) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading tractor details...</Text>
      </View>
    );
  }

  const tractor = selectedTractor;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.tractorHeader}>
            <View style={styles.tractorTitleContainer}>
              <Text style={styles.tractorTitle}>
                {tractor.brand} {tractor.model}
              </Text>
              <Text style={styles.tractorSubtitle}>
                {tractor.year} • {tractor.horsepower} HP
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

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Per Hour</Text>
              <Text style={styles.priceValue}>{formatCurrency(tractor.pricePerHour)}</Text>
            </View>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Per Acre</Text>
              <Text style={styles.priceValue}>{formatCurrency(tractor.pricePerAcre)}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>
                {tractor.rating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.reviewCount}>
                ({tractor.totalReviews || 0} reviews)
              </Text>
            </View>
          </View>
        </Card>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.tabActive]}
            onPress={() => setActiveTab('details')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}
            >
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'specifications' && styles.tabActive]}
            onPress={() => setActiveTab('specifications')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'specifications' && styles.tabTextActive,
              ]}
            >
              Specifications
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <Card style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {tractor.description || 'No description available.'}
            </Text>

            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>{tractor.village}</Text>
            </View>

            <Text style={styles.sectionTitle}>Available Implements</Text>
            {tractor.implements && tractor.implements.length > 0 ? (
              <View style={styles.implementsContainer}>
                {tractor.implements.map((implement, index) => (
                  <View key={index} style={styles.implementChip}>
                    <Text style={styles.implementText}>{implement}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No implements listed</Text>
            )}

            <Text style={styles.sectionTitle}>Owner Information</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{tractor.owner?.name || 'Unknown'}</Text>
                <Text style={styles.ownerPhone}>
                  {formatPhoneNumber(tractor.owner?.phone)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallOwner}
                activeOpacity={0.7}
              >
                <Text style={styles.callButtonText}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {activeTab === 'specifications' && (
          <Card style={styles.contentCard}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Brand</Text>
              <Text style={styles.specValue}>{tractor.brand}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Model</Text>
              <Text style={styles.specValue}>{tractor.model}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Year</Text>
              <Text style={styles.specValue}>{tractor.year}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Horsepower</Text>
              <Text style={styles.specValue}>{tractor.horsepower} HP</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Registration Number</Text>
              <Text style={styles.specValue}>
                {tractor.registrationNumber || 'N/A'}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Fuel Type</Text>
              <Text style={styles.specValue}>
                {tractor.fuelType || 'Diesel'}
              </Text>
            </View>
          </Card>
        )}

        {activeTab === 'reviews' && (
          <Card style={styles.contentCard}>
            {tractor.reviews && tractor.reviews.length > 0 ? (
              tractor.reviews.map((review, index) => (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.farmerName}</Text>
                    <View style={styles.reviewRating}>
                      <Text style={styles.ratingIcon}>⭐</Text>
                      <Text style={styles.reviewRatingText}>{review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noReviewsContainer}>
                <Text style={styles.noReviewsIcon}>⭐</Text>
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSubtext}>
                  Be the first to book and review this tractor
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Spacing for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.bottomPriceLabel}>Starting from</Text>
          <Text style={styles.bottomPriceValue}>
            {formatCurrency(Math.min(tractor.pricePerHour, tractor.pricePerAcre))}/unit
          </Text>
        </View>
        <Button
          title="Book Now"
          onPress={handleBookNow}
          disabled={!tractor.isAvailable}
          style={styles.bookButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  headerCard: {
    marginBottom: SIZES.margin,
  },
  tractorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tractorTitleContainer: {
    flex: 1,
  },
  tractorTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  tractorSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  availableBadge: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  availableBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  unavailableBadge: {
    backgroundColor: COLORS.textLight,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  unavailableBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  priceCard: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
    borderRadius: SIZES.borderRadius,
    padding: 12,
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
  ratingRow: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  ratingText: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 4,
    marginBottom: SIZES.margin,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.borderRadius,
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
  contentCard: {
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  infoText: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  implementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  implementChip: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  implementText: {
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  noDataText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  ownerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    borderRadius: SIZES.borderRadius,
    padding: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  ownerPhone: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  callButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specLabel: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  specValue: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReviewsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noReviewsText: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  noReviewsSubtext: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceInfo: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  bottomPriceValue: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bookButton: {
    flex: 1,
  },
});

export default TractorDetailsScreen;
