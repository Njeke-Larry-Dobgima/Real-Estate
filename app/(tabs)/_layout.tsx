/**
 * Tab Layout - Bottom tab navigator with floating create button
 */

import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';

import { Colors, Shadows, Spacing, BorderRadius } from '../../constants/colors';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../../hooks/useAuth';

/**
 * Icon component props
 */
interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  showBadge?: boolean;
}

/**
 * Tab bar icon component
 */
const TabBarIcon = ({ name, color, focused, showBadge }: TabBarIconProps) => {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name={name} size={24} color={color} />
      {showBadge && <View style={styles.badge} />}
    </View>
  );
};

/**
 * Floating create button component
 */
const CreateButton = () => {
  const { user } = useAuth();

  const handlePress = () => {
    if (!user) {
      router.push('/(auth)/login');
    } else {
      router.push('/listing/create');
    }
  };

  return (
    <TouchableOpacity style={styles.createButton} onPress={handlePress} activeOpacity={0.8}>
      <Ionicons name="add" size={28} color={Colors.white} />
    </TouchableOpacity>
  );
};

/**
 * Tab layout component with bottom navigation
 */
export default function TabLayout() {
  const { activeFilterCount } = useFilters();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.gray400,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? 'map' : 'map-outline'}
                color={color}
                focused={focused}
                showBadge={hasActiveFilters}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? 'search' : 'search-outline'}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? 'heart' : 'heart-outline'}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? 'person' : 'person-outline'}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
      <CreateButton />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    height: 85,
    paddingTop: 8,
    paddingBottom: 25,
    ...Shadows.medium,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  createButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.large,
  },
});
