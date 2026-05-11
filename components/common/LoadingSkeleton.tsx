/**
 * Loading Skeleton Component
 * Animated placeholder for loading states
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { Colors, BorderRadius } from '../../constants/colors';

/**
 * Props for LoadingSkeleton component
 */
interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Single skeleton placeholder with shimmer animation
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.small,
  style,
}) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1, // infinite
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

/**
 * Card skeleton for listing cards
 */
export const ListingCardSkeleton: React.FC = () => (
  <View style={styles.cardContainer}>
    <LoadingSkeleton width={100} height={100} borderRadius={BorderRadius.small} />
    <View style={styles.cardContent}>
      <LoadingSkeleton width="80%" height={18} style={styles.marginBottom} />
      <LoadingSkeleton width="50%" height={22} style={styles.marginBottom} />
      <LoadingSkeleton width="60%" height={14} style={styles.marginBottom} />
      <View style={styles.row}>
        <LoadingSkeleton width={60} height={14} style={styles.marginRight} />
        <LoadingSkeleton width={60} height={14} style={styles.marginRight} />
        <LoadingSkeleton width={60} height={14} />
      </View>
    </View>
  </View>
);

/**
 * Map marker skeleton
 */
export const MapMarkerSkeleton: React.FC = () => (
  <View style={styles.markerContainer}>
    <LoadingSkeleton width={60} height={28} borderRadius={BorderRadius.pill} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.gray300,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: 12,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  marginBottom: {
    marginBottom: 8,
  },
  marginRight: {
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
  },
  markerContainer: {
    padding: 4,
  },
});

export default LoadingSkeleton;
