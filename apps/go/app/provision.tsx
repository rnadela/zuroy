import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { api, setDeviceToken } from '../src/lib/api';
import { setConfig } from '../src/lib/store';

export default function ProvisionScreen() {
  const [token, setToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleProvision() {
    if (!token || !apiKey) return Alert.alert('Error', 'Enter both fields');
    setLoading(true);
    try {
      setDeviceToken(apiKey);
      const config = await api<any>('/devices/provision', {
        method: 'POST',
        body: JSON.stringify({ provisioningToken: token }),
      });
      setConfig(config);
    } catch (err: any) {
      Alert.alert('Provisioning Failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zuroy Go</Text>
      <Text style={styles.subtitle}>Awaiting Provisioning</Text>
      <Text style={styles.hint}>Enter provisioning token from front desk</Text>
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
        <TouchableOpacity style={styles.button} onPress={handleProvision}>
          <Text style={styles.buttonText}>Provision Device</Text>
        </TouchableOpacity>
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
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#6b7280', marginBottom: 24 },
  hint: { fontSize: 14, color: '#9ca3af', marginBottom: 16 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1a56db',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
