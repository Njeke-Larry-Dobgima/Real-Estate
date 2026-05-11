/**
 * useFilters hook
 * Convenience hook for accessing filters context
 */

import { useFiltersContext } from '../context/FiltersContext';

/**
 * Hook to access filter state and methods
 * @returns Filters context value
 */
export const useFilters = () => {
  return useFiltersContext();
};

export default useFilters;
