/**
 * Map View Screen - Tab 1: Home/Map
 * Displays property listings on an interactive map
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

import { Colors, FontSizes } from '../../constants/colors';
import { useListings } from '../../hooks/useListings';
import { useFilters } from '../../hooks/useFilters';
import { applyFilters } from '../../utils/filters';
import { Listing, Coordinates } from '../../types';

import PricePin from '../../components/map/PricePin';
import ListingPreviewCard from '../../components/map/ListingPreviewCard';
import MapSearchBar from '../../components/map/MapSearchBar';
import MyLocationButton from '../../components/map/MyLocationButton';

/**
 * Default coordinates (Douala, Cameroon)
 */
const DEFAULT_COORDINATES: Coordinates = {
  latitude: 4.0511,
  longitude: 9.7679,
};

/**
 * Default map delta for zoom level
 */
const DEFAULT_DELTA = 0.05;
const FALLBACK_DELTA = 0.2;

/**
 * Map View screen component
 */
export default function MapScreen() {
  const { listings, loading, error } = useListings();
  const { filters, activeFilterCount } = useFilters();

  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Apply filters to listings
  const filteredListings = applyFilters(listings, filters);

  /**
   * Request location permission and get user's location
   */
  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setLocationPermissionDenied(true);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords: Coordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(coords);

        // Animate to user's location if map is ready
        if (mapRef.current && mapReady) {
          mapRef.current.animateToRegion({
            ...coords,
            latitudeDelta: DEFAULT_DELTA,
            longitudeDelta: DEFAULT_DELTA,
          });
        }
      } catch (err) {
        console.error('Error getting location:', err);
        setLocationPermissionDenied(true);
      }
    };

    requestLocation();
  }, [mapReady]);

  /**
   * Handle marker press
   */
  const handleMarkerPress = useCallback((listing: Listing) => {
    setSelectedListing(listing);
    setShowPreview(true);

    // Center map on the selected listing
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: listing.coordinates.latitude,
        longitude: listing.coordinates.longitude,
        latitudeDelta: DEFAULT_DELTA,
        longitudeDelta: DEFAULT_DELTA,
      });
    }
  }, []);

  /**
   * Handle preview card close
   */
  const handlePreviewClose = useCallback(() => {
    setShowPreview(false);
    setSelectedListing(null);
  }, []);

  /**
   * Handle my location button press
   */
  const handleMyLocationPress = useCallback(() => {
    if (!userLocation || !mapRef.current) return;

    mapRef.current.animateToRegion({
      ...userLocation,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    });
  }, [userLocation]);

  /**
   * Handle map ready
   */
  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  /**
   * Handle map press (deselect marker)
   */
  const handleMapPress = useCallback(() => {
    if (showPreview) {
      handlePreviewClose();
    }
  }, [showPreview, handlePreviewClose]);

  /**
   * Get initial region based on user location or default
   */
  const getInitialRegion = (): Region => {
    if (userLocation) {
      return {
        ...userLocation,
        latitudeDelta: DEFAULT_DELTA,
        longitudeDelta: DEFAULT_DELTA,
      };
    }

    return {
      ...DEFAULT_COORDINATES,
      latitudeDelta: locationPermissionDenied ? FALLBACK_DELTA : DEFAULT_DELTA,
      longitudeDelta: locationPermissionDenied ? FALLBACK_DELTA : DEFAULT_DELTA,
    };
  };

  // Show loading indicator while fetching listings
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading properties...</Text>
      </View>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load properties</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={getInitialRegion()}
        showsUserLocation={!locationPermissionDenied}
        showsMyLocationButton={false}
        onMapReady={handleMapReady}
        onPress={handleMapPress}
      >
        {/* Listing markers */}
        {filteredListings.map((listing) => (
          <Marker
            key={listing.id}
            coordinate={{
              latitude: listing.coordinates.latitude,
              longitude: listing.coordinates.longitude,
            }}
            onPress={() => handleMarkerPress(listing)}
            tracksViewChanges={false}
          >
            <PricePin
              price={listing.price}
              isSelected={selectedListing?.id === listing.id}
            />
          </Marker>
        ))}
      </MapView>

      {/* Floating search bar */}
      <MapSearchBar hasActiveFilters={activeFilterCount > 0} />

      {/* My location button */}
      <MyLocationButton
        onPress={handleMyLocationPress}
        disabled={!userLocation}
      />

      {/* Listing preview card */}
      <ListingPreviewCard
        listing={selectedListing}
        visible={showPreview}
        onClose={handlePreviewClose}
      />

      {/* Empty state message */}
      {filteredListings.length === 0 && !loading && (
        <View style={styles.emptyOverlay}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No properties found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or search in a different area
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyOverlay: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
