import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTractors } from '../store/slices/tractorSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency, calculateDistance } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';

const FarmerHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { nearbyTractors, loading } = useSelector((state) => state.tractors);
  const { user } = useSelector((state) => state.auth);

  const [location, setLocation] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [radius, setRadius] = useState(50); // 50 km default

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location permission is required to find nearby tractors.',
          [{ text: 'OK' }]
        );
        return;
      }

      await getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);
      loadNearbyTractors(coords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
    }
  };

  const loadNearbyTractors = async (coords) => {
    try {
      await dispatch(
        fetchNearbyTractors({
          lat: coords.latitude,
          lng: coords.longitude,
          radius,
        })
      ).unwrap();
    } catch (error) {
      console.error('Error loading tractors:', error);
    }
  };

  const handleRefresh = async () => {
    if (!location) {
      await getCurrentLocation();
      return;
    }

    setRefreshing(true);
    await loadNearbyTractors(location);
    setRefreshing(false);
  };

  const handleTractorPress = (tractor) => {
    navigation.navigate('TractorDetails', { tractorId: tractor._id });
  };

  const handleViewAll = () => {
    navigation.navigate('TractorList');
  };

  const renderTractorCard = ({ item: tractor }) => {
    const distance = location
      ? calculateDistance(
          location.latitude,
          location.longitude,
          tractor.location.coordinates[1],
          tractor.location.coordinates[0]
        )
      : null;

    return (
      <Card onPress={() => handleTractorPress(tractor)} style={styles.tractorCard}>
        <View style={styles.tractorHeader}>
          <View style={styles.tractorInfo}>
            <Text style={styles.tractorName}>
              {tractor.brand} {tractor.model}
            </Text>
            <Text style={styles.tractorDetails}>
              {tractor.horsepower} HP • {tractor.village}
            </Text>
          </View>
          {tractor.isAvailable && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableBadgeText}>Available</Text>
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

        {distance !== null && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceIcon}>📍</Text>
            <Text style={styles.distanceText}>{distance.toFixed(1)} km away</Text>
          </View>
        )}

        <View style={styles.ownerInfo}>
          <Text style={styles.ownerName}>Owner: {tractor.owner?.name || 'Unknown'}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>{tractor.rating?.toFixed(1) || 'N/A'}</Text>
          </View>
        </View>
      </Card>
    );
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map/List Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showMap && styles.toggleButtonActive]}
          onPress={() => setShowMap(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>
            Map View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !showMap && styles.toggleButtonActive]}
          onPress={() => setShowMap(false)}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, !showMap && styles.toggleTextActive]}>
            List View
          </Text>
        </TouchableOpacity>
      </View>

      {showMap ? (
        <>
          {/* Map View */}
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {/* User Location Marker */}
            <Marker
              coordinate={location}
              title="Your Location"
              pinColor={COLORS.secondary}
            />

            {/* Tractor Markers */}
            {nearbyTractors.map((tractor) => (
              <Marker
                key={tractor._id}
                coordinate={{
                  latitude: tractor.location.coordinates[1],
                  longitude: tractor.location.coordinates[0],
                }}
                title={`${tractor.brand} ${tractor.model}`}
                description={`${formatCurrency(tractor.pricePerHour)}/hr`}
                pinColor={tractor.isAvailable ? COLORS.success : COLORS.textLight}
                onCalloutPress={() => handleTractorPress(tractor)}
              />
            ))}
          </MapView>

          {/* Floating Info Card */}
          <View style={styles.floatingCard}>
            <Text style={styles.floatingTitle}>
              {nearbyTractors.length} tractors nearby
            </Text>
            <Button
              title="View All"
              onPress={handleViewAll}
              size="small"
              variant="outline"
            />
          </View>
        </>
      ) : (
        <>
          {/* List View */}
          <FlatList
            data={nearbyTractors}
            renderItem={renderTractorCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🚜</Text>
                <Text style={styles.emptyText}>No tractors found nearby</Text>
                <Text style={styles.emptySubtext}>
                  Try increasing the search radius or check back later
                </Text>
              </View>
            }
          />
        </>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('BookingHistory')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>📋</Text>
          <Text style={styles.quickActionText}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Wallet')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionIcon}>💰</Text>
          <Text style={styles.quickActionText}>Wallet</Text>
        </TouchableOpacity>
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
  toggleContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.borderRadius,
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 100,
    left: SIZES.padding,
    right: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
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
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distanceIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  distanceText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  ownerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ownerName: {
    fontSize: SIZES.body,
    color: COLORS.text,
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
  quickActions: {
    position: 'absolute',
    bottom: SIZES.padding,
    left: SIZES.padding,
    right: SIZES.padding,
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default FarmerHomeScreen;
