import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, ms } from '../../theme';

interface FilterChipProps {
  label: string;
  emoji?: string;
  active?: boolean;
  onPress: () => void;
  showChevron?: boolean;
  isAdd?: boolean;
}

// Fixed chip height so emoji flags (which render tall on Android) can't
// push the chip into a circle. Content is vertically centred inside.
const CHIP_HEIGHT = ms(34);

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  emoji,
  active = false,
  onPress,
  showChevron = true,
  isAdd = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && styles.chipActive, isAdd && styles.chipAdd]}
    >
      {emoji && (
        <Text style={styles.emoji} numberOfLines={1} allowFontScaling={false}>
          {emoji}
        </Text>
      )}

      <Text
        style={[styles.label, active && styles.labelActive]}
        numberOfLines={1}
        allowFontScaling={false}
      >
        {label}
      </Text>

      {showChevron && !isAdd && (
        <Ionicons
          name="chevron-down"
          size={11}
          color={active ? Colors.white : Colors.textSecondary}
          style={styles.chevron}
        />
      )}

      {isAdd && (
        <Ionicons
          name="add"
          size={13}
          color={Colors.textSecondary}
          style={styles.chevron}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    // Fixed height prevents emoji from inflating the chip into a circle
    height: CHIP_HEIGHT,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    // Clip any oversized glyph
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipAdd: {
    borderStyle: 'dashed',
  },
  emoji: {
    fontSize: FontSize.sm,
    marginRight: 4,
    lineHeight: CHIP_HEIGHT, // vertically align within fixed height
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.white,
  },
  chevron: {
    marginLeft: 2,
  },
});
