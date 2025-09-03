import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import Svg, { Path } from 'react-native-svg';

interface CustomBackButtonProps {
  onPress?: () => void;
}

export function CustomBackButton({ onPress }: CustomBackButtonProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Left Arrow Icon */}
        <View style={{ marginTop: 5 }}>
          <Svg
            fill={colors.primary}
            // xmlns="http://www.w3.org/2000/svg"
            width="10px"
            height="10px"
            viewBox="0 0 370.814 370.814"
          // xmlSpace="preserve"
          // {...props}
          >
            <Path d="M292.92 24.848L268.781 0 77.895 185.401 268.781 370.814 292.92 345.961 127.638 185.401z" />
          </Svg>
        </View>

        <ThemedText style={[styles.text, { color: colors.text }]}>
          Go back
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
