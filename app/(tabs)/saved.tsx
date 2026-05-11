/**
 * Saved Listings Screen - Tab 3
 * Displays user's saved/favorited properties
 */

import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontSizes, Spacing } from '../../constants/colors';
import { useListings } from '../../hooks/useListings';
import { useSaved } from '../../hooks/useSaved';
import { Listing } from '../../types';
import ListingCard from '../../components/listings/ListingCard';

/**
 * Saved listings screen component
 */
export default function SavedScreen() {
  const { listings, loading: listingsLoading } = useListings();
  const { savedIds, toggleSaved, isSaved, loading: savedLoading } = useSaved();

  // Filter listings to only show saved ones
  const savedListings = useMemo(() => {
    return listings.filter((listing) => savedIds.includes(listing.id));
  }, [listings, savedIds]);

  /**
   * Handle unsave with confirmation
   */
  const handleUnsave = useCallback(
    (id: string) => {
      const listing = listings.find((l) => l.id === id);
      const title = listing?.title || 'this listing';

      Alert.alert(
        'Remove from Saved',
        `Are you sure you want to remove "${title}" from your saved listings?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => toggleSaved(id),
          },
        ]
      );
    },
    [listings, toggleSaved]
  );

  /**
   * Render listing card
   */
  const renderItem = useCallback(
    ({ item }: { item: Listing }) => (
      <ListingCard
        listing={item}
        showSaveButton
        isSaved={isSaved(item.id)}
        onSavePress={handleUnsave}
      />
    ),
    [isSaved, handleUnsave]
  );

  /**
   * Key extractor for FlatList
   */
  const keyExtractor = useCallback((item: Listing) => item.id, []);

  /**
   * Render empty state
   */
  const renderEmptyComponent = useCallback(() => {
    if (listingsLoading || savedLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading saved listings...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="home-outline" size={80} color={Colors.gray300} />
        </View>
        <Text style={styles.emptyTitle}>No saved listings yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the heart icon on any property to save it
        </Text>
      </View>
    );
  }, [listingsLoading, savedLoading]);

  /**
   * Render header
   */
  const renderHeader = useCallback(() => {
    if (savedListings.length === 0) return null;

    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Listings</Text>
        <Text style={styles.headerCount}>
          {savedListings.length} {savedListings.length === 1 ? 'property' : 'properties'}
        </Text>
      </View>
    );
  }, [savedListings.length]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={savedListings}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          savedListings.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerCount: {
    fontSize: FontSizes.bodySmall,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.title,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
