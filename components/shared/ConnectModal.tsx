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
        {/* Tappable area around the dialog */}
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={handleClose} />

        <View style={styles.dialog}>
          <View style={styles.header}>
            <Avatar initials={avatarInitials} color={avatarColor} size={44} />
            <View style={styles.headerText}>
              <Text style={styles.headerSub}>{t('connect_modal.title')}</Text>
              <Text style={styles.headerName}>{userName}</Text>
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

          <View style={styles.footer}>
            <Text style={styles.charCount}>{note.length}/280</Text>
            <Button
              label={t('connect_modal.send_request')}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSend}
              style={styles.sendBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  dialog: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.xl,
    width: '100%',
    gap: Spacing.md,
    // Ensure the dialog renders above the backdrop touch
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerText: { flex: 1 },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
  headerName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textarea: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    ...Platform.select({ android: { textAlignVertical: 'top' as const } }),
  },
  footer: { gap: Spacing.sm },
  charCount: { fontSize: FontSize.xs, color: Colors.textTertiary, alignSelf: 'flex-end' },
  sendBtn: {},
});
