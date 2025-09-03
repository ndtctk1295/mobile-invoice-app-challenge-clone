import { View, type ViewProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  return <View style={[{ backgroundColor: colors.background }, style]} {...otherProps} />;
}
