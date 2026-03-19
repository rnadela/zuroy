import { View, Text, StyleSheet } from 'react-native';
import { getConfig } from '../../src/lib/store';

export default function InfoScreen() {
  const config = getConfig();
  if (!config) return null;
  const { hotel } = config;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{hotel.name}</Text>
      {hotel.address && <Text style={styles.info}>{hotel.address}</Text>}
      <View style={styles.divider} />
      <Text style={styles.section}>Your Stay</Text>
      <Text style={styles.info}>Guest: {config.guestName}</Text>
      <Text style={styles.info}>Room: {config.room.number}</Text>
      <Text style={styles.info}>Check-in: {new Date(config.checkIn).toLocaleDateString()}</Text>
      <Text style={styles.info}>Check-out: {new Date(config.checkOut).toLocaleDateString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  info: { fontSize: 16, color: '#4b5563', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 20 },
  section: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
});
