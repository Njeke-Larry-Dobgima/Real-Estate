/**
 * Profile Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { useAuth } from '../../hooks/useAuth';
import { useListings } from '../../hooks/useListings';
import { db } from '../../lib/firebase';
import { Listing, FirestoreListing } from '../../types';
import { Colors, FontSizes, BorderRadius, Shadows, Spacing } from '../../constants/colors';

export default function ProfileScreen() {
  const { user, loading, logout } = useAuth();
  const { deleteListing } = useListings();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);

  useEffect(() => {
    if (user && showMyListings) {
      fetchMyListings();
    }
  }, [user, showMyListings]);

  const fetchMyListings = async () => {
    if (!user) return;
    setLoadingListings(true);
    try {
      const listingsRef = collection(db, 'listings');
      const q = query(listingsRef, where('agent_id', '==', user.uid));
      const snapshot = await getDocs(q);
      const listings: Listing[] = snapshot.docs.map((doc) => {
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
      setMyListings(listings);
    } catch (error) {
      console.error('Error fetching my listings:', error);
      Alert.alert('Error', 'Failed to load your listings');
    } finally {
      setLoadingListings(false);
    }
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
              await deleteListing(listingId);
              setMyListings((prev) => prev.filter((l) => l.id !== listingId));
              Alert.alert('Success', 'Listing deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.guestHeader}>
          <Ionicons name="person-circle-outline" size={80} color={Colors.gray300} />
          <Text style={styles.guestTitle}>Welcome to MapHouse</Text>
          <Text style={styles.guestSubtitle}>Sign in to create listings and save favorites</Text>
        </View>

        <View style={styles.guestActions}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Ionicons name="log-in-outline" size={20} color={Colors.white} />
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user.displayName}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        {user.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role === 'agent' ? 'Agent' : 'User'}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/listing/create')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight + '20' }]}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Create Listing</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowMyListings(!showMyListings)}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="list-outline" size={20} color={Colors.success} />
            </View>
            <Text style={styles.menuItemText}>My Listings</Text>
          </View>
          <View style={styles.myListingsBadge}>
            <Text style={styles.myListingsCount}>{myListings.length}</Text>
            <Ionicons
              name={showMyListings ? 'chevron-up' : 'chevron-forward'}
              size={20}
              color={Colors.gray400}
            />
          </View>
        </TouchableOpacity>

        {showMyListings && (
          <View style={styles.myListingsSection}>
            {loadingListings ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ padding: Spacing.lg }} />
            ) : myListings.length === 0 ? (
              <View style={styles.emptyMyListings}>
                <Ionicons name="home-outline" size={40} color={Colors.gray300} />
                <Text style={styles.emptyMyListingsText}>You haven't created any listings yet</Text>
                <TouchableOpacity
                  style={styles.createListingButton}
                  onPress={() => router.push('/listing/create')}
                >
                  <Text style={styles.createListingButtonText}>Create Listing</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myListings.map((listing) => (
                <View key={listing.id} style={styles.myListingItem}>
                  <TouchableOpacity
                    style={styles.myListingContent}
                    onPress={() => router.push(`/listing/${listing.id}`)}
                  >
                    <View style={styles.myListingInfo}>
                      <Text style={styles.myListingTitle} numberOfLines={1}>
                        {listing.title}
                      </Text>
                      <Text style={styles.myListingPrice}>
                        {listing.price.toLocaleString()} XAF
                      </Text>
                      <View style={styles.myListingStatus}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: listing.is_available ? Colors.success : Colors.error },
                          ]}
                        />
                        <Text style={styles.statusText}>
                          {listing.is_available ? 'Available' : 'Sold/Rented'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteListing(listing.id, listing.title)}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Admin</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/admin')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight + '20' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Admin Panel</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.warningLight }]}>
              <Ionicons name="notifications-outline" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.gray200 }]}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.gray500} />
            </View>
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  guestHeader: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: Spacing.xxxl,
  },
  guestTitle: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  guestSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  guestActions: {
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  registerButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: BorderRadius.card,
    borderBottomRightRadius: BorderRadius.card,
    ...Shadows.medium,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
  },
  userName: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  userEmail: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  userPhone: {
    fontSize: FontSizes.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  roleBadge: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    marginTop: Spacing.sm,
  },
  roleText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.primary,
  },
  menuSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: FontSizes.body,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.errorLight,
    ...Shadows.small,
  },
  logoutText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.error,
  },
  myListingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  myListingsCount: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  myListingsSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    ...Shadows.small,
  },
  emptyMyListings: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyMyListingsText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  createListingButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.card,
  },
  createListingButtonText: {
    color: Colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
  myListingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  myListingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  myListingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  myListingTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  myListingPrice: {
    fontSize: FontSizes.bodySmall,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  myListingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: Spacing.md,
    paddingLeft: Spacing.sm,
  },
});
