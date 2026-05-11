/**
 * TypeScript interfaces for MapHouse app
 */

import { GeoPoint, Timestamp } from 'firebase/firestore';

/**
 * Coordinates interface for location data
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Property listing type options
 */
export type PropertyType = 'apartment' | 'house' | 'land' | 'commercial';

/**
 * Price period options
 */
export type PricePeriod = 'sale' | 'rent/month' | 'rent/year';

/**
 * Listing interface representing a property listing document in Firestore
 */
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  price_period: PricePeriod;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  address: string;
  city: string;
  neighborhood: string;
  coordinates: Coordinates;
  images: string[];
  is_available: boolean;
  is_featured: boolean;
  agent_id: string;
  created_at: Timestamp | Date;
  updated_at: Timestamp | Date;
}

/**
 * Raw Firestore listing document (before transformation)
 */
export interface FirestoreListing {
  id?: string;
  title: string;
  description: string;
  price: number;
  price_period: PricePeriod;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  address: string;
  city: string;
  neighborhood: string;
  coordinates: GeoPoint;
  images: string[];
  is_available: boolean;
  is_featured: boolean;
  agent_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Agent interface representing an agent document in Firestore
 */
export interface Agent {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  agency_name: string;
  avatar_url: string;
  verified: boolean;
}

/**
 * Filter state interface for search filters
 */
export interface FilterState {
  type: PropertyType | null;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  availableOnly: boolean;
  searchQuery: string;
}

/**
 * Listings context state interface
 */
export interface ListingsContextState {
  listings: Listing[];
  loading: boolean;
  error: string | null;
}

/**
 * Listings context interface with actions
 */
export interface ListingsContextType extends ListingsContextState {
  getListingById: (id: string) => Listing | undefined;
  getAgentById: (id: string) => Promise<Agent | null>;
}

/**
 * Filters context interface
 */
export interface FiltersContextType {
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

/**
 * Saved context interface
 */
export interface SavedContextType {
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  loading: boolean;
}
