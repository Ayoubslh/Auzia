import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { NotificationBadge } from '../ui/Badge';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';
import type { User } from '../../types';

interface AppHeaderProps {
  user: User;
  notificationCount?: number;
  messageCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  notificationCount = 0,
  messageCount = 0,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Left: Profile */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={() => router.push('/profile')}
        activeOpacity={0.8}
      >
        <Avatar
          initials={user.avatarInitials}
          color={user.avatarColor}
          size={42}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userLocation}>
            {user.cityOfResidence}, {user.countryOfResidence}{' '}
            {user.countryOfResidenceFlag}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right: Icons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          <NotificationBadge count={notificationCount} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/messages')}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-outline" size={22} color={Colors.textPrimary} />
          <NotificationBadge count={messageCount} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userInfo: {
    gap: 1,
  },
  userName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  userLocation: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
