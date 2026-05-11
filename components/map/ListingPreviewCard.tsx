/**
 * ListingPreviewCard Component
 * Bottom sheet preview card shown when a map marker is tapped
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';

import { Listing } from '../../types';
import { Colors, FontSizes, BorderRadius, Shadows, Spacing } from '../../constants/colors';
import { formatMarkerPrice, formatBedroomLabel, formatBathroomLabel } from '../../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 120;

/**
 * Props for ListingPreviewCard component
 */
interface ListingPreviewCardProps {
  listing: Listing | null;
  visible: boolean;
  onClose: () => void;
}

/**
 * Preview card component that slides up from the bottom
 * Shows a brief overview of the selected listing
 */
const ListingPreviewCard: React.FC<ListingPreviewCardProps> = ({
  listing,
  visible,
  onClose,
}) => {
  const translateY = useSharedValue(CARD_HEIGHT + 100);

  // Animate card in/out based on visibility
  React.useEffect(() => {
    if (visible && listing) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });
    } else {
      translateY.value = withTiming(CARD_HEIGHT + 100, { duration: 200 });
    }
  }, [visible, listing, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Pan gesture for dismissing the card
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 50 || event.velocityY > 500) {
        translateY.value = withTiming(CARD_HEIGHT + 100, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  const handlePress = () => {
    if (listing) {
      router.push(`/listing/${listing.id}`);
    }
  };

  if (!listing) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.handle} />
        <Pressable style={styles.card} onPress={handlePress}>
          {/* Thumbnail */}
          <Image
            source={{ uri: listing.images[0] }}
            style={styles.thumbnail}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={200}
          />

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.price}>{formatMarkerPrice(listing.price)}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {listing.title}
            </Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {listing.bedrooms > 0 && (
                <View style={styles.stat}>
                  <Ionicons name="bed-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{formatBedroomLabel(listing.bedrooms)}</Text>
                </View>
              )}
              {listing.bathrooms > 0 && (
                <View style={styles.stat}>
                  <Ionicons name="water-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{formatBathroomLabel(listing.bathrooms)}</Text>
                </View>
              )}
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {listing.neighborhood}, {listing.city}
              </Text>
            </View>
          </View>

          {/* Arrow indicator */}
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.card,
    ...Shadows.large,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.gray200,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  price: {
    fontSize: FontSizes.subtitle,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSizes.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  statText: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  arrowContainer: {
    paddingLeft: Spacing.sm,
  },
});

export default ListingPreviewCard;
