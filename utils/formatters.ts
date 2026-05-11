/**
 * Utility functions for formatting data in MapHouse app
 */

import { PricePeriod, Coordinates } from '../types';

/**
 * Formats a price with thousands separator and currency/period label
 * @param price - The price in XAF
 * @param period - The price period ('sale' | 'rent/month' | 'rent/year')
 * @returns Formatted price string
 * @example formatPrice(45000000, 'sale') => "45,000,000 XAF (Sale)"
 * @example formatPrice(150000, 'rent/month') => "150,000 XAF/month"
 */
export const formatPrice = (price: number, period: PricePeriod): string => {
  const formattedNumber = price.toLocaleString('en-US');

  switch (period) {
    case 'sale':
      return `${formattedNumber} XAF (Sale)`;
    case 'rent/month':
      return `${formattedNumber} XAF/month`;
    case 'rent/year':
      return `${formattedNumber} XAF/year`;
    default:
      return `${formattedNumber} XAF`;
  }
};

/**
 * Formats price for map markers (shortened format)
 * @param price - The price in XAF
 * @returns Shortened price string for marker display
 * @example formatMarkerPrice(45000000) => "45M XAF"
 * @example formatMarkerPrice(150000) => "150K XAF"
 */
export const formatMarkerPrice = (price: number): string => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1).replace(/\.0$/, '')}B XAF`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1).replace(/\.0$/, '')}M XAF`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K XAF`;
  }
  return `${price} XAF`;
};

/**
 * Formats area in square meters
 * @param sqm - Area in square meters
 * @returns Formatted area string
 * @example formatArea(120) => "120 m²"
 */
export const formatArea = (sqm: number): string => {
  return `${sqm.toLocaleString('en-US')} m²`;
};

/**
 * Formats bedroom label
 * @param n - Number of bedrooms
 * @returns Formatted bedroom label
 * @example formatBedroomLabel(0) => "Studio"
 * @example formatBedroomLabel(1) => "1 bed"
 * @example formatBedroomLabel(3) => "3 beds"
 */
export const formatBedroomLabel = (n: number): string => {
  if (n === 0) return 'Studio';
  if (n === 1) return '1 bed';
  return `${n} beds`;
};

/**
 * Formats bathroom label
 * @param n - Number of bathrooms
 * @returns Formatted bathroom label
 * @example formatBathroomLabel(1) => "1 bath"
 * @example formatBathroomLabel(2) => "2 baths"
 */
export const formatBathroomLabel = (n: number): string => {
  if (n === 1) return '1 bath';
  return `${n} baths`;
};

/**
 * Calculates distance between two coordinates using Haversine formula
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in kilometers
 */
const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Converts degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Gets a formatted distance label between user and listing coordinates
 * @param userCoords - User's current coordinates
 * @param listingCoords - Listing coordinates
 * @returns Formatted distance string
 * @example getDistanceLabel(userCoords, listingCoords) => "1.2 km away"
 */
export const getDistanceLabel = (
  userCoords: Coordinates,
  listingCoords: Coordinates
): string => {
  const distance = calculateDistance(userCoords, listingCoords);

  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    return `${meters} m away`;
  }

  return `${distance.toFixed(1)} km away`;
};

/**
 * Capitalizes the first letter of a string
 * @param str - Input string
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats property type for display
 * @param type - Property type
 * @returns Formatted type string
 */
export const formatPropertyType = (type: string): string => {
  return capitalize(type);
};
