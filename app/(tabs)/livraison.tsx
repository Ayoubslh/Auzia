import { ScrollView, View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/shared/AppHeader';
import { useAuthStore } from '../../store/authStore';
import { useMessageStore } from '../../store/messageStore';
import { useNotificationStore } from '../../store/notificationStore';
import { GIFT_PACKS } from '../../constants/giftPacks';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';

export default function LivraisonScreen() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { totalUnreadMessages } = useMessageStore();
  const { unreadCount: unreadNotifications } = useNotificationStore();

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <AppHeader
        user={currentUser}
        notificationCount={unreadNotifications}
        messageCount={totalUnreadMessages}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero banner */}
        <View style={styles.hero}>
          <Text style={styles.heroFlag}>🇩🇿</Text>
          <Text style={styles.heroTitle}>Offrez à votre famille en Algérie</Text>
          <Text style={styles.heroDesc}>
            Choisissez un pack, indiquez le destinataire — on s'occupe de la livraison.
          </Text>
        </View>

        {/* How it works strip */}
        <View style={styles.stepsRow}>
          {[
            { icon: 'gift-outline' as const, label: 'Choisissez' },
            { icon: 'person-outline' as const, label: 'Destinataire' },
            { icon: 'cube-outline' as const, label: 'On livre' },
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepCircle}>
                <Ionicons name={step.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.stepLabel}>{step.label}</Text>
              {i < 2 && <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} style={styles.stepArrow} />}
            </View>
          ))}
        </View>

        {/* Pack cards — vertical banner list */}
        <Text style={styles.sectionTitle}>Choisissez un pack</Text>

        {GIFT_PACKS.map((pack) => (
          <TouchableOpacity
            key={pack.id}
            style={[styles.packCard, { borderLeftColor: pack.color }]}
            onPress={() => router.push(`/livraison/${pack.id}` as any)}
            activeOpacity={0.85}
          >
            <View style={styles.packLeft}>
              <View style={[styles.packEmojiWrap, { backgroundColor: pack.color + '18' }]}>
                <Text style={styles.packEmoji}>{pack.emoji}</Text>
              </View>
            </View>

            <View style={styles.packContent}>
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packTagline}>{pack.tagline}</Text>
              <Text style={styles.packDesc} numberOfLines={2}>{pack.description}</Text>
              <View style={styles.packFooter}>
                <View style={styles.deliveryTag}>
                  <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.deliveryText}>{pack.estimatedDays} jours</Text>
                </View>
                <View style={[styles.orderBtn, { backgroundColor: pack.color }]}>
                  <Text style={styles.orderBtnText}>Commander</Text>
                  <Ionicons name="arrow-forward" size={13} color={Colors.white} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
          <Text style={styles.infoText}>
            Livraison assurée par nos partenaires locaux dans toute l'Algérie.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: 40 },

  hero: {
    margin: Spacing.base,
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroFlag: { fontSize: 40 },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 28,
  },
  heroDesc: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },

  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    gap: 0,
  },
  step: { alignItems: 'center', gap: 4, flex: 1 },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  stepArrow: { marginBottom: 14 },

  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },

  packCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    ...Shadow.md,
    overflow: 'hidden',
  },
  packLeft: {
    padding: Spacing.base,
    justifyContent: 'center',
  },
  packEmojiWrap: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packEmoji: { fontSize: 32 },
  packContent: {
    flex: 1,
    padding: Spacing.base,
    paddingLeft: 0,
    gap: 3,
  },
  packName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  packTagline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  packFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  deliveryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deliveryText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BorderRadius.full,
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
  },
  orderBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },

  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.base,
    padding: Spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.info,
    lineHeight: 17,
  },
});
