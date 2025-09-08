import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface IconWrapperProps {
  children: React.ReactNode;
  position: 'left' | 'right';
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconWrapper({ children, position, disabled = false, style }: IconWrapperProps) {
  return (
    <View 
      style={StyleSheet.flatten([
        styles.iconWrapper,
        styles[position],
        disabled && styles.disabled,
        style
      ])}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    zIndex: 1,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
  disabled: {
    opacity: 0.4,
  },
});
