import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';

interface ConnectModalProps {
  visible: boolean;
  userName: string;
  avatarInitials: string;
  avatarColor: string;
  onClose: () => void;
  onSend: (note: string) => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  visible,
  userName,
  avatarInitials,
  avatarColor,
  onClose,
  onSend,
}) => {
  const { t } = useTranslation();
  const [note, setNote] = useState('');

  const handleSend = () => {
    onSend(note.trim());
    setNote('');
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={handleClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Avatar initials={avatarInitials} color={avatarColor} size={40} />
            <View style={styles.headerText}>
              <Text style={styles.title}>{t('connect_modal.title')}</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('connect_modal.note_label')}</Text>
          <TextInput
            style={styles.textarea}
            value={note}
            onChangeText={setNote}
            placeholder={t('connect_modal.note_placeholder', { name: userName.split(' ')[0] })}
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={4}
            maxLength={280}
          />

          <Button
            label={t('connect_modal.send_request')}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSend}
            style={styles.sendBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  headerText: { flex: 1 },
  title: { fontSize: FontSize.sm, color: Colors.textSecondary },
  userName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, letterSpacing: 0.5 },
  textarea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    ...Platform.select({ android: { textAlignVertical: 'top' as const } }),
  },
  sendBtn: { marginTop: Spacing.sm, marginBottom: Spacing.sm },
});
