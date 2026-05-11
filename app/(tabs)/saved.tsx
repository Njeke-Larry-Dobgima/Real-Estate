/**
 * Saved Listings Screen - Tab 3
 * Displays user's saved/favorited properties
 */

import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSizes } from '../../constants/colors';

/**
 * Saved listings screen component (placeholder)
 */
export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Saved Listings</Text>
          <Text style={styles.subtitle}>Your favorited properties will appear here</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
});
