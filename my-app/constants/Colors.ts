/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Additional colors for invoicing app
    primary: '#7C5DFA',
    secondary: '#9277FF',
    danger: '#EC5757',
    success: '#33D69F',
    warning: '#FF8F00',
    info: '#0a7ea4',
    muted: '#888EB0',
    border: '#DFE3FA',
    cardBackground: '#F9FAFE',
    inputBackground: '#F8F8FB',
  },
  dark: {
    text: '#DFE3FA', // Figma: text on dark
    background: '#141625', // Figma: app background
    tint: tintColorDark,
    icon: '#7E88C3', // Figma: icon color
    tabIconDefault: '#7E88C3',
    tabIconSelected: tintColorDark,
    // Additional colors for invoicing app
    primary: '#7C5DFA',
    secondary: '#9277FF',
    danger: '#EC5757',
    success: '#33D69F',
    warning: '#FF8F00',
    info: '#0a7ea4',
    muted: '#888EB0', // Figma: muted/label
    border: '#252945', // Figma: border
    cardBackground: '#1E2139', // Figma: card background
    inputBackground: '#252945', // Figma: input background
  },
};
