import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius } from '../../theme';

interface BadgeProps {
  count: number;
  color?: string;
}

export const NotificationBadge: React.FC<BadgeProps> = ({
  count,
  color = Colors.error,
}) => {
  if (count === 0) return null;
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.count}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

interface TagBadgeProps {
  label: string;
  emoji?: string;
  bg?: string;
  color?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  label,
  emoji,
  bg = Colors.badgeOrangeBg,
  color = Colors.badgeOrange,
}) => (
  <View style={[styles.tag, { backgroundColor: bg }]}>
    {emoji && <Text style={styles.tagEmoji}>{emoji}</Text>}
    <Text style={[styles.tagText, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  count: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  tagEmoji: { fontSize: 11 },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
