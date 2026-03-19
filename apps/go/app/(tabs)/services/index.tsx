import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../../src/lib/api';
import { getConfig } from '../../../src/lib/store';

export default function ServicesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const config = getConfig();

  useEffect(() => {
    if (!config) return;
    api<any[]>(`/hotels/${config.hotel.id}/services`)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <FlatList
      data={categories}
      keyExtractor={(c) => c}
      contentContainerStyle={styles.list}
      renderItem={({ item: category }) => (
        <View style={styles.section}>
          <Text style={styles.category}>{category}</Text>
          {items
            .filter((i) => i.category === category && i.available)
            .map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.item}
                onPress={() => router.push(`/services/${item.id}`)}
              >
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
                </View>
                {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
              </TouchableOpacity>
            ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  section: { marginBottom: 24 },
  category: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#374151' },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: '500' },
  itemPrice: { fontSize: 16, fontWeight: '600', color: '#1a56db' },
  itemDesc: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
