import React from 'react';
import { View, StyleSheet, Pressable, TextInputProps } from 'react-native';
import { Label } from './atoms/Label';
import { IconWrapper } from './atoms/IconWrapper';
import { CustomTextInput } from './atoms/CustomTextInput';
import { ErrorMessage } from './atoms/ErrorMessage';

interface LabeledInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  errorMessage?: string;
  required?: boolean;
  compact?: boolean;
  disabled?: boolean;
}

export function LabeledInput({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  errorMessage,
  required = false,
  compact = false,
  disabled = false,
  ...textInputProps
}: LabeledInputProps) {
  const hasError = !!errorMessage;
  
  return (
    <View style={StyleSheet.flatten([styles.container, compact && styles.compact])}>
      <Label
        required={required}
        disabled={disabled}
        compact={compact}
      >
        {label}
      </Label>
      <View style={styles.inputContainer}>
        {leftIcon && (
          <IconWrapper position="left" disabled={disabled}>
            {leftIcon}
          </IconWrapper>
        )}
        
        <CustomTextInput
          {...textInputProps}
          hasLeftIcon={!!leftIcon}
          hasRightIcon={!!rightIcon}
          disabled={disabled}
          compact={compact}
          error={hasError}
        />
        
        {rightIcon && (
          <IconWrapper position="right" disabled={disabled}>
            {onRightIconPress ? (
              <Pressable
                onPress={disabled ? undefined : onRightIconPress}
                disabled={disabled}
                style={styles.pressableIcon}
              >
                {rightIcon}
              </Pressable>
            ) : (
              rightIcon
            )}
          </IconWrapper>
        )}
      </View>
      
      <ErrorMessage visible={hasError}>
        {errorMessage}
      </ErrorMessage>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  compact: {
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  pressableIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});