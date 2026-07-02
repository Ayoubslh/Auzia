import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';

export default function OptInfoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { completeOnboarding } = useAuthStore();

  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [about, setAbout] = useState('');

  const handleJoin = async () => {
    try {
      await completeOnboarding({ workField: domain, status, phoneNumber: phone, linkedin, instagram, aboutMe: about });
      router.replace('/(tabs)/diaspora');
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de finaliser le profil');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('onboarding.optinfo_title')}</Text>
            <Text style={styles.subtitle}>{t('onboarding.optinfo_subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('onboarding.domain_label')}
              value={domain}
              onChangeText={setDomain}
              placeholder={t('onboarding.domain_placeholder')}
              containerStyle={styles.input}
            />
            <Input
              label={t('onboarding.status_label')}
              value={status}
              onChangeText={setStatus}
              placeholder={t('onboarding.status_placeholder')}
              containerStyle={styles.input}
            />
            <Input
              label={t('onboarding.phone_label')}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('onboarding.phone_placeholder')}
              keyboardType="phone-pad"
              containerStyle={styles.input}
            />
            <Input
              label={t('onboarding.linkedin_label')}
              value={linkedin}
              onChangeText={setLinkedin}
              placeholder={t('onboarding.linkedin_placeholder')}
              autoCapitalize="none"
              containerStyle={styles.input}
            />
            <Input
              label={t('onboarding.instagram_label')}
              value={instagram}
              onChangeText={setInstagram}
              placeholder={t('onboarding.instagram_placeholder')}
              autoCapitalize="none"
              containerStyle={styles.input}
            />
            <Input
              label={t('onboarding.about_label')}
              value={about}
              onChangeText={setAbout}
              placeholder={t('onboarding.about_placeholder')}
              multiline
              numberOfLines={4}
              containerStyle={styles.input}
              style={styles.textarea}
            />
          </View>

          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleJoin}>
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} activeOpacity={0.85}>
            <Text style={styles.joinText}>{t('onboarding.join_community')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, paddingBottom: 120 },

  backBtn: {
    marginTop: Spacing.sm,
    marginLeft: Spacing.xl,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, gap: Spacing.xs, marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },

  form: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  input: {},
  textarea: { minHeight: 90, ...Platform.select({ android: { textAlignVertical: 'top' as const } }), paddingTop: Spacing.sm },

  dots: { flexDirection: 'row', gap: 6, marginTop: Spacing.xl, alignSelf: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { width: 20, backgroundColor: Colors.primary },

  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  skipBtn: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  joinBtn: {
    flex: 2,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.white },
});
