import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../../src/lib/api';
import { getConfig } from '../../../src/lib/store';

export default function AmenityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [amenity, setAmenity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const config = getConfig();

  useEffect(() => {
    if (!config) return;
    api<any>(`/hotels/${config.hotel.id}/amenities/${id}`)
      .then(setAmenity)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  if (!amenity)
    return (
      <View style={styles.center}>
        <Text>Not found</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {amenity.photoUrls?.[0] && (
        <Image source={{ uri: amenity.photoUrls[0] }} style={styles.photo} />
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{amenity.name}</Text>
        <Text style={styles.category}>{amenity.category}</Text>
        {amenity.description && <Text style={styles.desc}>{amenity.description}</Text>}
        {amenity.hours && <Text style={styles.info}>Hours: {amenity.hours}</Text>}
        {amenity.latitude && amenity.longitude && (
          <Text style={styles.info}>
            Location: {amenity.latitude.toFixed(4)}, {amenity.longitude.toFixed(4)}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f9fafb' },
  photo: { width: '100%', height: 200 },
  content: { padding: 24 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  category: { fontSize: 14, color: '#1a56db', fontWeight: '500', marginBottom: 16 },
  desc: { fontSize: 16, color: '#374151', marginBottom: 16, lineHeight: 24 },
  info: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
});
