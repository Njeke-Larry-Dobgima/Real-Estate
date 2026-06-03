/**
 * ListingCard Component
 * Reusable card component for displaying property listings
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
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

  const imageUrl = listing.images?.[0];
  const hasValidImage = imageUrl && imageUrl.trim() !== '' && imageUrl !== 'null' && imageUrl !== 'undefined';

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Thumbnail */}
      {hasValidImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          onError={(error) => console.log('Image load error:', error.nativeEvent?.error)}
        />
      ) : (
        <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
          <Ionicons name="home-outline" size={32} color={Colors.gray400} />
        </View>
      )}

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
  placeholderThumbnail: {
    alignItems: 'center',
    justifyContent: 'center',
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
