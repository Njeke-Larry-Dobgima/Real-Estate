/**
 * ListingCard Component
 * Reusable card component for displaying property listings
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Listing } from '../../types';
import {
  Colors,
  FontSizes,
  BorderRadius,
  Shadows,
  Spacing,
} from '../../constants/colors';
import {
  formatMarkerPrice,
  formatBedroomLabel,
  formatBathroomLabel,
  formatArea,
  capitalize,
} from '../../utils/formatters';

/**
 * Props for ListingCard component
 */
interface ListingCardProps {
  listing: Listing;
  showSaveButton?: boolean;
  isSaved?: boolean;
  onSavePress?: (id: string) => void;
}

/**
 * Card component for displaying a property listing
 */
const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  showSaveButton = false,
  isSaved = false,
  onSavePress,
}) => {
  const handlePress = () => {
    router.push(`/listing/${listing.id}`);
  };

  const handleSavePress = () => {
    if (onSavePress) {
      onSavePress(listing.id);
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Thumbnail */}
      <Image
        source={{ uri: listing.images?.[0] || 'https://picsum.photos/seed/placeholder/800/600' }}
        style={styles.thumbnail}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={200}
        onError={(error) => console.log('Image load error:', error)}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>

        {/* Price */}
        <Text style={styles.price}>{formatMarkerPrice(listing.price)}</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {listing.neighborhood}, {listing.city}
          </Text>
        </View>

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
          <View style={styles.stat}>
            <Ionicons name="resize-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.statText}>{formatArea(listing.area_sqm)}</Text>
          </View>
        </View>

        {/* Availability badge */}
        <View
          style={[
            styles.availabilityBadge,
            listing.is_available ? styles.availableBadge : styles.unavailableBadge,
          ]}
        >
          <Text
            style={[
              styles.availabilityText,
              listing.is_available ? styles.availableText : styles.unavailableText,
            ]}
          >
            {listing.is_available ? 'Available' : 'Sold/Rented'}
          </Text>
        </View>
      </View>

      {/* Save button */}
      {showSaveButton && (
        <Pressable style={styles.saveButton} onPress={handleSavePress}>
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={22}
            color={isSaved ? Colors.error : Colors.gray400}
          />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.gray200,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSizes.body,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  price: {
    fontSize: FontSizes.subtitle,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
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
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.small,
    marginTop: 6,
  },
  availableBadge: {
    backgroundColor: Colors.successLight,
  },
  unavailableBadge: {
    backgroundColor: Colors.errorLight,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  availableText: {
    color: Colors.success,
  },
  unavailableText: {
    color: Colors.error,
  },
  saveButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    padding: 4,
  },
});

export default ListingCard;
