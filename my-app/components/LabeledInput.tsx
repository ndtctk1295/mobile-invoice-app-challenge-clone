import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";

export function LabeledInput({ label, value, onChangeText, colors, keyboardType, compact, hasCalendarIcon, onCalendarPress, readOnly, disabled }: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  colors: any;
  keyboardType?: any;
  compact?: boolean;
  hasCalendarIcon?: boolean;
  onCalendarPress?: () => void;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <View style={{ marginBottom: compact ? 8 : 14 }}>
      <ThemedText style={{ 
        color: disabled ? colors.muted : colors.muted, 
        marginBottom: 6, 
        fontSize: 12,
        fontWeight: '500',
        opacity: disabled ? 0.6 : 1
      }}>{label}</ThemedText>
      <View style={{ position: 'relative' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder=""
          placeholderTextColor={colors.muted}
          editable={!readOnly && !disabled}
          style={[
            styles.input,
            { 
              backgroundColor: disabled ? 'transparent' : colors.inputBackground, 
              color: disabled ? colors.muted : colors.text, 
              borderColor: disabled ? 'transparent' : colors.border,
              fontSize: 14,
              fontWeight: '500',
              paddingRight: hasCalendarIcon ? 50 : 14,
              opacity: disabled ? 0.6 : 1
            },
            compact ? { paddingVertical: 10 } : null,
          ]}
        />
        {hasCalendarIcon && (
          <TouchableOpacity 
            onPress={disabled ? undefined : onCalendarPress}
            disabled={disabled}
            style={{
              position: 'absolute',
              right: 14,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: disabled ? 0.4 : 1
            }}
          >
            <ThemedText style={{ color: colors.muted, fontSize: 16 }}>📅</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});