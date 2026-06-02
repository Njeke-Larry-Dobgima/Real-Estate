/**
 * Create Listing Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../hooks/useAuth';
import { useListings } from '../../hooks/useListings';
import { pickImage, uploadMultipleImages } from '../../utils/upload';
import { Colors, FontSizes, BorderRadius, Shadows, Spacing } from '../../constants/colors';
import { PropertyType, PricePeriod, CreateListingInput } from '../../types';

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'land', 'commercial'];
const PRICE_PERIODS: PricePeriod[] = ['sale', 'rent/month', 'rent/year'];

export default function CreateListingScreen() {
  const { user } = useAuth();
  const { createListing } = useListings();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pricePeriod, setPricePeriod] = useState<PricePeriod>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [bedrooms, setBedrooms] = useState('0');
  const [bathrooms, setBathrooms] = useState('0');
  const [areaSqm, setAreaSqm] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Douala');
  const [neighborhood, setNeighborhood] = useState('');
  const [latitude, setLatitude] = useState('4.0511');
  const [longitude, setLongitude] = useState('9.7679');
  const [imageUris, setImageUris] = useState<string[]>([]);

  const handlePickImage = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        setImageUris((prev) => [...prev, uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!areaSqm || isNaN(Number(areaSqm)) || Number(areaSqm) <= 0) {
      Alert.alert('Error', 'Please enter a valid area');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return false;
    }
    if (!neighborhood.trim()) {
      Alert.alert('Error', 'Please enter a neighborhood');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a listing');
      return;
    }

    if (imageUris.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    setLoading(true);
    try {
      // Create a temporary ID for image upload path
      const tempId = Date.now().toString();

      // Upload images to Supabase
      const imageUrls = await uploadMultipleImages(imageUris, tempId);

      // Create listing input
      const input: CreateListingInput = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        price_period: pricePeriod,
        type: propertyType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area_sqm: Number(areaSqm),
        address: address.trim(),
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        coordinates: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        images: imageUrls,
        is_available: true,
        is_featured: false,
      };

      // Create listing in Firestore
      await createListing(input, user.uid);

      Alert.alert('Success', 'Listing created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create listing';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Modern 3-Bedroom Apartment in Bonapriso"
          placeholderTextColor={Colors.gray400}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your property..."
          placeholderTextColor={Colors.gray400}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Price (XAF) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 45000000"
            placeholderTextColor={Colors.gray400}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.md }]}>
          <Text style={styles.label}>Price Period *</Text>
          <View style={styles.chipRow}>
            {PRICE_PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.chip, pricePeriod === period && styles.chipActive]}
                onPress={() => setPricePeriod(period)}
              >
                <Text style={[styles.chipText, pricePeriod === period && styles.chipTextActive]}>
                  {period === 'sale' ? 'Sale' : period === 'rent/month' ? 'Monthly' : 'Yearly'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Property Type *</Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, propertyType === type && styles.chipActive]}
              onPress={() => setPropertyType(type)}
            >
              <Text style={[styles.chipText, propertyType === type && styles.chipTextActive]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Details & Location</Text>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Bedrooms</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.gray400}
            value={bedrooms}
            onChangeText={setBedrooms}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.md }]}>
          <Text style={styles.label}>Bathrooms</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.gray400}
            value={bathrooms}
            onChangeText={setBathrooms}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.md }]}>
          <Text style={styles.label}>Area (m²) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 120"
            placeholderTextColor={Colors.gray400}
            value={areaSqm}
            onChangeText={setAreaSqm}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Rue de la Joie, Bonapriso"
          placeholderTextColor={Colors.gray400}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="Douala"
            placeholderTextColor={Colors.gray400}
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.md }]}>
          <Text style={styles.label}>Neighborhood *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bonapriso"
            placeholderTextColor={Colors.gray400}
            value={neighborhood}
            onChangeText={setNeighborhood}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.input}
            placeholder="4.0511"
            placeholderTextColor={Colors.gray400}
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.md }]}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            placeholder="9.7679"
            placeholderTextColor={Colors.gray400}
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Photos</Text>
      <Text style={styles.stepSubtitle}>Add at least one photo of your property</Text>

      <View style={styles.imageGrid}>
        {imageUris.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        {imageUris.length < 10 && (
          <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
            <Ionicons name="camera-outline" size={32} color={Colors.gray400} />
            <Text style={styles.addImageText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Listing Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Title:</Text>
          <Text style={styles.summaryValue}>{title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price:</Text>
          <Text style={styles.summaryValue}>
            {Number(price).toLocaleString()} XAF ({pricePeriod})
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Type:</Text>
          <Text style={styles.summaryValue}>{propertyType}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location:</Text>
          <Text style={styles.summaryValue}>
            {neighborhood}, {city}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{step}/3</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step < 3 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                <Text style={styles.submitButtonText}>Create Listing</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  stepIndicator: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  },
  stepText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.primary,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  stepContent: {
    padding: Spacing.lg,
  },
  stepTitle: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    ...Shadows.small,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.white,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.card,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  addImageText: {
    fontSize: FontSizes.caption,
    color: Colors.gray400,
    marginTop: Spacing.xs,
  },
  summarySection: {
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    ...Shadows.small,
  },
  summaryTitle: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSizes.body,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    ...Shadows.medium,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
  },
});
