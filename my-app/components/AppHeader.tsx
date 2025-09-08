import { View, StyleSheet, Image, TouchableOpacity, Platform, Appearance, useColorScheme, Switch } from 'react-native';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { useMemo } from 'react';
import IconSun from '@/assets/icon-sun.svg';
import IconMoon from '@/assets/icon-moon.svg';
import Logo from '@/assets/logo.svg';
const createStyles = (colors: typeof Colors.light, colorScheme: 'light' | 'dark') => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: colors.cardBackground,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logoBg: {
    width: 64,
    height: 64,
    paddingTop: 6,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  logo: {
    width: 32,
    height: 32,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  iconTouch: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIcon: {
    width: 20,
    height: 20,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    borderRadius: 0,
    marginHorizontal: 8,
    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: colors.primary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});

export function AppHeader() {
  // const { colorScheme, toggleTheme } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  // Memoize styles for performance
  const styles = useMemo(() => createStyles(colors, colorScheme ?? 'dark'), [colors, colorScheme]);
  const switchTheme = () => {
    Appearance.setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };
  console.log('Current color scheme:', colorScheme);
  return (
    <ThemedView style={styles.header}>  
      {/* Left: logo box */}
      <View style={styles.left}>
        <View style={styles.logoBg}>  
          <Logo width={32} height={32} />
        </View>
      </View>

      {/* Right: theme toggle, divider, avatar */}
      <View style={styles.right}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          style={styles.iconTouch}
          onPress={switchTheme}
        >
          {colorScheme === 'dark' ? (
            <IconSun width={20} height={20} />
          ) : (
            <IconMoon width={20} height={20} />
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.avatarWrap}> 
          <Image source={require('@/assets/image-avatar.jpg')} style={styles.avatar} />
        </View>
      </View>
    </ThemedView>
  );
}
