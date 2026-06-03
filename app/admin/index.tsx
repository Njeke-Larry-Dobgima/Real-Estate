/**
 * Admin Panel Screen
 * Manage all listings and users
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Listing, FirestoreListing } from '../../types';
import { Colors, FontSizes, BorderRadius, Shadows, Spacing } from '../../constants/colors';

export default function AdminPanelScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have permission to access the admin panel.');
      router.back();
      return;
    }
    fetchAllListings();
  }, [user]);

  const fetchAllListings = async () => {
    try {
      const listingsRef = collection(db, 'listings');
      const snapshot = await getDocs(listingsRef);
      const allListings: Listing[] = snapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreListing;
        return {
          id: doc.id,
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
      });
      setListings(allListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', 'Failed to load listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllListings();
  };

  const handleDeleteListing = (listingId: string, listingTitle: string) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listingTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'listings', listingId));
              setListings((prev) => prev.filter((l) => l.id !== listingId));
              Alert.alert('Success', 'Listing deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  const handleToggleAvailability = async (listingId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        is_available: !currentStatus,
      });
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, is_available: !currentStatus } : l
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update listing');
    }
  };

  const handleToggleFeatured = async (listingId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        is_featured: !currentStatus,
      });
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, is_featured: !currentStatus } : l
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update listing');
    }
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <View style={styles.listingCard}>
      <TouchableOpacity
        style={styles.listingContent}
        onPress={() => router.push(`/listing/${item.id}`)}
      >
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.listingPrice}>
            {item.price.toLocaleString()} XAF
          </Text>
          <Text style={styles.listingLocation}>
            {item.neighborhood}, {item.city}
          </Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                { backgroundColor: item.is_available ? Colors.successLight : Colors.errorLight },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: item.is_available ? Colors.success : Colors.error },
                ]}
              >
                {item.is_available ? 'Available' : 'Sold'}
              </Text>
            </View>
            {item.is_featured && (
              <View style={[styles.badge, { backgroundColor: Colors.warningLight }]}>
                <Text style={[styles.badgeText, { color: Colors.warning }]}>
                  Featured
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleAvailability(item.id, item.is_available)}
        >
          <Ionicons
            name={item.is_available ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.gray500}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleFeatured(item.id, item.is_featured)}
        >
          <Ionicons
            name={item.is_featured ? 'star' : 'star-outline'}
            size={20}
            color={item.is_featured ? Colors.warning : Colors.gray500}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteListing(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.listingCount}>{listings.length} listings</Text>
      </View>

      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color={Colors.gray300} />
            <Text style={styles.emptyText}>No listings found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    ...Shadows.small,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  listingCount: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.lg,
  },
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  listingContent: {
    padding: Spacing.lg,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  listingPrice: {
    fontSize: FontSizes.bodySmall,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  listingLocation: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    fontSize: FontSizes.caption,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  actionButton: {
    padding: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
