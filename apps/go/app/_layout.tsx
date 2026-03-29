import { useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { ThemeProvider } from '../src/context/ThemeContext';
import { isProvisioned, subscribe, loadPersistedConfig } from '../src/lib/store';
import { initNfc } from '../src/lib/nfc';

export default function RootLayout() {
  const [provisioned, setProvisioned] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Kiosk mode
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // Init NFC + load persisted config
  useEffect(() => {
    (async () => {
      await initNfc();
      const loaded = await loadPersistedConfig();
      setProvisioned(loaded || isProvisioned());
      setReady(true);
    })();
    return subscribe(() => setProvisioned(isProvisioned()));
  }, []);

  // Routing guard
  useEffect(() => {
    if (!ready) return;
    if (!provisioned && segments[0] !== 'provision') router.replace('/provision');
    else if (provisioned && segments[0] === 'provision') router.replace('/');
  }, [provisioned, segments, ready]);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <StatusBar hidden />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
