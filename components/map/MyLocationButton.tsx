/**
 * MyLocationButton Component
 * Floating button to center map on user's location
 */

import React, { useRef } from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/colors';

/**
 * Props for MyLocationButton component
 */
interface MyLocationButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Floating button to center the map on user's current location
 */
const MyLocationButton: React.FC<MyLocationButtonProps> = ({ onPress, disabled = false }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.button, { transform: [{ scale }] }, disabled && styles.buttonDisabled]}>
      <Pressable
        style={styles.pressable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Ionicons
          name="locate"
          size={24}
          color={disabled ? Colors.gray400 : Colors.primary}
        />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 230,
    right: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.white,
    ...Shadows.medium,
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default MyLocationButton;
