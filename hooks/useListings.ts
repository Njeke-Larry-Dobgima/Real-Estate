/**
 * useListings hook
 * Convenience hook for accessing listings context
 */

import { useListingsContext } from '../context/ListingsContext';

/**
 * Hook to access listings data and methods
 * @returns Listings context value
 */
export const useListings = () => {
  return useListingsContext();
};

export default useListings;
