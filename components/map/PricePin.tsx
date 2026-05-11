/**
 * PricePin Component
 * Custom marker view showing formatted price as a pill-shaped badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, FontSizes, BorderRadius } from '../../constants/colors';
import { formatMarkerPrice } from '../../utils/formatters';

/**
 * Props for PricePin component
 */
interface PricePinProps {
  price: number;
  isSelected?: boolean;
}

/**
 * Custom price pin marker for map
 * Displays a pill-shaped badge with the property price
 */
const PricePin: React.FC<PricePinProps> = ({ price, isSelected = false }) => {
  const formattedPrice = formatMarkerPrice(price);

  return (
    <View style={styles.container}>
      <View style={[styles.pill, isSelected && styles.pillSelected]}>
        <Text style={[styles.text, isSelected && styles.textSelected]}>
          {formattedPrice}
        </Text>
      </View>
      <View style={[styles.pointer, isSelected && styles.pointerSelected]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: Colors.textPrimary,
    transform: [{ scale: 1.1 }],
  },
  text: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textSelected: {
    color: Colors.white,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    marginTop: -1,
  },
  pointerSelected: {
    borderTopColor: Colors.textPrimary,
  },
});

export default PricePin;
