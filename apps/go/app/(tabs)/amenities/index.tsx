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

export default function AmenitiesScreen() {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const config = getConfig();
  const router = useRouter();

  useEffect(() => {
    if (!config) return;
    api<any[]>(`/hotels/${config.hotel.id}/amenities`)
      .then(setAmenities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  const categories = [...new Set(amenities.map((a) => a.category))].sort();

  return (
    <FlatList
      data={categories}
      keyExtractor={(c) => c}
      contentContainerStyle={styles.list}
      renderItem={({ item: category }) => (
        <View style={styles.section}>
          <Text style={styles.category}>{category}</Text>
          {amenities
            .filter((a) => a.category === category)
            .map((amenity) => (
              <TouchableOpacity
                key={amenity.id}
                style={styles.card}
                onPress={() => router.push(`/amenities/${amenity.id}`)}
              >
                <Text style={styles.name}>{amenity.name}</Text>
                {amenity.hours && <Text style={styles.hours}>{amenity.hours}</Text>}
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, elevation: 2 },
  name: { fontSize: 16, fontWeight: '500' },
  hours: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
