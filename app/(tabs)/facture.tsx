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
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/shared/AppHeader';
import { useAuthStore } from '../../store/authStore';
import { useMessageStore } from '../../store/messageStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';

type Operator = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bg: string;
  denominations: number[];
};

const OPERATORS: Operator[] = [
  {
    id: 'mobilis',
    name: 'Mobilis',
    emoji: '🟢',
    color: '#00A650',
    bg: '#E8F8EE',
    denominations: [100, 200, 500, 1000, 2000],
  },
  {
    id: 'ooredoo',
    name: 'Ooredoo',
    emoji: '🔴',
    color: '#E2231A',
    bg: '#FEE8E7',
    denominations: [100, 200, 500, 1000, 2000],
  },
  {
    id: 'djezzy',
    name: 'Djezzy',
    emoji: '🔵',
    color: '#0066CC',
    bg: '#E6F0FB',
    denominations: [100, 200, 500, 1000, 2000],
  },
];

const PAYMENT_SOLUTIONS = [
  {
    icon: '💳',
    title: 'Wise / Revolut',
    desc: 'Virement bancaire vers un compte algérien en DZD. Faible commission et taux compétitif.',
    status: 'Disponible',
    statusColor: Colors.success,
  },
  {
    icon: '📮',
    title: 'BaridiPay',
    desc: "Application de la Poste algérienne. Idéale si votre famille possède un compte CCP.",
    status: 'Disponible',
    statusColor: Colors.success,
  },
  {
    icon: '🔗',
    title: 'D17 / PayForce',
    desc: 'Plateformes de paiement algériennes en plein essor. Intégration partenaire en cours.',
    status: 'Bientôt',
    statusColor: Colors.warning,
  },
  {
    icon: '💵',
    title: 'Western Union',
    desc: 'Envoi de cash récupérable en Algérie. La famille peut ensuite recharger localement.',
    status: 'Disponible',
    statusColor: Colors.success,
  },
  {
    icon: '⚡',
    title: 'Rechargement direct',
    desc: "Partenariat direct avec les opérateurs via leur API. En cours de négociation.",
    status: 'Bientôt',
    statusColor: Colors.warning,
  },
];

export default function FactureScreen() {
  const { currentUser } = useAuthStore();
  const { totalUnreadMessages } = useMessageStore();
  const { unreadCount: unreadNotifications } = useNotificationStore();

  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [topupModal, setTopupModal] = useState(false);
  const [phone, setPhone] = useState('');

  if (!currentUser) return null;

  const handleSelectOperator = (op: Operator) => {
    setSelectedOperator(op);
    setSelectedAmount(null);
  };

  const handleTopup = () => {
    if (!phone.trim() || !selectedAmount) {
      Alert.alert('Champs requis', 'Veuillez entrer un numéro et sélectionner un montant.');
      return;
    }
    Alert.alert(
      'Demande enregistrée 📱',
      `Rechargement de ${selectedAmount} DZD pour ${phone} (${selectedOperator?.name}) enregistré.\n\nNotre équipe traitera votre demande sous 24h.`,
      [{ text: 'OK', onPress: () => { setTopupModal(false); setPhone(''); setSelectedAmount(null); } }],
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
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Ionicons name="phone-portrait-outline" size={28} color={Colors.white} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Rechargez à distance</Text>
            <Text style={styles.bannerDesc}>
              Offrez du crédit téléphonique à vos proches en Algérie depuis l'étranger.
            </Text>
          </View>
        </View>

        {/* Operator selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OPÉRATEURS ALGÉRIENS</Text>
          <View style={styles.operatorsRow}>
            {OPERATORS.map((op) => (
              <TouchableOpacity
                key={op.id}
                style={[
                  styles.operatorCard,
                  selectedOperator?.id === op.id && { borderColor: op.color, borderWidth: 2 },
                ]}
                onPress={() => handleSelectOperator(op)}
                activeOpacity={0.8}
              >
                <View style={[styles.operatorIconCircle, { backgroundColor: op.bg }]}>
                  <Text style={styles.operatorEmoji}>{op.emoji}</Text>
                </View>
                <Text style={[
                  styles.operatorName,
                  selectedOperator?.id === op.id && { color: op.color },
                ]}>
                  {op.name}
                </Text>
                {selectedOperator?.id === op.id && (
                  <Ionicons name="checkmark-circle" size={16} color={op.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Denomination picker */}
        {selectedOperator && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MONTANT DU RECHARGEMENT</Text>
            <View style={styles.denomsGrid}>
              {selectedOperator.denominations.map((denom) => (
                <TouchableOpacity
                  key={denom}
                  style={[
                    styles.denomCard,
                    selectedAmount === denom && {
                      backgroundColor: selectedOperator.color,
                      borderColor: selectedOperator.color,
                    },
                  ]}
                  onPress={() => setSelectedAmount(denom)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.denomValue,
                    selectedAmount === denom && styles.denomActiveText,
                  ]}>
                    {denom.toLocaleString()}
                  </Text>
                  <Text style={[
                    styles.denomCurrency,
                    selectedAmount === denom && styles.denomActiveText,
                  ]}>
                    DZD
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedAmount && (
              <TouchableOpacity
                style={[styles.topupBtn, { backgroundColor: selectedOperator.color }]}
                onPress={() => setTopupModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="phone-portrait-outline" size={18} color={Colors.white} />
                <Text style={styles.topupBtnText}>
                  Recharger {selectedAmount} DZD — {selectedOperator.name}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Payment solutions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SOLUTIONS DE PAIEMENT</Text>
          <Text style={styles.solutionsNote}>
            Le paiement en devise étrangère → DZD est un défi réglementaire. Voici les options actuellement disponibles :
          </Text>
          {PAYMENT_SOLUTIONS.map((sol, i) => (
            <View key={i} style={styles.solutionRow}>
              <Text style={styles.solutionIcon}>{sol.icon}</Text>
              <View style={styles.solutionInfo}>
                <Text style={styles.solutionTitle}>{sol.title}</Text>
                <Text style={styles.solutionDesc}>{sol.desc}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: sol.statusColor + '22' }]}>
                <Text style={[styles.statusText, { color: sol.statusColor }]}>{sol.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Top-up modal */}
      <Modal visible={topupModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>
              {selectedOperator?.emoji} Rechargement {selectedOperator?.name}
            </Text>
            <Text style={[styles.modalAmount, selectedOperator && { color: selectedOperator.color }]}>
              {selectedAmount?.toLocaleString()} DZD
            </Text>

            <Text style={styles.fieldLabel}>Numéro de téléphone en Algérie</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 0550 XX XX XX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textTertiary}
            />

            <View style={styles.fxNote}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
              <Text style={styles.fxNoteText}>
                Notre équipe vous contactera pour finaliser le paiement et confirmer le rechargement.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                selectedOperator && { backgroundColor: selectedOperator.color },
              ]}
              onPress={handleTopup}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>Confirmer la demande</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLinkBtn} onPress={() => setTopupModal(false)}>
              <Text style={styles.cancelLinkText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: 40 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    margin: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  bannerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  bannerDesc: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    lineHeight: 17,
  },

  section: { paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },

  operatorsRow: { flexDirection: 'row', gap: Spacing.md },
  operatorCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  operatorIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorEmoji: { fontSize: 24 },
  operatorName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },

  denomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  denomCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    minWidth: '28%',
  },
  denomValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  denomCurrency: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  denomActiveText: { color: Colors.white },

  topupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  topupBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },

  solutionsNote: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  solutionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  solutionIcon: { fontSize: 24, marginTop: 2 },
  solutionInfo: { flex: 1 },
  solutionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  solutionDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusText: { fontSize: 10, fontWeight: FontWeight.semibold },

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
  modalAmount: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
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
  fxNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.md,
  },
  fxNoteText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.info,
    lineHeight: 17,
  },
  confirmBtn: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  confirmBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  cancelLinkBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  cancelLinkText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
