/**
 * Root Layout - Wraps the entire app with providers
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

import { AuthProvider } from '../context/AuthContext';
import { ListingsProvider } from '../context/ListingsContext';
import { FiltersProvider } from '../context/FiltersContext';
import { SavedProvider } from '../context/SavedContext';
import { ErrorBoundary } from '../components';
import { Colors } from '../constants/colors';

/**
 * Root layout component that wraps the entire app
 * Includes all context providers and the navigation stack
 */
export default function RootLayout() {
  return (
    <View style={styles.container}>
      <ErrorBoundary>
        <AuthProvider>
          <ListingsProvider>
            <FiltersProvider>
              <SavedProvider>
                <StatusBar style="auto" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="listing/[id]"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="listing/create"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                </Stack>
              </SavedProvider>
            </FiltersProvider>
          </ListingsProvider>
        </AuthProvider>
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
