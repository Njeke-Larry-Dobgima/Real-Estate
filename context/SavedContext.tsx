/**
 * Saved Context Provider
 * Manages saved/favorited listings with AsyncStorage persistence
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SavedContextType } from '../types';

/**
 * AsyncStorage key for saved listings
 */
const STORAGE_KEY = 'maphouse_saved';

/**
 * Create the Saved context
 */
const SavedContext = createContext<SavedContextType | undefined>(undefined);

/**
 * Props for SavedProvider component
 */
interface SavedProviderProps {
  children: ReactNode;
}

/**
 * Saved Provider Component
 * Provides saved listings state with AsyncStorage persistence
 */
export const SavedProvider: React.FC<SavedProviderProps> = ({ children }) => {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load saved listings from AsyncStorage on mount
   */
  useEffect(() => {
    const loadSavedListings = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) {
            setSavedIds(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading saved listings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedListings();
  }, []);

  /**
   * Persist saved listings to AsyncStorage
   */
  const persistSavedIds = useCallback(async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('Error saving listings to storage:', error);
    }
  }, []);

  /**
   * Toggle a listing's saved state
   */
  const toggleSaved = useCallback(
    (id: string) => {
      setSavedIds((currentIds) => {
        let newIds: string[];

        if (currentIds.includes(id)) {
          // Remove from saved
          newIds = currentIds.filter((savedId) => savedId !== id);
        } else {
          // Add to saved
          newIds = [...currentIds, id];
        }

        // Persist changes
        persistSavedIds(newIds);

        return newIds;
      });
    },
    [persistSavedIds]
  );

  /**
   * Check if a listing is saved
   */
  const isSaved = useCallback(
    (id: string): boolean => {
      return savedIds.includes(id);
    },
    [savedIds]
  );

  const value: SavedContextType = {
    savedIds,
    toggleSaved,
    isSaved,
    loading,
  };

  return (
    <SavedContext.Provider value={value}>
      {children}
    </SavedContext.Provider>
  );
};

/**
 * Hook to use saved context
 * @throws Error if used outside of SavedProvider
 */
export const useSavedContext = (): SavedContextType => {
  const context = useContext(SavedContext);
  if (context === undefined) {
    throw new Error('useSavedContext must be used within a SavedProvider');
  }
  return context;
};

export default SavedContext;
