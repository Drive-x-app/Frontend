import React, { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const pathname = usePathname();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-ExtraBold': Poppins_800ExtraBold,
    Poppins: Poppins_400Regular,
  });

  // Inject Google Fonts Poppins stylesheet on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const linkId = 'poppins-google-font';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap';
        document.head.appendChild(link);
      }
    }
  }, []);

  // Guard against Chrome's "Blocked aria-hidden on an element because its descendant retained focus"
  // Whenever the active route changes, blur any focused element in the exiting screen
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement)?.blur?.();
      }
    }
  }, [pathname]);

  // Global MutationObserver to automatically blur any element whose ancestor is marked aria-hidden="true"
  useEffect(() => {
    if (
      Platform.OS === 'web' &&
      typeof document !== 'undefined' &&
      typeof MutationObserver !== 'undefined'
    ) {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'aria-hidden'
          ) {
            const target = mutation.target as HTMLElement;
            if (
              target &&
              target.getAttribute('aria-hidden') === 'true' &&
              document.activeElement &&
              target.contains(document.activeElement)
            ) {
              (document.activeElement as HTMLElement)?.blur?.();
            }
          }
        }
      });

      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-hidden'],
      });

      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
