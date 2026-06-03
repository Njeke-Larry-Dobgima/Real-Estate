/**
 * Property Detail Screen
 * Displays full details of a property listing
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
  Alert,
  Linking,
  ActivityIndicator,
  Animated,
  Platform,
  Image,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import {
  Colors,
  FontSizes,
  Shadows,
  BorderRadius,
  Spacing,
} from '../../constants/colors';
import { useListings } from '../../hooks/useListings';
import { useSaved } from '../../hooks/useSaved';
import { Agent, Listing } from '../../types';
import {
  formatPrice,
  formatArea,
  formatBedroomLabel,
  formatBathroomLabel,
  capitalize,
} from '../../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

/**
 * Property detail screen component
 */
export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getListingById, getAgentById, loading } = useListings();
  const { isSaved, toggleSaved } = useSaved();

  const [listing, setListing] = useState<Listing | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [agentLoading, setAgentLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const heartScale = useRef(new Animated.Value(1)).current;

  // Load listing data
  useEffect(() => {
    if (id) {
      const foundListing = getListingById(id);
      setListing(foundListing || null);
    }
  }, [id, getListingById]);

  // Load agent data
  useEffect(() => {
    const loadAgent = async () => {
      if (listing?.agent_id) {
        setAgentLoading(true);
        console.log('Loading agent with ID:', listing.agent_id);
        try {
          const agentData = await getAgentById(listing.agent_id);
          console.log('Agent data loaded:', agentData);
          setAgent(agentData);
        } catch (error) {
          console.error('Error loading agent:', error);
          setAgent(null);
        } finally {
          setAgentLoading(false);
        }
      } else {
        console.log('No agent_id found in listing');
        setAgentLoading(false);
      }
    };

    loadAgent();
  }, [listing?.agent_id, getAgentById]);

  /**
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  /**
   * Handle save/unsave with animation
   */
  const handleSaveToggle = useCallback(() => {
    if (!listing) return;

    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    toggleSaved(listing.id);
  }, [listing, toggleSaved, heartScale]);

  /**
   * Handle image scroll
   */
  const handleImageScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  }, []);

  /**
   * Handle WhatsApp contact
   */
  const handleWhatsAppPress = useCallback(async () => {
    if (!agent || !listing) return;

    const message = encodeURIComponent(
      `Hello, I am interested in: ${listing.title} — ${listing.address}`
    );
    const whatsappUrl = `whatsapp://send?phone=${agent.whatsapp}&text=${message}`;

    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          'WhatsApp Not Installed',
          `WhatsApp is not installed on your device. You can contact the agent at: ${agent.phone}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Copy Number',
              onPress: async () => {
                await Clipboard.setStringAsync(agent.phone);
                Alert.alert('Copied', 'Phone number copied to clipboard');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  }, [agent, listing]);

  /**
   * Handle Email contact
   */
  const handleEmailPress = useCallback(async () => {
    if (!agent || !listing) return;

    const subject = encodeURIComponent(`Inquiry: ${listing.title}`);
    const body = encodeURIComponent(
      `Hello ${agent.name}, I am interested in the property at ${listing.address}.`
    );
    const mailtoUrl = `mailto:${agent.email}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert('Error', 'Unable to open email client');
    }
  }, [agent, listing]);

  // Loading state
  if (loading || !listing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading property...</Text>
      </View>
    );
  }

  const saved = isSaved(listing.id);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={(listing.images && listing.images.length > 0) ? listing.images : ['placeholder']}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageScroll}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => {
              const hasValidImage = item && item !== 'placeholder' && item.trim() !== '' && item !== 'null';
              return hasValidImage ? (
                <Image
                  source={{ uri: item }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                  onError={(error) => console.log('Carousel image error:', error.nativeEvent?.error)}
                />
              ) : (
                <View style={[styles.carouselImage, styles.placeholderCarousel]}>
                  <Ionicons name="home-outline" size={64} color={Colors.gray400} />
                  <Text style={styles.placeholderText}>No Image Available</Text>
                </View>
              );
            }}
          />
          />

          {/* Dot indicators */}
          <View style={styles.dotsContainer}>
            {listing.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Back button */}
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>

          {/* Save button */}
          <Pressable style={styles.saveButton} onPress={handleSaveToggle}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={24}
                color={saved ? Colors.error : Colors.textPrimary}
              />
            </Animated.View>
          </Pressable>

          {/* Featured badge */}
          {listing.is_featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Property Header */}
          <View style={styles.headerSection}>
            <Text style={styles.price}>
              {formatPrice(listing.price, listing.price_period)}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {listing.title}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={Colors.textSecondary} />
              <Text style={styles.locationText}>
                {listing.neighborhood}, {listing.city}
              </Text>
            </View>
            <View
              style={[
                styles.availabilityBadge,
                listing.is_available ? styles.availableBadge : styles.unavailableBadge,
              ]}
            >
              <Text
                style={[
                  styles.availabilityText,
                  listing.is_available ? styles.availableText : styles.unavailableText,
                ]}
              >
                {listing.is_available ? 'Available' : 'Sold / Rented'}
              </Text>
            </View>
          </View>

          {/* Key Stats */}
          <View style={styles.statsSection}>
            {listing.bedrooms > 0 && (
              <View style={styles.statCard}>
                <Ionicons name="bed-outline" size={20} color={Colors.primary} />
                <Text style={styles.statValue}>{listing.bedrooms}</Text>
                <Text style={styles.statLabel}>Bedrooms</Text>
              </View>
            )}
            {listing.bathrooms > 0 && (
              <View style={styles.statCard}>
                <Ionicons name="water-outline" size={20} color={Colors.primary} />
                <Text style={styles.statValue}>{listing.bathrooms}</Text>
                <Text style={styles.statLabel}>Bathrooms</Text>
              </View>
            )}
            <View style={styles.statCard}>
              <Ionicons name="resize-outline" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{listing.area_sqm}</Text>
              <Text style={styles.statLabel}>m²</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="home-outline" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{capitalize(listing.type)}</Text>
              <Text style={styles.statLabel}>Type</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About this property</Text>
            <Text
              style={styles.descriptionText}
              numberOfLines={showFullDescription ? undefined : 4}
            >
              {listing.description}
            </Text>
            {listing.description.length > 200 && (
              <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
                <Text style={styles.showMoreText}>
                  {showFullDescription ? 'Show less' : 'Show more'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Location Map */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={{
                  latitude: listing.coordinates.latitude,
                  longitude: listing.coordinates.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: listing.coordinates.latitude,
                    longitude: listing.coordinates.longitude,
                  }}
                />
              </MapView>
            </View>
            <Text style={styles.addressText}>{listing.address}</Text>
          </View>

          {/* Agent Section */}
          <View style={styles.agentSection}>
            <Text style={styles.sectionTitle}>Contact Agent</Text>
            {agentLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : agent ? (
              <>
                <View style={styles.agentCard}>
                  <Image
                    source={{ uri: agent.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(agent.name) }}
                    style={styles.agentAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.agentInfo}>
                    <View style={styles.agentNameRow}>
                      <Text style={styles.agentName}>{agent.name}</Text>
                      {agent.verified && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#1DA1F2"
                          style={styles.verifiedIcon}
                        />
                      )}
                    </View>
                    <Text style={styles.agentAgency}>{agent.agency_name}</Text>
                  </View>
                </View>

                {/* Contact buttons */}
                <View style={styles.contactButtons}>
                  {agent.whatsapp && (
                    <Pressable
                      style={styles.whatsappButton}
                      onPress={handleWhatsAppPress}
                    >
                      <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
                      <Text style={styles.contactButtonText}>WhatsApp</Text>
                    </Pressable>
                  )}
                  {agent.email && (
                    <Pressable
                      style={styles.emailButton}
                      onPress={handleEmailPress}
                    >
                      <Ionicons name="mail-outline" size={20} color={Colors.white} />
                      <Text style={styles.contactButtonText}>Email Agent</Text>
                    </Pressable>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.noAgentContainer}>
                <Ionicons name="person-outline" size={40} color={Colors.gray300} />
                <Text style={styles.noAgentText}>Agent information not available</Text>
                <Text style={styles.noAgentSubtext}>
                  This listing was created by a user. Contact them through the app.
                </Text>
                <Text style={styles.agentIdText}>
                  Agent ID: {listing.agent_id || 'Not assigned'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  carouselContainer: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.gray200,
  },
  placeholderCarousel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: FontSizes.body,
    color: Colors.gray500,
    marginTop: Spacing.md,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.white,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  saveButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  featuredBadge: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  featuredText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.lg,
  },
  headerSection: {
    marginBottom: Spacing.xl,
  },
  price: {
    fontSize: FontSizes.price,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  availableBadge: {
    backgroundColor: Colors.successLight,
  },
  unavailableBadge: {
    backgroundColor: Colors.errorLight,
  },
  availabilityText: {
    fontSize: FontSizes.bodySmall,
    fontWeight: '600',
  },
  availableText: {
    color: Colors.success,
  },
  unavailableText: {
    color: Colors.error,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xl,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    minWidth: 75,
    ...Shadows.small,
  },
  statValue: {
    fontSize: FontSizes.subtitle,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  descriptionSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.subtitle,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  showMoreText: {
    fontSize: FontSizes.body,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  locationSection: {
    marginBottom: Spacing.xl,
  },
  mapContainer: {
    height: 160,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  map: {
    flex: 1,
  },
  addressText: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
  },
  agentSection: {
    marginBottom: Spacing.xxxl,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gray200,
  },
  agentInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentName: {
    fontSize: FontSizes.subtitle,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  agentAgency: {
    fontSize: FontSizes.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactButtons: {
    flexDirection: 'row',
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whatsappGreen,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.card,
    marginRight: Spacing.sm,
    ...Shadows.small,
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.card,
    ...Shadows.small,
  },
  contactButtonText: {
    color: Colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  noAgentContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noAgentText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
  noAgentSubtext: {
    fontSize: FontSizes.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  agentIdText: {
    fontSize: FontSizes.caption,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
