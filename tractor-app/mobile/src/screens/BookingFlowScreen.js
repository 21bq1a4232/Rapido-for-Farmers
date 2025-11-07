import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../store/slices/bookingSlice';
import { fetchWalletBalance } from '../store/slices/userSlice';
import { COLORS, SIZES } from '../utils/constants';
import { t } from '../utils/i18n';
import { formatCurrency } from '../utils/helpers';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const WORK_TYPES = [
  { label: 'Plowing', value: 'plowing', icon: '🚜' },
  { label: 'Sowing', value: 'sowing', icon: '🌱' },
  { label: 'Harvesting', value: 'harvesting', icon: '🌾' },
  { label: 'Land Leveling', value: 'leveling', icon: '⚒️' },
  { label: 'Other', value: 'other', icon: '📋' },
];

const BookingFlowScreen = ({ route, navigation }) => {
  const { tractor } = route.params;
  const dispatch = useDispatch();
  const { loading: bookingLoading } = useSelector((state) => state.bookings);
  const { walletBalance } = useSelector((state) => state.user);

  const [step, setStep] = useState(1); // 1: Work Details, 2: Date/Time, 3: Review & Pay

  // Form state
  const [formData, setFormData] = useState({
    workType: '',
    acres: '',
    estimatedHours: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '',
    location: '',
    notes: '',
    pricingType: 'per_hour', // per_hour or per_acre
  });

  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.workType) {
      newErrors.workType = 'Please select work type';
    }

    if (formData.pricingType === 'per_acre') {
      if (!formData.acres || parseFloat(formData.acres) <= 0) {
        newErrors.acres = 'Please enter valid acres';
      }
    } else {
      if (!formData.estimatedHours || parseFloat(formData.estimatedHours) <= 0) {
        newErrors.estimatedHours = 'Please enter valid hours';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Please enter work location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Please select start date';
    } else {
      const selectedDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Please enter start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    if (formData.pricingType === 'per_acre') {
      const acres = parseFloat(formData.acres) || 0;
      return acres * tractor.pricePerAcre;
    } else {
      const hours = parseFloat(formData.estimatedHours) || 0;
      return hours * tractor.pricePerHour;
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        // Load wallet balance for review
        dispatch(fetchWalletBalance());
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmitBooking = async () => {
    const totalAmount = calculateTotalAmount();

    // Check wallet balance
    if (walletBalance < totalAmount) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${formatCurrency(totalAmount)} but have ${formatCurrency(walletBalance)}. Please add money to your wallet.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Money',
            onPress: () => navigation.navigate('Wallet'),
          },
        ]
      );
      return;
    }

    try {
      const bookingData = {
        tractor: tractor._id,
        workType: formData.workType,
        acres: formData.pricingType === 'per_acre' ? parseFloat(formData.acres) : undefined,
        estimatedHours:
          formData.pricingType === 'per_hour'
            ? parseFloat(formData.estimatedHours)
            : undefined,
        startTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
        location: formData.location,
        notes: formData.notes,
        pricingType: formData.pricingType,
      };

      await dispatch(createBooking(bookingData)).unwrap();

      Alert.alert(
        'Booking Created!',
        'Your booking request has been sent to the owner. You will be notified once they accept.',
        [
          {
            text: 'View Bookings',
            onPress: () => navigation.navigate('BookingHistory'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Booking Failed', error || 'Could not create booking. Please try again.');
    }
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContainer}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Work Details</Text>

        {/* Work Type Selection */}
        <Text style={styles.label}>Work Type *</Text>
        <View style={styles.workTypeGrid}>
          {WORK_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.workTypeButton,
                formData.workType === type.value && styles.workTypeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, workType: type.value })}
              activeOpacity={0.7}
            >
              <Text style={styles.workTypeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.workTypeText,
                  formData.workType === type.value && styles.workTypeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.workType && <Text style={styles.errorText}>{errors.workType}</Text>}

        {/* Pricing Type */}
        <Text style={styles.label}>Pricing Type *</Text>
        <View style={styles.pricingTypeContainer}>
          <TouchableOpacity
            style={[
              styles.pricingTypeButton,
              formData.pricingType === 'per_hour' && styles.pricingTypeButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, pricingType: 'per_hour' })}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pricingTypeText,
                formData.pricingType === 'per_hour' && styles.pricingTypeTextActive,
              ]}
            >
              Per Hour
            </Text>
            <Text style={styles.pricingTypePrice}>
              {formatCurrency(tractor.pricePerHour)}/hr
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pricingTypeButton,
              formData.pricingType === 'per_acre' && styles.pricingTypeButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, pricingType: 'per_acre' })}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pricingTypeText,
                formData.pricingType === 'per_acre' && styles.pricingTypeTextActive,
              ]}
            >
              Per Acre
            </Text>
            <Text style={styles.pricingTypePrice}>
              {formatCurrency(tractor.pricePerAcre)}/acre
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conditional Input based on pricing type */}
        {formData.pricingType === 'per_acre' ? (
          <Input
            label="Acres to Cover *"
            value={formData.acres}
            onChangeText={(value) => setFormData({ ...formData, acres: value })}
            placeholder="10"
            keyboardType="decimal-pad"
            error={errors.acres}
          />
        ) : (
          <Input
            label="Estimated Hours *"
            value={formData.estimatedHours}
            onChangeText={(value) => setFormData({ ...formData, estimatedHours: value })}
            placeholder="5"
            keyboardType="decimal-pad"
            error={errors.estimatedHours}
          />
        )}

        {/* Work Location */}
        <Input
          label="Work Location *"
          value={formData.location}
          onChangeText={(value) => setFormData({ ...formData, location: value })}
          placeholder="Enter field location or address"
          error={errors.location}
        />

        {/* Additional Notes */}
        <Input
          label="Additional Notes (Optional)"
          value={formData.notes}
          onChangeText={(value) => setFormData({ ...formData, notes: value })}
          placeholder="Any special instructions..."
          multiline
          numberOfLines={3}
        />
      </Card>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Schedule</Text>

        <Input
          label="Start Date *"
          value={formData.startDate}
          onChangeText={(value) => setFormData({ ...formData, startDate: value })}
          placeholder="YYYY-MM-DD"
          error={errors.startDate}
        />

        <Input
          label="Start Time *"
          value={formData.startTime}
          onChangeText={(value) => setFormData({ ...formData, startTime: value })}
          placeholder="09:00"
          error={errors.startTime}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            The owner will confirm the exact timing. You will be notified once they accept
            your booking request.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );

  const renderStep3 = () => {
    const totalAmount = calculateTotalAmount();

    return (
      <ScrollView style={styles.stepContainer}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Review & Confirm</Text>

          {/* Tractor Details */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Tractor</Text>
            <Text style={styles.reviewText}>
              {tractor.brand} {tractor.model} ({tractor.horsepower} HP)
            </Text>
          </View>

          {/* Work Details */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Work Details</Text>
            <Text style={styles.reviewText}>
              Type: {WORK_TYPES.find((t) => t.value === formData.workType)?.label}
            </Text>
            {formData.pricingType === 'per_acre' ? (
              <Text style={styles.reviewText}>Acres: {formData.acres}</Text>
            ) : (
              <Text style={styles.reviewText}>Hours: {formData.estimatedHours}</Text>
            )}
            <Text style={styles.reviewText}>Location: {formData.location}</Text>
          </View>

          {/* Schedule */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Schedule</Text>
            <Text style={styles.reviewText}>
              Date: {new Date(formData.startDate).toLocaleDateString()}
            </Text>
            <Text style={styles.reviewText}>Time: {formData.startTime}</Text>
          </View>

          {/* Payment Summary */}
          <View style={styles.paymentSummary}>
            <Text style={styles.paymentTitle}>Payment Summary</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>
                {formData.pricingType === 'per_acre'
                  ? `${formData.acres} acres × ${formatCurrency(tractor.pricePerAcre)}`
                  : `${formData.estimatedHours} hours × ${formatCurrency(tractor.pricePerHour)}`}
              </Text>
              <Text style={styles.paymentValue}>{formatCurrency(totalAmount)}</Text>
            </View>
            <View style={[styles.paymentRow, styles.paymentTotal]}>
              <Text style={styles.paymentTotalLabel}>Total Amount</Text>
              <Text style={styles.paymentTotalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>

          {/* Wallet Balance */}
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Your Wallet Balance</Text>
            <Text
              style={[
                styles.walletBalance,
                walletBalance < totalAmount && styles.walletBalanceInsufficient,
              ]}
            >
              {formatCurrency(walletBalance)}
            </Text>
            {walletBalance < totalAmount && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Wallet')}
                activeOpacity={0.7}
              >
                <Text style={styles.addMoneyLink}>Add Money →</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
            <Text style={styles.progressStepText}>1</Text>
          </View>
          <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
          <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
            <Text style={styles.progressStepText}>2</Text>
          </View>
          <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
          <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]}>
            <Text style={styles.progressStepText}>3</Text>
          </View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Details</Text>
          <Text style={styles.progressLabel}>Schedule</Text>
          <Text style={styles.progressLabel}>Review</Text>
        </View>
      </View>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title={step === 1 ? 'Cancel' : 'Back'}
          onPress={handleBack}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title={step === 3 ? 'Confirm Booking' : 'Next'}
          onPress={step === 3 ? handleSubmitBooking : handleNext}
          loading={bookingLoading}
          style={styles.actionButton}
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
  progressContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
  },
  progressStepText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    flex: 1,
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  card: {
    marginBottom: SIZES.margin,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  workTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  workTypeButton: {
    width: '48%',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    alignItems: 'center',
  },
  workTypeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBackground,
  },
  workTypeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  workTypeText: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  workTypeTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.small,
    marginTop: -12,
    marginBottom: 12,
  },
  pricingTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pricingTypeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    alignItems: 'center',
  },
  pricingTypeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBackground,
  },
  pricingTypeText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    marginBottom: 4,
  },
  pricingTypeTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  pricingTypePrice: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
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
  reviewSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reviewSectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentSummary: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  paymentValue: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  paymentTotalLabel: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentTotalValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  walletInfo: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  walletBalanceInsufficient: {
    color: COLORS.error,
  },
  addMoneyLink: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 8,
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

export default BookingFlowScreen;
