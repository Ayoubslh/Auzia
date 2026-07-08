import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../theme';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { currentUser, updateProfile, logout } = useAuthStore();
  const showToast = useToastStore((s) => s.show);

  const [showOnMap, setShowOnMap] = useState(currentUser?.showOnMap ?? true);
  const [allowChat, setAllowChat] = useState(currentUser?.allowChat ?? true);
  const [nameMode, setNameMode] = useState<'nickname' | 'fullname'>(
    currentUser?.nameDisplayMode ?? 'nickname'
  );

  if (!currentUser) return null;

  const save = async (patch: Parameters<typeof updateProfile>[0]) => {
    try {
      await updateProfile(patch);
      showToast(t('privacy.saved'));
    } catch {
      showToast(t('common.error_generic'));
    }
  };

  const handleShowOnMap = (val: boolean) => {
    setShowOnMap(val);
    save({ showOnMap: val });
  };

  const handleAllowChat = (val: boolean) => {
    setAllowChat(val);
    save({ allowChat: val });
  };

  const handleNameMode = (val: 'nickname' | 'fullname') => {
    setNameMode(val);
    save({ nameDisplayMode: val });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => { logout(); router.replace('/auth/login' as any); },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.xxl + insets.bottom }]}
      >
        {/* Visibility */}
        <Text style={styles.sectionLabel}>{t('privacy.section_visibility')}</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="map-outline"
            iconBg="#F0FDF4"
            iconColor="#16A34A"
            title={t('privacy.show_on_map')}
            subtitle={t('privacy.show_on_map_sub')}
            value={showOnMap}
            onValueChange={handleShowOnMap}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon="chatbubble-outline"
            iconBg={Colors.primaryLight}
            iconColor={Colors.primary}
            title={t('privacy.allow_chat')}
            subtitle={t('privacy.allow_chat_sub')}
            value={allowChat}
            onValueChange={handleAllowChat}
          />
        </View>

        {/* Name display */}
        <Text style={styles.sectionLabel}>{t('privacy.section_name')}</Text>
        <View style={styles.card}>
          <SelectRow
            icon="at-outline"
            iconBg="#FFF7ED"
            iconColor="#EA580C"
            title={t('privacy.name_nickname')}
            subtitle={t('privacy.name_nickname_sub')}
            selected={nameMode === 'nickname'}
            onPress={() => handleNameMode('nickname')}
          />
          <View style={styles.divider} />
          <SelectRow
            icon="person-outline"
            iconBg={Colors.badgeBlueBg}
            iconColor={Colors.badgeBlue}
            title={t('privacy.name_fullname')}
            subtitle={t('privacy.name_fullname_sub')}
            selected={nameMode === 'fullname'}
            onPress={() => handleNameMode('fullname')}
          />
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionLabel}>COMPTE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </View>
            <Text style={[styles.rowTitle, { color: Colors.error }]}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ToggleRow: React.FC<{
  icon: string; iconBg: string; iconColor: string;
  title: string; subtitle: string;
  value: boolean; onValueChange: (v: boolean) => void;
}> = ({ icon, iconBg, iconColor, title, subtitle, value, onValueChange }) => (
  <View style={styles.row}>
    <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Colors.border, true: Colors.primary }}
      thumbColor={Colors.white}
      ios_backgroundColor={Colors.border}
      style={Platform.OS === 'android' ? { transform: [{ scale: 0.9 }] } : undefined}
    />
  </View>
);

const SelectRow: React.FC<{
  icon: string; iconBg: string; iconColor: string;
  title: string; subtitle: string;
  selected: boolean; onPress: () => void;
}> = ({ icon, iconBg, iconColor, title, subtitle, selected, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
    </View>
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  scroll: { padding: Spacing.base, gap: Spacing.xs },

  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },

  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, ...Shadow.sm },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.base + 32 + Spacing.md },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  rowSubtitle: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 1 },

  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
});
