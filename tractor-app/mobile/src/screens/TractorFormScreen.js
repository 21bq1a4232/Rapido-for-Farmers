import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createTractor, updateTractor } from '../store/slices/tractorSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const TractorFormScreen = ({ route, navigation }) => {
  const { tractorId, tractor: existingTractor } = route.params || {};
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.tractors);

  const isEditMode = !!tractorId;

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    horsepower: '',
    registrationNumber: '',
    pricePerHour: '',
    pricePerAcre: '',
    village: '',
    description: '',
    implements: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingTractor) {
      setFormData({
        brand: existingTractor.brand || '',
        model: existingTractor.model || '',
        year: existingTractor.year?.toString() || '',
        horsepower: existingTractor.horsepower?.toString() || '',
        registrationNumber: existingTractor.registrationNumber || '',
        pricePerHour: existingTractor.pricePerHour?.toString() || '',
        pricePerAcre: existingTractor.pricePerAcre?.toString() || '',
        village: existingTractor.village || '',
        description: existingTractor.description || '',
        implements: existingTractor.implements?.join(', ') || '',
      });
    }
  }, [existingTractor]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    } else {
      const year = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (year < 1950 || year > currentYear + 1) {
        newErrors.year = `Year must be between 1950 and ${currentYear + 1}`;
      }
    }

    if (!formData.horsepower) {
      newErrors.horsepower = 'Horsepower is required';
    } else if (parseFloat(formData.horsepower) <= 0) {
      newErrors.horsepower = 'Horsepower must be greater than 0';
    }

    if (!formData.pricePerHour) {
      newErrors.pricePerHour = 'Price per hour is required';
    } else if (parseFloat(formData.pricePerHour) <= 0) {
      newErrors.pricePerHour = 'Price must be greater than 0';
    }

    if (!formData.pricePerAcre) {
      newErrors.pricePerAcre = 'Price per acre is required';
    } else if (parseFloat(formData.pricePerAcre) <= 0) {
      newErrors.pricePerAcre = 'Price must be greater than 0';
    }

    if (!formData.village.trim()) {
      newErrors.village = 'Village/Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const tractorData = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        horsepower: parseFloat(formData.horsepower),
        registrationNumber: formData.registrationNumber.trim(),
        pricePerHour: parseFloat(formData.pricePerHour),
        pricePerAcre: parseFloat(formData.pricePerAcre),
        village: formData.village.trim(),
        description: formData.description.trim(),
        implements: formData.implements
          ? formData.implements.split(',').map((i) => i.trim()).filter(Boolean)
          : [],
      };

      if (isEditMode) {
        await dispatch(
          updateTractor({
            id: tractorId,
            data: tractorData,
          })
        ).unwrap();

        Alert.alert('Success', 'Tractor updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await dispatch(createTractor(tractorData)).unwrap();

        Alert.alert('Success', 'Tractor added successfully', [
          {
            text: 'Add Another',
            onPress: () => {
              setFormData({
                brand: '',
                model: '',
                year: '',
                horsepower: '',
                registrationNumber: '',
                pricePerHour: '',
                pricePerAcre: '',
                village: '',
                description: '',
                implements: '',
              });
              setErrors({});
            },
          },
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error || 'Could not save tractor');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            {isEditMode ? 'Edit Tractor' : 'Add New Tractor'}
          </Text>

          {/* Basic Information */}
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Input
            label="Brand *"
            value={formData.brand}
            onChangeText={(value) => setFormData({ ...formData, brand: value })}
            placeholder="e.g. Mahindra, John Deere"
            error={errors.brand}
          />

          <Input
            label="Model *"
            value={formData.model}
            onChangeText={(value) => setFormData({ ...formData, model: value })}
            placeholder="e.g. 575 DI"
            error={errors.model}
          />

          <View style={styles.row}>
            <Input
              label="Year *"
              value={formData.year}
              onChangeText={(value) => setFormData({ ...formData, year: value })}
              placeholder="2020"
              keyboardType="number-pad"
              error={errors.year}
              style={styles.halfInput}
            />

            <Input
              label="Horsepower *"
              value={formData.horsepower}
              onChangeText={(value) => setFormData({ ...formData, horsepower: value })}
              placeholder="50"
              keyboardType="decimal-pad"
              error={errors.horsepower}
              style={styles.halfInput}
            />
          </View>

          <Input
            label="Registration Number"
            value={formData.registrationNumber}
            onChangeText={(value) =>
              setFormData({ ...formData, registrationNumber: value.toUpperCase() })
            }
            placeholder="PB10AB1234"
            autoCapitalize="characters"
            error={errors.registrationNumber}
          />

          {/* Pricing */}
          <Text style={styles.sectionTitle}>Pricing</Text>

          <View style={styles.row}>
            <Input
              label="Price per Hour (₹) *"
              value={formData.pricePerHour}
              onChangeText={(value) =>
                setFormData({ ...formData, pricePerHour: value })
              }
              placeholder="500"
              keyboardType="decimal-pad"
              error={errors.pricePerHour}
              style={styles.halfInput}
            />

            <Input
              label="Price per Acre (₹) *"
              value={formData.pricePerAcre}
              onChangeText={(value) =>
                setFormData({ ...formData, pricePerAcre: value })
              }
              placeholder="300"
              keyboardType="decimal-pad"
              error={errors.pricePerAcre}
              style={styles.halfInput}
            />
          </View>

          {/* Location */}
          <Text style={styles.sectionTitle}>Location</Text>

          <Input
            label="Village/Location *"
            value={formData.village}
            onChangeText={(value) => setFormData({ ...formData, village: value })}
            placeholder="e.g. Jalandhar"
            error={errors.village}
          />

          {/* Additional Details */}
          <Text style={styles.sectionTitle}>Additional Details</Text>

          <Input
            label="Description"
            value={formData.description}
            onChangeText={(value) => setFormData({ ...formData, description: value })}
            placeholder="Brief description of your tractor..."
            multiline
            numberOfLines={3}
            error={errors.description}
          />

          <Input
            label="Available Implements (comma-separated)"
            value={formData.implements}
            onChangeText={(value) => setFormData({ ...formData, implements: value })}
            placeholder="e.g. Plow, Harrow, Seeder"
            error={errors.implements}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Fields marked with * are required. Make sure all details are accurate to
              attract more farmers.
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title={isEditMode ? 'Update Tractor' : 'Add Tractor'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.actionButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightBackground,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginTop: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
  },
});

export default TractorFormScreen;
