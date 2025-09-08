import { StyleSheet, Text, useColorScheme, type TextProps } from 'react-native';
import { useMemo } from 'react';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const colorScheme  = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Memoize type-based style to avoid recomputation on every render
  const typeStyle = useMemo(() => {
    switch (type) {
      case 'title':
        return styles.title;
      case 'defaultSemiBold':
        return styles.defaultSemiBold;
      case 'subtitle':
        return styles.subtitle;
      case 'link':
        return styles.link;
      case 'default':
      default:
        return styles.default;
    }
  }, [type]);

  return (
    <Text
      style={[
        { color: colors.text },
        typeStyle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Spartan',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Spartan',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    fontFamily: 'Spartan',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Spartan',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    fontFamily: 'Spartan',
  },
});
