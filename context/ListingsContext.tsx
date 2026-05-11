/**
 * Listings Context Provider
 * Manages listings state with real-time Firestore subscription
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import {
  Listing,
  Agent,
  ListingsContextType,
  ListingsContextState,
  FirestoreListing,
} from '../types';

/**
 * Initial state for listings context
 */
const initialState: ListingsContextState = {
  listings: [],
  loading: true,
  error: null,
};

/**
 * Action types for listings reducer
 */
type ListingsAction =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

/**
 * Listings reducer function
 */
const listingsReducer = (
  state: ListingsContextState,
  action: ListingsAction
): ListingsContextState => {
  switch (action.type) {
    case 'SET_LISTINGS':
      return { ...state, listings: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

/**
 * Create the Listings context
 */
const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

/**
 * Props for ListingsProvider component
 */
interface ListingsProviderProps {
  children: ReactNode;
}

/**
 * Transforms Firestore document to Listing type
 */
const transformFirestoreListing = (
  docId: string,
  data: FirestoreListing
): Listing => {
  return {
    id: docId,
    title: data.title,
    description: data.description,
    price: data.price,
    price_period: data.price_period,
    type: data.type,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area_sqm: data.area_sqm,
    address: data.address,
    city: data.city,
    neighborhood: data.neighborhood,
    coordinates: {
      latitude: data.coordinates.latitude,
      longitude: data.coordinates.longitude,
    },
    images: data.images,
    is_available: data.is_available,
    is_featured: data.is_featured,
    agent_id: data.agent_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Listings Provider Component
 * Provides listings data to the entire app with real-time updates
 */
export const ListingsProvider: React.FC<ListingsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(listingsReducer, initialState);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('is_available', '==', true),
        orderBy('created_at', 'desc')
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const listings: Listing[] = snapshot.docs.map((doc) => {
            const data = doc.data() as FirestoreListing;
            return transformFirestoreListing(doc.id, data);
          });

          dispatch({ type: 'SET_LISTINGS', payload: listings });
        },
        (error) => {
          console.error('Error fetching listings:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch listings';
      console.error('Error setting up listings listener:', error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  /**
   * Get a specific listing by ID
   */
  const getListingById = useCallback(
    (id: string): Listing | undefined => {
      return state.listings.find((listing) => listing.id === id);
    },
    [state.listings]
  );

  /**
   * Get agent data by ID from Firestore
   */
  const getAgentById = useCallback(async (id: string): Promise<Agent | null> => {
    try {
      const agentRef = doc(db, 'agents', id);
      const agentSnap = await getDoc(agentRef);

      if (agentSnap.exists()) {
        const data = agentSnap.data();
        return {
          id: agentSnap.id,
          name: data.name,
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email,
          agency_name: data.agency_name,
          avatar_url: data.avatar_url,
          verified: data.verified,
        } as Agent;
      }

      return null;
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }, []);

  const value: ListingsContextType = {
    ...state,
    getListingById,
    getAgentById,
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};

/**
 * Hook to use listings context
 * @throws Error if used outside of ListingsProvider
 */
export const useListingsContext = (): ListingsContextType => {
  const context = useContext(ListingsContext);
  if (context === undefined) {
    throw new Error('useListingsContext must be used within a ListingsProvider');
  }
  return context;
};

export default ListingsContext;
