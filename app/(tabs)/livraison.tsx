import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/shared/AppHeader';
import { useAuthStore } from '../../store/authStore';
import { useMessageStore } from '../../store/messageStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';

type GiftPack = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
};

const GIFT_PACKS: GiftPack[] = [
  {
    id: 'marriage',
    name: 'Pack Mariage',
    emoji: '💍',
    description: 'Célébrez le grand jour avec des cadeaux pour les mariés',
    color: '#F59E0B',
  },
  {
    id: 'newborn',
    name: 'Pack Nouveau-né',
    emoji: '👶',
    description: 'Accueillez le nouveau venu avec les essentiels bébé',
    color: '#EC4899',
  },
  {
    id: 'home',
    name: 'Pack Maison',
    emoji: '🏠',
    description: 'Électroménager et essentiels pour le foyer',
    color: '#3B82F6',
  },
  {
    id: 'anniversary',
    name: 'Pack Anniversaire',
    emoji: '🎊',
    description: 'Surprenez vos proches pour un anniversaire mémorable',
    color: '#8B5CF6',
  },
  {
    id: 'birthday',
    name: 'Pack Fête',
    emoji: '🎂',
    description: 'Gâteaux, décorations et cadeaux pour une fête réussie',
    color: '#EF4444',
  },
  {
    id: 'ramadan',
    name: 'Pack Ramadan',
    emoji: '🌙',
    description: 'Dattes, gâteaux traditionnels et cadeaux du Ramadan',
    color: '#059669',
  },
];

const ALGERIA_WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi',
  'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt',
  'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla',
  'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane',
];

export default function LivraisonScreen() {
  const { currentUser } = useAuthStore();
  const { totalUnreadMessages } = useMessageStore();
  const { unreadCount: unreadNotifications } = useNotificationStore();

  const [selectedPack, setSelectedPack] = useState<GiftPack | null>(null);
  const [orderModal, setOrderModal] = useState(false);
  const [wilayaModal, setWilayaModal] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientWilaya, setRecipientWilaya] = useState('');

  if (!currentUser) return null;

  const openOrder = (pack: GiftPack) => {
    setSelectedPack(pack);
    setOrderModal(true);
  };

  const resetForm = () => {
    setRecipientName('');
    setRecipientPhone('');
    setRecipientWilaya('');
    setSelectedPack(null);
  };

  const handleSubmit = () => {
    if (!recipientName.trim() || !recipientPhone.trim() || !recipientWilaya) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs du destinataire.');
      return;
    }
    Alert.alert(
      'Commande reçue 🎉',
      `Votre ${selectedPack?.name} sera livré à ${recipientName} à ${recipientWilaya}.\n\nNotre équipe vous contactera pour finaliser la commande.`,
      [{ text: 'OK', onPress: () => { setOrderModal(false); resetForm(); } }],
    );
  };

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
        <View style={styles.banner}>
          <Text style={styles.bannerFlag}>🇩🇿</Text>
          <Text style={styles.bannerTitle}>Offrez à votre famille en Algérie</Text>
          <Text style={styles.bannerDesc}>
            Choisissez un pack, indiquez le destinataire et on s'occupe du reste depuis l'étranger.
          </Text>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment ça marche</Text>
          <View style={styles.stepsRow}>
            {[
              { icon: 'gift-outline' as const, label: 'Choisissez\nun pack' },
              { icon: 'person-outline' as const, label: 'Indiquez le\ndestinaire' },
              { icon: 'cube-outline' as const, label: 'On livre\nen Algérie' },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <View style={styles.step}>
                  <View style={styles.stepCircle}>
                    <Ionicons name={step.icon} size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                </View>
                {i < 2 && <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} style={styles.stepArrow} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Pack grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisissez un pack</Text>
          <View style={styles.packsGrid}>
            {GIFT_PACKS.map((pack) => (
              <TouchableOpacity
                key={pack.id}
                style={[styles.packCard, { borderTopColor: pack.color }]}
                onPress={() => openOrder(pack)}
                activeOpacity={0.8}
              >
                <Text style={styles.packEmoji}>{pack.emoji}</Text>
                <Text style={styles.packName}>{pack.name}</Text>
                <Text style={styles.packDesc} numberOfLines={2}>{pack.description}</Text>
                <View style={[styles.packBtn, { backgroundColor: pack.color }]}>
                  <Text style={styles.packBtnText}>Commander</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
          <Text style={styles.infoNoteText}>
            Les packs couvrent toute l'Algérie. Livraison assurée par nos partenaires locaux. Délai estimé : 2–5 jours ouvrés.
          </Text>
        </View>
      </ScrollView>

      {/* Order form modal */}
      <Modal visible={orderModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>
              {selectedPack?.emoji} {selectedPack?.name}
            </Text>
            <Text style={styles.modalSubtitle}>Informations du destinataire en Algérie</Text>

            <Text style={styles.fieldLabel}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Ahmed Benali"
              value={recipientName}
              onChangeText={setRecipientName}
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.fieldLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 0550 XX XX XX"
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.fieldLabel}>Wilaya</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setWilayaModal(true)}>
              <Text style={[styles.pickerText, !recipientWilaya && styles.pickerPlaceholder]}>
                {recipientWilaya || 'Sélectionner une wilaya'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>Envoyer ma commande</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelLinkBtn}
              onPress={() => { setOrderModal(false); resetForm(); }}
            >
              <Text style={styles.cancelLinkText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Wilaya picker modal */}
      <Modal visible={wilayaModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, styles.wilayaSheet]}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Sélectionner une wilaya</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ALGERIA_WILAYAS.map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[styles.wilayaRow, recipientWilaya === w && styles.wilayaRowActive]}
                  onPress={() => { setRecipientWilaya(w); setWilayaModal(false); }}
                >
                  <Text style={[styles.wilayaText, recipientWilaya === w && styles.wilayaTextActive]}>
                    {w}
                  </Text>
                  {recipientWilaya === w && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: 40 },

  banner: {
    margin: Spacing.base,
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bannerFlag: { fontSize: 44 },
  bannerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 28,
  },
  bannerDesc: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },

  section: { paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  step: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  stepArrow: { marginBottom: 20 },

  packsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  packCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 3,
    ...Shadow.sm,
  },
  packEmoji: { fontSize: 32 },
  packName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  packDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  packBtn: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  packBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },

  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.md,
  },
  infoNoteText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.info,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  wilayaSheet: { maxHeight: '70%' },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: -Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  pickerText: { fontSize: FontSize.base, color: Colors.textPrimary },
  pickerPlaceholder: { color: Colors.textTertiary },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  submitBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  cancelLinkBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  cancelLinkText: { fontSize: FontSize.base, color: Colors.textSecondary },

  wilayaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  wilayaRowActive: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
  },
  wilayaText: { fontSize: FontSize.base, color: Colors.textPrimary },
  wilayaTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
});
