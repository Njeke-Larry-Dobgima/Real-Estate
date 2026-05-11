/**
 * MapSearchBar Component
 * Floating search bar at the top of the map
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors, FontSizes, BorderRadius, Shadows, Spacing } from '../../constants/colors';

/**
 * Props for MapSearchBar component
 */
interface MapSearchBarProps {
  hasActiveFilters: boolean;
}

/**
 * Floating search bar component for the map view
 * Tapping navigates to the Search tab
 */
const MapSearchBar: React.FC<MapSearchBarProps> = ({ hasActiveFilters }) => {
  const handlePress = () => {
    router.push('/(tabs)/search');
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.gray500} />
        <Text style={styles.placeholder}>Search neighborhood, city…</Text>

        {/* Active filter indicator */}
        {hasActiveFilters && <View style={styles.filterBadge} />}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.medium,
  },
  placeholder: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.body,
    color: Colors.gray400,
  },
  filterBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
});

export default MapSearchBar;
