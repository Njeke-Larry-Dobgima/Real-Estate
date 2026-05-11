/**
 * Filters Context Provider
 * Manages filter state for property search
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

import { FilterState, FiltersContextType } from '../types';
import { defaultFilterState, countActiveFilters } from '../utils/filters';

/**
 * Action types for filters reducer
 */
type FiltersAction =
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'RESET_FILTERS' };

/**
 * Filters reducer function
 */
const filtersReducer = (
  state: FilterState,
  action: FiltersAction
): FilterState => {
  switch (action.type) {
    case 'SET_FILTERS':
      return { ...state, ...action.payload };
    case 'RESET_FILTERS':
      return defaultFilterState;
    default:
      return state;
  }
};

/**
 * Create the Filters context
 */
const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

/**
 * Props for FiltersProvider component
 */
interface FiltersProviderProps {
  children: ReactNode;
}

/**
 * Filters Provider Component
 * Provides filter state and actions to the entire app
 */
export const FiltersProvider: React.FC<FiltersProviderProps> = ({ children }) => {
  const [filters, dispatch] = useReducer(filtersReducer, defaultFilterState);

  /**
   * Set filters with partial update
   */
  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  }, []);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  /**
   * Count of currently active filters
   */
  const activeFilterCount = countActiveFilters(filters);

  const value: FiltersContextType = {
    filters,
    setFilters,
    resetFilters,
    activeFilterCount,
  };

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
};

/**
 * Hook to use filters context
 * @throws Error if used outside of FiltersProvider
 */
export const useFiltersContext = (): FiltersContextType => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFiltersContext must be used within a FiltersProvider');
  }
  return context;
};

export default FiltersContext;
