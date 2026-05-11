/**
 * Utility functions for filtering listings in MapHouse app
 */

import { Listing, FilterState } from '../types';

/**
 * Applies filters to a list of listings
 * @param listings - Array of listings to filter
 * @param filters - Filter state object
 * @returns Filtered array of listings
 */
export const applyFilters = (
  listings: Listing[],
  filters: FilterState
): Listing[] => {
  return listings.filter((listing) => {
    // Filter by property type
    if (filters.type && listing.type !== filters.type) {
      return false;
    }

    // Filter by minimum price
    if (filters.minPrice !== null && listing.price < filters.minPrice) {
      return false;
    }

    // Filter by maximum price
    if (filters.maxPrice !== null && listing.price > filters.maxPrice) {
      return false;
    }

    // Filter by bedrooms
    if (filters.bedrooms !== null) {
      // Handle "5+" case (bedrooms >= 5)
      if (filters.bedrooms >= 5) {
        if (listing.bedrooms < 5) {
          return false;
        }
      } else if (listing.bedrooms !== filters.bedrooms) {
        return false;
      }
    }

    // Filter by availability
    if (filters.availableOnly && !listing.is_available) {
      return false;
    }

    // Filter by search query (searches title, neighborhood, city)
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      const titleMatch = listing.title.toLowerCase().includes(query);
      const neighborhoodMatch = listing.neighborhood.toLowerCase().includes(query);
      const cityMatch = listing.city.toLowerCase().includes(query);
      const addressMatch = listing.address.toLowerCase().includes(query);

      if (!titleMatch && !neighborhoodMatch && !cityMatch && !addressMatch) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Default filter state
 */
export const defaultFilterState: FilterState = {
  type: null,
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  availableOnly: true,
  searchQuery: '',
};

/**
 * Counts the number of active filters (excluding availableOnly default and empty searchQuery)
 * @param filters - Filter state object
 * @returns Number of active filters
 */
export const countActiveFilters = (filters: FilterState): number => {
  let count = 0;

  if (filters.type !== null) count++;
  if (filters.minPrice !== null) count++;
  if (filters.maxPrice !== null) count++;
  if (filters.bedrooms !== null) count++;
  if (!filters.availableOnly) count++; // Count if user turned off the default
  if (filters.searchQuery && filters.searchQuery.trim() !== '') count++;

  return count;
};

/**
 * Checks if any filters are active (different from defaults)
 * @param filters - Filter state object
 * @returns Boolean indicating if filters are active
 */
export const hasActiveFilters = (filters: FilterState): boolean => {
  return countActiveFilters(filters) > 0;
};

/**
 * Sorts listings by various criteria
 * @param listings - Array of listings to sort
 * @param sortBy - Sort criteria ('price_asc' | 'price_desc' | 'newest' | 'oldest')
 * @returns Sorted array of listings
 */
export const sortListings = (
  listings: Listing[],
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'oldest' = 'newest'
): Listing[] => {
  const sorted = [...listings];

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = a.created_at instanceof Date ? a.created_at : a.created_at.toDate();
        const dateB = b.created_at instanceof Date ? b.created_at : b.created_at.toDate();
        return dateB.getTime() - dateA.getTime();
      });
    case 'oldest':
      return sorted.sort((a, b) => {
        const dateA = a.created_at instanceof Date ? a.created_at : a.created_at.toDate();
        const dateB = b.created_at instanceof Date ? b.created_at : b.created_at.toDate();
        return dateA.getTime() - dateB.getTime();
      });
    default:
      return sorted;
  }
};
