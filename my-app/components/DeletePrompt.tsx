import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';

interface DeletePromptProps {
  visible: boolean;
  invoiceId: string;
  onCancel: () => void;
  onDelete: () => void;
}

export function DeletePrompt({ visible, invoiceId, onCancel, onDelete }: DeletePromptProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Confirm Deletion
          </Text>
          
          <Text style={[styles.message, { color: colors.muted }]}>
            Are you sure you want to delete invoice #{invoiceId}? This action cannot be undone.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: colors.muted }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    width: width - 48,
    maxWidth: 480,
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: -0.42,
    fontWeight: '700',
    marginBottom: 16,
  },
  message: {
    fontSize: 12,
    lineHeight: 22,
    letterSpacing: -0.25,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 15,
    minWidth: 91,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F9FAFE',
  },
  deleteButton: {
    backgroundColor: '#EC5757',
  },
  buttonText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
  },
});
