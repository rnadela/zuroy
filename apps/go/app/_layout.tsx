import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { isProvisioned, subscribe } from '../src/lib/store';

export default function RootLayout() {
  const [provisioned, setProvisioned] = useState(isProvisioned());
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => subscribe(() => setProvisioned(isProvisioned())), []);

  useEffect(() => {
    if (!provisioned && segments[0] !== 'provision') {
      router.replace('/provision');
    } else if (provisioned && segments[0] === 'provision') {
      router.replace('/');
    }
  }, [provisioned, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
