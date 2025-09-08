import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
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
    backgroundColor: colors.cardBackground,
  },
  title: {
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: -0.42,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text,
  },
  message: {
    fontSize: 12,
    lineHeight: 22,
    letterSpacing: -0.25,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.muted,
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
  cancelButtonText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
    color: colors.muted,
  },
  deleteButtonText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

interface DeletePromptProps {
  visible: boolean;
  invoiceId: string;
  onCancel: () => void;
  onDelete: () => void;
}

export function DeletePrompt({ visible, invoiceId, onCancel, onDelete }: DeletePromptProps) {
  const colorScheme  = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Memoize styles for performance
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            Confirm Deletion
          </Text>
          
          <Text style={styles.message}>
            Are you sure you want to delete invoice #{invoiceId}? This action cannot be undone.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={styles.deleteButtonText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
