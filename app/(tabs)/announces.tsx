import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/AppHeader';
import { useAuthStore } from '../../store/authStore';
import { useMessageStore } from '../../store/messageStore';
import { announcementRepository } from '../../repositories/AnnouncementRepository';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import type { Announcement, AnnouncementType } from '../../types';

const ALL_TYPE_KEYS: Array<{ labelKey: string; value: AnnouncementType | 'Tous' }> = [
  { labelKey: 'announces.filter_all', value: 'Tous' },
  { labelKey: 'announces.filter_events', value: 'Événements' },
  { labelKey: 'announces.filter_deals', value: 'Réductions' },
  { labelKey: 'announces.filter_activities', value: 'Activités' },
  { labelKey: 'announces.filter_offers', value: 'Offres' },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'Événements': { bg: '#EFF6FF', text: '#3B82F6' },
  'Réductions': { bg: '#FFF7ED', text: '#F97316' },
  'Activités': { bg: '#F0FDF4', text: '#22C55E' },
  'Offres': { bg: '#FFF1F2', text: '#F43F5E' },
};

export default function AnnoncesScreen() {
  const { currentUser } = useAuthStore();
  const { conversations } = useMessageStore();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<AnnouncementType | 'Tous'>('Tous');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  useEffect(() => {
    const type = activeFilter === 'Tous' ? undefined : activeFilter;
    announcementRepository.getAnnouncements(type).then(setAnnouncements);
  }, [activeFilter]);

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <AppHeader user={currentUser} notificationCount={3} messageCount={totalUnread} />

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {ALL_TYPE_KEYS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.filterChip, activeFilter === tab.value && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === tab.value && styles.filterTextActive]}>
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {announcements.map((item) => (
          <AnnouncementCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const AnnouncementCard: React.FC<{ item: Announcement }> = ({ item }) => {
  const { t } = useTranslation();
  const [bookmarked, setBookmarked] = useState(item.isBookmarked ?? false);
  const typeStyle = TYPE_COLORS[item.type] ?? { bg: Colors.primaryLight, text: Colors.primary };

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.topRow}>
        <View style={[cardStyles.typeBadge, { backgroundColor: typeStyle.bg }]}>
          <Text style={cardStyles.typeEmoji}>{item.emoji}</Text>
          <Text style={[cardStyles.typeText, { color: typeStyle.text }]}>{item.type}</Text>
        </View>
        <View style={cardStyles.actions}>
          <TouchableOpacity onPress={() => setBookmarked((b) => !b)} style={cardStyles.iconBtn}>
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={bookmarked ? Colors.primary : Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={cardStyles.iconBtn}>
            <Ionicons name="share-social-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={cardStyles.title}>{item.title}</Text>

      <View style={cardStyles.metaRow}>
        <Ionicons name="calendar-outline" size={13} color={Colors.textTertiary} />
        <Text style={cardStyles.meta}>{item.date}</Text>
        <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
        <Text style={cardStyles.meta}>
          {item.location} {item.locationFlag}
        </Text>
      </View>

      <Text style={cardStyles.desc} numberOfLines={3}>
        {item.description}
      </Text>

      {item.code && (
        <View style={cardStyles.codeRow}>
          <Text style={cardStyles.codeLabel}>{t('announces.code_label')}</Text>
          <View style={cardStyles.codeBadge}>
            <Text style={cardStyles.codeText}>{item.code}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={cardStyles.moreBtn} activeOpacity={0.8}>
        <Text style={cardStyles.moreBtnText}>{t('announces.learn_more')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.xs,
  },
  filterRow: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  filterTextActive: { color: Colors.white },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.base,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  typeEmoji: { fontSize: 12 },
  typeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginRight: Spacing.xs,
  },
  desc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  codeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  codeBadge: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  codeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  moreBtn: {
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
});
