/**
 * Tab Layout - Bottom tab navigator with 3 tabs
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Colors, Shadows } from '../../constants/colors';
import { useFilters } from '../../hooks/useFilters';

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
 * Tab layout component with bottom navigation
 */
export default function TabLayout() {
  const { activeFilterCount } = useFilters();
  const hasActiveFilters = activeFilterCount > 0;

  return (
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
    </Tabs>
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
});
