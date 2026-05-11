/**
 * MyLocationButton Component
 * Floating button to center map on user's location
 */

import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle, disabled && styles.buttonDisabled]}
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
    </AnimatedPressable>
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
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default MyLocationButton;
