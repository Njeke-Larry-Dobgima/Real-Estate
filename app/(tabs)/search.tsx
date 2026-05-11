/**
 * Search & Filter Screen - Tab 2
 * Allows users to search and filter property listings
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors, FontSizes, BorderRadius, Shadows, Spacing } from '../../constants/colors';
import { useListings } from '../../hooks/useListings';
import { useFilters } from '../../hooks/useFilters';
import { useSaved } from '../../hooks/useSaved';
import { applyFilters } from '../../utils/filters';
import { PropertyType, Listing } from '../../types';
import ListingCard from '../../components/listings/ListingCard';

/**
 * Property type filter options
 */
const PROPERTY_TYPES: { label: string; value: PropertyType | null }[] = [
  { label: 'All', value: null },
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Land', value: 'land' },
  { label: 'Commercial', value: 'commercial' },
];

/**
 * Bedroom filter options
 */
const BEDROOM_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any', value: null },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5+', value: 5 },
];

/**
 * Search screen component
 */
export default function SearchScreen() {
  const { listings, loading } = useListings();
  const { filters, setFilters, resetFilters, activeFilterCount } = useFilters();
  const { isSaved, toggleSaved } = useSaved();

  // Local state for text inputs
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery || '');
  const [localMinPrice, setLocalMinPrice] = useState(
    filters.minPrice ? filters.minPrice.toString() : ''
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    filters.maxPrice ? filters.maxPrice.toString() : ''
  );

  // Apply filters to get results
  const filteredListings = useMemo(() => {
    const currentFilters = {
      ...filters,
      searchQuery: localSearchQuery,
      minPrice: localMinPrice ? parseInt(localMinPrice, 10) : null,
      maxPrice: localMaxPrice ? parseInt(localMaxPrice, 10) : null,
    };
    return applyFilters(listings, currentFilters);
  }, [listings, filters, localSearchQuery, localMinPrice, localMaxPrice]);

  /**
   * Handle property type selection
   */
  const handleTypeSelect = useCallback(
    (type: PropertyType | null) => {
      setFilters({ type });
    },
    [setFilters]
  );

  /**
   * Handle bedroom selection
   */
  const handleBedroomSelect = useCallback(
    (bedrooms: number | null) => {
      setFilters({ bedrooms });
    },
    [setFilters]
  );

  /**
   * Handle availability toggle
   */
  const handleAvailabilityToggle = useCallback(() => {
    setFilters({ availableOnly: !filters.availableOnly });
  }, [filters.availableOnly, setFilters]);

  /**
   * Handle apply filters and navigate to map
   */
  const handleApplyFilters = useCallback(() => {
    setFilters({
      searchQuery: localSearchQuery,
      minPrice: localMinPrice ? parseInt(localMinPrice, 10) : null,
      maxPrice: localMaxPrice ? parseInt(localMaxPrice, 10) : null,
    });
    router.push('/(tabs)/');
  }, [setFilters, localSearchQuery, localMinPrice, localMaxPrice]);

  /**
   * Handle reset filters
   */
  const handleReset = useCallback(() => {
    resetFilters();
    setLocalSearchQuery('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
  }, [resetFilters]);

  /**
   * Handle save toggle
   */
  const handleSavePress = useCallback(
    (id: string) => {
      toggleSaved(id);
    },
    [toggleSaved]
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
        onSavePress={handleSavePress}
      />
    ),
    [isSaved, handleSavePress]
  );

  /**
   * Key extractor for FlatList
   */
  const keyExtractor = useCallback((item: Listing) => item.id, []);

  /**
   * Render empty state
   */
  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={Colors.gray300} />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your search or filters
        </Text>
      </View>
    ),
    []
  );

  /**
   * Render filter header
   */
  const renderHeader = () => (
    <View style={styles.filtersContainer}>
      {/* Search input */}
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={Colors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search neighborhood, city…"
          placeholderTextColor={Colors.gray400}
          value={localSearchQuery}
          onChangeText={setLocalSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {localSearchQuery.length > 0 && (
          <Pressable onPress={() => setLocalSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.gray400} />
          </Pressable>
        )}
      </View>

      {/* Property Type Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Property Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {PROPERTY_TYPES.map((type) => (
            <Pressable
              key={type.label}
              style={[
                styles.chip,
                filters.type === type.value && styles.chipActive,
              ]}
              onPress={() => handleTypeSelect(type.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.type === type.value && styles.chipTextActive,
                ]}
              >
                {type.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Price Range Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Price Range (XAF)</Text>
        <View style={styles.priceRow}>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min price"
              placeholderTextColor={Colors.gray400}
              value={localMinPrice}
              onChangeText={setLocalMinPrice}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.priceSeparator}>–</Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Max price"
              placeholderTextColor={Colors.gray400}
              value={localMaxPrice}
              onChangeText={setLocalMaxPrice}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Bedrooms Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Bedrooms</Text>
        <View style={styles.bedroomChipsContainer}>
          {BEDROOM_OPTIONS.map((option) => (
            <Pressable
              key={option.label}
              style={[
                styles.bedroomChip,
                filters.bedrooms === option.value && styles.chipActive,
              ]}
              onPress={() => handleBedroomSelect(option.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.bedrooms === option.value && styles.chipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Availability Toggle */}
      <View style={styles.filterSection}>
        <Pressable style={styles.toggleRow} onPress={handleAvailabilityToggle}>
          <Text style={styles.filterLabel}>Available Only</Text>
          <View
            style={[
              styles.toggle,
              filters.availableOnly && styles.toggleActive,
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                filters.availableOnly && styles.toggleKnobActive,
              ]}
            />
          </View>
        </Pressable>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.applyButton} onPress={handleApplyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </Pressable>
      </View>

      {/* Results header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'}
        </Text>
        {activeFilterCount > 0 && (
          <Pressable onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={filteredListings}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterLabel: {
    fontSize: FontSizes.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSizes.bodySmall,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInputContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  priceInput: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
  },
  priceSeparator: {
    marginHorizontal: Spacing.md,
    color: Colors.textSecondary,
    fontSize: FontSizes.body,
  },
  bedroomChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bedroomChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray300,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  actionButtons: {
    marginBottom: Spacing.lg,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultsCount: {
    fontSize: FontSizes.bodySmall,
    color: Colors.textSecondary,
  },
  resetText: {
    fontSize: FontSizes.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
