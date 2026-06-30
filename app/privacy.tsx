import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../theme';

export default function PrivacyScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const showToast = useToastStore((s) => s.show);

  const [publicProfile, setPublicProfile] = useState(true);
  const [showOnMap, setShowOnMap] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login' as any);
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    showToast('Vos données vous seront envoyées par email sous 48h');
  };

  const handleChangePassword = () => {
    showToast('Un lien de réinitialisation a été envoyé à votre email');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Confidentialité & sécurité</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Section title="VISIBILITÉ">
          <ToggleRow
            label="Profil visible publiquement"
            description="Les autres membres peuvent voir votre profil"
            value={publicProfile}
            onChange={setPublicProfile}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Afficher ma position sur la carte"
            description="Votre ville apparaît sur la carte de la diaspora"
            value={showOnMap}
            onChange={setShowOnMap}
          />
        </Section>

        <Section title="NOTIFICATIONS">
          <ToggleRow
            label="Notifications par email"
            description="Recevez des mises à jour par email"
            value={emailNotifs}
            onChange={setEmailNotifs}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Notifications push"
            description="Recevez des alertes sur votre appareil"
            value={pushNotifs}
            onChange={setPushNotifs}
          />
        </Section>

        <Section title="COMPTE">
          <ActionRow
            icon="key-outline"
            label="Changer le mot de passe"
            onPress={handleChangePassword}
          />
          <View style={styles.divider} />
          <ActionRow
            icon="download-outline"
            label="Télécharger mes données"
            onPress={handleDownloadData}
          />
        </Section>

        <Section title="ZONE DE DANGER">
          <ActionRow
            icon="trash-outline"
            label="Supprimer mon compte"
            danger
            onPress={handleDeleteAccount}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const ToggleRow: React.FC<{
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, description, value, onChange }) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleText}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleDesc}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: Colors.border, true: Colors.primary }}
      thumbColor={Colors.white}
    />
  </View>
);

const ActionRow: React.FC<{
  icon: string;
  label: string;
  danger?: boolean;
  onPress: () => void;
}> = ({ icon, label, danger, onPress }) => (
  <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon as any} size={18} color={danger ? Colors.error : Colors.textSecondary} />
    <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>{label}</Text>
    {!danger && (
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} style={styles.actionChevron} />
    )}
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
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxxl, gap: Spacing.lg },

  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginLeft: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.base },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
  },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  toggleDesc: { fontSize: FontSize.xs, color: Colors.textTertiary },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
  },
  actionLabel: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  actionLabelDanger: { color: Colors.error },
  actionChevron: { marginLeft: 'auto' },
});
