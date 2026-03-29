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

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  if (!item)
    return (
      <View style={styles.center}>
        <Text>Item not found</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={[styles.price, { color: theme.primary }]}>${Number(item.price).toFixed(2)}</Text>
      {item.description && <Text style={styles.desc}>{item.description}</Text>}
      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Text style={styles.total}>
        Total: ${(Number(item.price) * (parseInt(quantity) || 1)).toFixed(2)}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleOrder}
        disabled={ordering}
      >
        <Text style={styles.buttonText}>{ordering ? 'Placing Order...' : 'Place Order'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 24, backgroundColor: '#f9fafb' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  desc: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  total: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
