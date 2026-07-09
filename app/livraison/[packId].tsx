import { useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GIFT_PACKS } from '../../constants/giftPacks';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';

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

export default function PackDetailScreen() {
  const router = useRouter();
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const pack = GIFT_PACKS.find((p) => p.id === packId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [note, setNote] = useState('');
  const [wilayaModal, setWilayaModal] = useState(false);

  if (!pack) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Pack introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleOrder = () => {
    if (!name.trim() || !phone.trim() || !wilaya) {
      Alert.alert('Champs requis', 'Veuillez remplir le nom, le téléphone et la wilaya du destinataire.');
      return;
    }
    Alert.alert(
      'Commande reçue 🎉',
      `Votre ${pack.name} sera livré à ${name} à ${wilaya}.\n\nNotre équipe vous contactera pour finaliser le paiement et confirmer la livraison.\n\nDélai estimé : ${pack.estimatedDays} jours ouvrés.`,
      [{ text: 'Parfait !', onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={[styles.hero, { backgroundColor: pack.color }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.heroEmoji}>{pack.emoji}</Text>
            <Text style={styles.heroName}>{pack.name}</Text>
            <Text style={styles.heroTagline}>{pack.tagline}</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>À PROPOS DU PACK</Text>
            <Text style={styles.description}>{pack.description}</Text>
          </View>

          {/* What's included */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CE QUE COMPREND LE PACK</Text>
            <View style={styles.includesCard}>
              {pack.includes.map((item, i) => (
                <View key={i} style={[styles.includeRow, i < pack.includes.length - 1 && styles.includeDivider]}>
                  <View style={[styles.includeDot, { backgroundColor: pack.color }]} />
                  <Text style={styles.includeText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Shipping info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LIVRAISON</Text>
            <View style={styles.shippingCard}>
              <View style={styles.shippingRow}>
                <View style={[styles.shippingIcon, { backgroundColor: pack.color + '18' }]}>
                  <Ionicons name="time-outline" size={20} color={pack.color} />
                </View>
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Délai estimé</Text>
                  <Text style={styles.shippingValue}>{pack.estimatedDays} jours ouvrés</Text>
                </View>
              </View>
              <View style={styles.shippingDivider} />
              <View style={styles.shippingRow}>
                <View style={[styles.shippingIcon, { backgroundColor: pack.color + '18' }]}>
                  <Ionicons name="location-outline" size={20} color={pack.color} />
                </View>
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Zone de livraison</Text>
                  <Text style={styles.shippingValue}>Toute l'Algérie (48 wilayas)</Text>
                </View>
              </View>
              <View style={styles.shippingDivider} />
              <View style={styles.shippingRow}>
                <View style={[styles.shippingIcon, { backgroundColor: pack.color + '18' }]}>
                  <Ionicons name="people-outline" size={20} color={pack.color} />
                </View>
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Partenaires locaux</Text>
                  <Text style={styles.shippingValue}>Réseau de livreurs certifiés en Algérie</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PAIEMENT</Text>
            <View style={styles.paymentNote}>
              <Ionicons name="card-outline" size={18} color={Colors.info} />
              <Text style={styles.paymentNoteText}>
                Après confirmation de votre commande, notre équipe vous contactera pour le paiement par virement (Wise, Revolut) ou via Western Union. Le prix est confirmé à la commande.
              </Text>
            </View>
          </View>

          {/* Order form */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>INFORMATIONS DU DESTINATAIRE</Text>
            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Nom complet</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Ahmed Benali"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Colors.textTertiary}
              />

              <Text style={styles.fieldLabel}>Téléphone en Algérie</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 0550 XX XX XX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.textTertiary}
              />

              <Text style={styles.fieldLabel}>Wilaya</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setWilayaModal(true)}>
                <Text style={[styles.pickerText, !wilaya && styles.pickerPlaceholder]}>
                  {wilaya || 'Sélectionner une wilaya'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Note pour le livreur (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Adresse précise, instructions spéciales..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.orderBtn, { backgroundColor: pack.color }]}
            onPress={handleOrder}
            activeOpacity={0.85}
          >
            <Ionicons name="gift-outline" size={20} color={Colors.white} />
            <Text style={styles.orderBtnText}>Envoyer ma commande</Text>
          </TouchableOpacity>

          <Text style={styles.orderNote}>
            Un membre de notre équipe vous contactera sous 24h pour confirmer les détails.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Wilaya picker modal */}
      <Modal visible={wilayaModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sélectionner une wilaya</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ALGERIA_WILAYAS.map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[styles.wilayaRow, wilaya === w && styles.wilayaRowActive]}
                  onPress={() => { setWilaya(w); setWilayaModal(false); }}
                >
                  <Text style={[styles.wilayaText, wilaya === w && { color: pack.color, fontWeight: FontWeight.semibold }]}>
                    {w}
                  </Text>
                  {wilaya === w && <Ionicons name="checkmark" size={18} color={pack.color} />}
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
  scroll: { paddingBottom: 32 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: FontSize.base, color: Colors.textSecondary },

  hero: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroEmoji: { fontSize: 56 },
  heroName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  heroTagline: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  section: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  includesCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    overflow: 'hidden',
  },
  includeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  includeDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  includeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  includeText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  shippingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    overflow: 'hidden',
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  shippingDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
  shippingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shippingInfo: { flex: 1 },
  shippingTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  shippingValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.md,
  },
  paymentNoteText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.info,
    lineHeight: 19,
  },

  formCard: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: -Spacing.xs,
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
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
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

  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
  },
  orderBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  orderNote: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    lineHeight: 18,
  },

  // Modal
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
    maxHeight: '72%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
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
});
