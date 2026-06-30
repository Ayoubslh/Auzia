import React, { useState } from 'react';
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
import {
  MOCK_DELIVERY_ITEMS,
  MOCK_DELIVERY_CATEGORIES,
  MOCK_DELIVERY_ORDERS,
} from '../../mock';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import type { DeliveryOrder } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  pending: Colors.warning,
  accepted: Colors.info,
  in_transit: Colors.primary,
  delivered: Colors.success,
};

export default function LivraisonScreen() {
  const { currentUser } = useAuthStore();
  const { conversations } = useMessageStore();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  const filteredItems = activeCategory
    ? MOCK_DELIVERY_ITEMS.filter((i) => i.category === activeCategory)
    : MOCK_DELIVERY_ITEMS;

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <AppHeader user={currentUser} notificationCount={3} messageCount={totalUnread} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.banner}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>{t('livraison.banner_badge')}</Text>
          </View>
          <Text style={styles.bannerTitle}>{t('livraison.banner_title')}</Text>
          <Text style={styles.bannerDesc}>{t('livraison.banner_desc')}</Text>
          <TouchableOpacity style={styles.bannerBtn} activeOpacity={0.85}>
            <Ionicons name="gift-outline" size={16} color={Colors.primary} />
            <Text style={styles.bannerBtnText}>{t('livraison.choose_gift')}</Text>
          </TouchableOpacity>
        </View>

        {MOCK_DELIVERY_ORDERS.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('livraison.my_orders_section')}</Text>
            {MOCK_DELIVERY_ORDERS.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('livraison.categories_section')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {MOCK_DELIVERY_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  activeCategory === cat.name && styles.categoryChipActive,
                ]}
                onPress={() =>
                  setActiveCategory(activeCategory === cat.name ? null : cat.name)
                }
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    activeCategory === cat.name && styles.categoryNameActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('livraison.send_now_section')}</Text>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemIconWrap}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                {item.isBestseller && (
                  <View style={styles.bestsellerBadge}>
                    <Text style={styles.bestsellerText}>{t('livraison.bestseller')}</Text>
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.itemBottom}>
                  <Text style={styles.itemPrice}>{item.price} €</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.rating}>{item.rating}</Text>
                  </View>
                  <TouchableOpacity style={styles.sendBtn} activeOpacity={0.85}>
                    <Text style={styles.sendBtnText}>{t('livraison.send')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const OrderCard: React.FC<{ order: DeliveryOrder }> = ({ order }) => {
  const { t } = useTranslation();
  return (
    <View style={ocStyles.card}>
      <View style={ocStyles.left}>
        <Text style={ocStyles.emoji}>{order.item.emoji}</Text>
      </View>
      <View style={ocStyles.info}>
        <Text style={ocStyles.title}>{order.item.title}</Text>
        <Text style={ocStyles.receiver}>→ {order.receiverName}, {order.receiverCity}</Text>
        <Text style={ocStyles.tracking}>{order.trackingCode}</Text>
      </View>
      <View style={[ocStyles.statusBadge, { backgroundColor: STATUS_COLOR[order.status] + '22' }]}>
        <Text style={[ocStyles.statusText, { color: STATUS_COLOR[order.status] }]}>
          {t(`livraison.status_${order.status}`)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: Spacing.xxl },

  banner: {
    margin: Spacing.base,
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
  },
  bannerBadgeText: { fontSize: FontSize.xs, color: Colors.white },
  bannerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    lineHeight: 28,
  },
  bannerDesc: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
  },
  bannerBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },

  section: { paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },

  categoriesRow: { gap: Spacing.sm, paddingBottom: Spacing.xs },
  categoryChip: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryEmoji: { fontSize: 22 },
  categoryName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  categoryNameActive: { color: Colors.primary },

  itemCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  itemIconWrap: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 28 },
  bestsellerBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F59E0B',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  bestsellerText: { fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold },
  itemInfo: { flex: 1, gap: 3 },
  itemTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  itemDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  itemPrice: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  rating: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  sendBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
});

const ocStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  left: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  receiver: { fontSize: FontSize.xs, color: Colors.textSecondary },
  tracking: { fontSize: FontSize.xs, color: Colors.textTertiary },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
