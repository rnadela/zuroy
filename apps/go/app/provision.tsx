import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, setDeviceToken } from '../src/lib/api';
import { setConfig } from '../src/lib/store';
import { useTheme } from '../src/context/ThemeContext';
import { readNdefText } from '../src/lib/nfc';

const DARK = '#1a1a2e';
const GOLD = '#c9a84c';
const CREAM = '#f5f0e8';
const MUTED = '#8a8578';

export default function ProvisionScreen() {
  const [manualMode, setManualMode] = useState(false);
  const [token, setToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [inputFocus, setInputFocus] = useState<string | null>(null);
  const { setTheme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ).start();
  }, []);

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
            primary: config.hotel.primaryColor || DARK,
            secondary: config.hotel.secondaryColor || GOLD,
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
      <Text style={styles.brand}>ZUROY</Text>
      <Text style={styles.tagline}>Guest Experience</Text>

      {!manualMode ? (
        <>
          <View style={styles.nfcArea}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 0],
                  }),
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.4, 0],
                  }),
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.nfcIcon}>
              <Ionicons name="wifi" size={48} color={GOLD} />
            </View>
          </View>
          <Text style={styles.subtitle}>
            {loading ? 'Provisioning...' : scanning ? 'Tap NFC to begin' : 'Processing...'}
          </Text>
          {loading && <ActivityIndicator size="large" color={GOLD} style={{ marginTop: 16 }} />}
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
            style={[styles.input, inputFocus === 'token' && styles.inputFocused]}
            placeholder="Provisioning Token"
            placeholderTextColor={MUTED}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            onFocus={() => setInputFocus('token')}
            onBlur={() => setInputFocus(null)}
          />
          <TextInput
            style={[styles.input, inputFocus === 'apiKey' && styles.inputFocused]}
            placeholder="Device API Key"
            placeholderTextColor={MUTED}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            secureTextEntry
            onFocus={() => setInputFocus('apiKey')}
            onBlur={() => setInputFocus(null)}
          />
          {loading ? (
            <ActivityIndicator size="large" color={GOLD} />
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
    backgroundColor: DARK,
  },
  brand: {
    fontSize: 36,
    fontWeight: '300',
    color: GOLD,
    letterSpacing: 12,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: MUTED,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 48,
  },
  nfcArea: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: GOLD,
  },
  nfcIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: CREAM,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '300',
  },
  input: {
    width: '100%',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#2a2a4e',
    padding: 14,
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    fontSize: 16,
    color: CREAM,
  },
  inputFocused: {
    borderBottomColor: GOLD,
    borderBottomWidth: 2,
  },
  button: {
    backgroundColor: GOLD,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: DARK,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  link: { marginTop: 24 },
  linkText: {
    color: GOLD,
    fontSize: 14,
    textDecorationLine: 'underline',
    letterSpacing: 1,
  },
});
