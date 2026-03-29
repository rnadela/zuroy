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
import { useTheme } from '../../../src/context/ThemeContext';

const GOLD = '#c9a84c';
const CREAM = '#f5f0e8';
const MUTED = '#8a8578';
const DARK = '#1a1a2e';
const CARD_BG = '#222240';

export default function ServicesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const config = getConfig();
  const { theme } = useTheme();

  useEffect(() => {
    if (!config) return;
    api<any[]>(`/hotels/${config.hotel.id}/services`)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.primary || DARK }]}>
        <ActivityIndicator size="large" color={theme.secondary || GOLD} />
      </View>
    );

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <FlatList
      data={categories}
      keyExtractor={(c) => c}
      style={{ backgroundColor: theme.primary || DARK }}
      contentContainerStyle={styles.list}
      renderItem={({ item: category }) => (
        <View style={styles.section}>
          <Text style={[styles.category, { color: theme.secondary || GOLD }]}>{category}</Text>
          {items
            .filter((i) => i.category === category && i.available)
            .map((item, idx, arr) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, idx < arr.length - 1 && styles.itemBorder]}
                onPress={() => router.push(`/services/${item.id}`)}
              >
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={[styles.itemPrice, { color: theme.secondary || GOLD }]}>
                    ${Number(item.price).toFixed(2)}
                  </Text>
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
  list: { padding: 20 },
  section: { marginBottom: 28 },
  category: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  item: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  itemBorder: {},
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: '400', color: CREAM },
  itemPrice: { fontSize: 16, fontWeight: '600' },
  itemDesc: { fontSize: 14, color: MUTED, marginTop: 6 },
});
