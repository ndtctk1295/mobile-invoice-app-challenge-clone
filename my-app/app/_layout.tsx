
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CustomBackButton } from '@/components/CustomBackButton';
import { Colors } from '@/constants/Colors';


function Layout() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  if (!loaded) return null;
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppHeader />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen 
          name="invoice/[id]" 
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerShadowVisible: false,
            headerLeft: () => <CustomBackButton />,
          }}
        />
        <Stack.Screen 
          name="invoice/create" 
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerShadowVisible: false,
            headerLeft: () => <CustomBackButton />,
          }}
        />
        <Stack.Screen 
          name="invoice/edit/[id]" 
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerShadowVisible: false,
            headerLeft: () => <CustomBackButton />,
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Layout />
    </AppThemeProvider>
  );
}
