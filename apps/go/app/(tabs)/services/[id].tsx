import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../src/lib/api';
import { getConfig } from '../../../src/lib/store';
import { useTheme } from '../../../src/context/ThemeContext';

const GOLD = '#c9a84c';
const CREAM = '#f5f0e8';
const MUTED = '#8a8578';
const DARK = '#1a1a2e';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [inputFocus, setInputFocus] = useState<string | null>(null);
  const config = getConfig();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (!config) return;
    api<any>(`/hotels/${config.hotel.id}/services/${id}`)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleOrder() {
    if (!config) return;
    setOrdering(true);
    try {
      await api(`/hotels/${config.hotel.id}/reservations/${config.id}/requests`, {
        method: 'POST',
        body: JSON.stringify({
          itemId: id,
          quantity: parseInt(quantity) || 1,
          notes: notes || undefined,
        }),
      });
      Alert.alert('Order Placed', 'Your request has been submitted', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setOrdering(false);
    }
  }

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.primary || DARK }]}>
        <ActivityIndicator size="large" color={theme.secondary || GOLD} />
      </View>
    );
  if (!item)
    return (
      <View style={[styles.center, { backgroundColor: theme.primary || DARK }]}>
        <Text style={{ color: CREAM }}>Item not found</Text>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: theme.primary || DARK }]}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={[styles.price, { color: theme.secondary || GOLD }]}>
        ${Number(item.price).toFixed(2)}
      </Text>
      {item.description && <Text style={styles.desc}>{item.description}</Text>}

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={[styles.input, inputFocus === 'qty' && styles.inputFocused]}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        placeholderTextColor={MUTED}
        onFocus={() => setInputFocus('qty')}
        onBlur={() => setInputFocus(null)}
      />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }, inputFocus === 'notes' && styles.inputFocused]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholderTextColor={MUTED}
        onFocus={() => setInputFocus('notes')}
        onBlur={() => setInputFocus(null)}
      />

      <Text style={[styles.total, { color: theme.secondary || GOLD }]}>
        Total: ${(Number(item.price) * (parseInt(quantity) || 1)).toFixed(2)}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.secondary || GOLD }]}
        onPress={handleOrder}
        disabled={ordering}
      >
        <Text style={[styles.buttonText, { color: theme.primary || DARK }]}>
          {ordering ? 'Placing Order...' : 'Place Order'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 24 },
  name: { fontSize: 28, fontWeight: '300', color: CREAM, marginBottom: 8, letterSpacing: 1 },
  price: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  desc: { fontSize: 16, color: MUTED, marginBottom: 28, lineHeight: 24 },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: MUTED,
    marginBottom: 6,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
    padding: 14,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    fontSize: 16,
    color: CREAM,
  },
  inputFocused: {
    borderBottomColor: GOLD,
    borderBottomWidth: 2,
  },
  total: { fontSize: 20, fontWeight: '600', marginBottom: 20, letterSpacing: 1 },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
