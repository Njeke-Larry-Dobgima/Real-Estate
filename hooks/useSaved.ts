/**
 * useSaved hook
 * Convenience hook for accessing saved context
 */

import { useSavedContext } from '../context/SavedContext';

/**
 * Hook to access saved listings state and methods
 * @returns Saved context value
 */
export const useSaved = () => {
  return useSavedContext();
};

export default useSaved;
