import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../../../src/lib/api';
import { getConfig } from '../../../src/lib/store';

export default function OrdersScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const config = getConfig();

  useEffect(() => {
    if (!config) return;
    api<{ requests: any[] }>(`/hotels/${config.hotel.id}/reservations/${config.id}/charges`)
      .then((d) => setRequests(d.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <FlatList
      data={requests}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.item?.name || 'Unknown'}</Text>
            <Text style={styles.amount}>${Number(item.chargeAmount).toFixed(2)}</Text>
          </View>
          <Text style={styles.meta}>
            Qty: {item.quantity} • {item.status}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 16, marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '500' },
  amount: { fontSize: 16, fontWeight: '600', color: '#1a56db' },
  meta: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
});
