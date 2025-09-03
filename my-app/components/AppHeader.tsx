import { View, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';

export function AppHeader() {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = Colors[colorScheme ?? 'dark'];
  return (
    <ThemedView style={[styles.header, { backgroundColor: colors.cardBackground }]}>  
      {/* Left: logo box */}
      <View style={styles.left}>
        <View style={[styles.logoBg, { backgroundColor: colors.primary }]}>  
          <SvgUri
            uri={Asset.fromModule(require('@/assets/logo.svg')).uri}
            width={32}
            height={32}
          />
        </View>
      </View>

      {/* Right: theme toggle, divider, avatar */}
      <View style={styles.right}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          style={styles.iconTouch}
          onPress={toggleTheme}
        >
          {colorScheme === 'dark' ? (
            <SvgUri uri={Asset.fromModule(require('@/assets/icon-sun.svg')).uri} width={20} height={20} />
          ) : (
            <SvgUri uri={Asset.fromModule(require('@/assets/icon-moon.svg')).uri} width={20} height={20} />
          )}
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

        <View style={[styles.avatarWrap, { borderColor: colors.primary }]}> 
          <Image source={require('@/assets/image-avatar.jpg')} style={styles.avatar} />
        </View>
      </View>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    // paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logoBg: {
    width: 64,
    height: 64,
    // borderRadius: 18,
    paddingTop: 6,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    // subtle inner shadow / overlay in dark mode could be added later
  },
  logo: {
    width: 32,
    height: 32,
  },
  right: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  // ensure this container fills the header height so children like the divider
  // can stretch to full height
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
    // stretch the divider to the full height of the header
    alignSelf: 'stretch',
    borderRadius: 0,
    marginHorizontal: 8,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
