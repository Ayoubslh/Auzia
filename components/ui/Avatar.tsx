import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontWeight } from '../../theme';

interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
  imageUrl?: string;
  onPress?: () => void;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  color = Colors.primary,
  size = 40,
  imageUrl,
  onPress,
  showBorder = false,
}) => {
  const fontSize = size * 0.35;
  const radius = size / 2;

  const inner = (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: radius, backgroundColor: color },
        showBorder && styles.border,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      )}
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
