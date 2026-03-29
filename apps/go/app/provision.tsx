import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, setDeviceToken } from '../src/lib/api';
import { setConfig } from '../src/lib/store';
import { useTheme } from '../src/context/ThemeContext';
import { readNdefText } from '../src/lib/nfc';

export default function ProvisionScreen() {
  const [manualMode, setManualMode] = useState(false);
  const [token, setToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(true);
  const { setTheme } = useTheme();

  const doProvision = useCallback(
    async (provToken: string, devKey: string) => {
      setLoading(true);
      try {
        setDeviceToken(devKey);
        const config = await api<any>('/devices/provision', {
          method: 'POST',
          body: JSON.stringify({ provisioningToken: provToken }),
        });
        if (config.hotel) {
          setTheme({
            primary: config.hotel.primaryColor || '#1a56db',
            secondary: config.hotel.secondaryColor || '#7c3aed',
            logoUrl: config.hotel.logoUrl,
            backgroundUrl: config.hotel.backgroundUrl,
          });
        }
        setConfig(config);
      } catch (err: any) {
        Alert.alert('Provisioning Failed', err.message);
        setScanning(true);
      } finally {
        setLoading(false);
      }
    },
    [setTheme],
  );

  // NFC scanning loop
  useEffect(() => {
    if (manualMode || !scanning || loading) return;
    let cancelled = false;
    (async () => {
      while (!cancelled) {
        const text = await readNdefText();
        if (cancelled) break;
        if (text) {
          setScanning(false);
          Alert.alert('NFC Token Read', `Token: ${text.substring(0, 16)}...`, [{ text: 'OK' }]);
          break;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manualMode, scanning, loading, doProvision]);

  return (
    <View style={styles.container}>
      <Ionicons name="phone-portrait-outline" size={80} color="#9ca3af" />
      <Text style={styles.title}>Zuroy Go</Text>
      {!manualMode ? (
        <>
          <Ionicons name="wifi" size={48} color="#6b7280" style={{ marginTop: 24 }} />
          <Text style={styles.subtitle}>
            {loading ? 'Provisioning...' : scanning ? 'Waiting for NFC tap...' : 'Processing...'}
          </Text>
          {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}
          <TouchableOpacity
            style={styles.link}
            onPress={() => {
              setManualMode(true);
              setScanning(false);
            }}
          >
            <Text style={styles.linkText}>Enter manually</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Enter provisioning details</Text>
          <TextInput
            style={styles.input}
            placeholder="Provisioning Token"
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Device API Key"
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            secureTextEntry
          />
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => doProvision(token, apiKey)}>
              <Text style={styles.buttonText}>Provision</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.link}
            onPress={() => {
              setManualMode(false);
              setScanning(true);
            }}
          >
            <Text style={styles.linkText}>Use NFC instead</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  title: { fontSize: 32, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1a56db',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 20 },
  linkText: { color: '#1a56db', fontSize: 14, textDecorationLine: 'underline' },
});
