import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getConfig } from '../../src/lib/store';
import { useTheme } from '../../src/context/ThemeContext';

const GOLD = '#c9a84c';
const CREAM = '#f5f0e8';
const MUTED = '#8a8578';
const DARK = '#1a1a2e';

export default function InfoScreen() {
  const config = getConfig();
  const { theme } = useTheme();
  if (!config) return null;
  const { hotel } = config;

  return (
    <View style={[styles.container, { backgroundColor: theme.primary || DARK }]}>
      <Text style={styles.title}>{hotel.name}</Text>
      <View style={[styles.accentLine, { backgroundColor: theme.secondary || GOLD }]} />
      {hotel.address && (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={theme.secondary || GOLD} />
          <Text style={styles.info}>{hotel.address}</Text>
        </View>
      )}

      <View style={styles.divider} />
      <Text style={[styles.section, { color: theme.secondary || GOLD }]}>YOUR STAY</Text>

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={18} color={MUTED} />
        <Text style={styles.info}>{config.guestName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="bed-outline" size={18} color={MUTED} />
        <Text style={styles.info}>Room {config.room.number}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} color={MUTED} />
        <Text style={styles.info}>
          {new Date(config.checkIn).toLocaleDateString()} —{' '}
          {new Date(config.checkOut).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: CREAM,
    letterSpacing: 2,
    marginBottom: 8,
  },
  accentLine: {
    width: 40,
    height: 2,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  info: { fontSize: 16, color: CREAM, fontWeight: '300' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    marginVertical: 24,
  },
  section: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 4,
    marginBottom: 16,
  },
});
