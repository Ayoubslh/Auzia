import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius } from '../../theme';

interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
  onPress?: () => void;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  color = Colors.primary,
  size = 40,
  onPress,
  showBorder = false,
}) => {
  const fontSize = size * 0.35;

  const inner = (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        showBorder && styles.border,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  border: {
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
