/**
 * Loading Skeleton Component
 * Animated placeholder for loading states
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue, Animated } from 'react-native';

import { Colors, BorderRadius } from '../../constants/colors';

/**
 * Props for LoadingSkeleton component
 */
interface LoadingSkeletonProps {
  width?: DimensionValue;
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
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { opacity },
        style,
        {
          width,
          height,
          borderRadius,
        },
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
