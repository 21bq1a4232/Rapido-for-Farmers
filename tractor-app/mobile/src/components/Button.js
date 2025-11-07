import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { COLORS, SIZES } from '../utils/constants';

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary, secondary, outline, danger
  size = 'medium', // small, medium, large
  fullWidth = false,
  icon = null,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const styles = [buttonStyles.base];

    // Size
    if (size === 'small') styles.push(buttonStyles.small);
    if (size === 'large') styles.push(buttonStyles.large);

    // Variant
    if (variant === 'primary') styles.push(buttonStyles.primary);
    if (variant === 'secondary') styles.push(buttonStyles.secondary);
    if (variant === 'outline') styles.push(buttonStyles.outline);
    if (variant === 'danger') styles.push(buttonStyles.danger);

    // States
    if (disabled || loading) styles.push(buttonStyles.disabled);
    if (fullWidth) styles.push(buttonStyles.fullWidth);

    return styles;
  };

  const getTextStyle = () => {
    const styles = [buttonStyles.text];

    if (size === 'small') styles.push(buttonStyles.textSmall);
    if (size === 'large') styles.push(buttonStyles.textLarge);

    if (variant === 'outline') styles.push(buttonStyles.textOutline);

    return styles;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <View style={buttonStyles.content}>
          {icon && <View style={buttonStyles.icon}>{icon}</View>}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: SIZES.small,
  },
  textLarge: {
    fontSize: SIZES.h4,
  },
  textOutline: {
    color: COLORS.primary,
  },
});

export default Button;
