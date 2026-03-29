import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { getConfig } from '../../src/lib/store';
import { useTheme } from '../../src/context/ThemeContext';

const GOLD = '#c9a84c';
const CREAM = '#f5f0e8';
const MUTED = '#8a8578';

export default function HomeScreen() {
  const config = getConfig();
  const { theme } = useTheme();
  if (!config) return null;
  const { hotel, guestName, room, checkOut } = config;

  const content = (
    <>
      {theme.logoUrl && (
        <Image source={{ uri: theme.logoUrl }} style={styles.logo} resizeMode="contain" />
      )}
      <Text style={styles.hotelName}>{hotel.name}</Text>
      <View style={styles.accentLine} />
      <Text style={styles.welcome}>Welcome, {guestName}</Text>
      <View style={styles.roomBadge}>
        <Text style={styles.roomLabel}>ROOM</Text>
        <Text style={styles.roomNumber}>{room.number}</Text>
        {room.floor ? <Text style={styles.floorText}>Floor {room.floor}</Text> : null}
      </View>
      <View style={styles.card}>
        <Text style={styles.checkoutLabel}>CHECKOUT</Text>
        <Text style={styles.checkoutDate}>{new Date(checkOut).toLocaleDateString()}</Text>
      </View>
    </>
  );

  if (theme.backgroundUrl) {
    return (
      <ImageBackground source={{ uri: theme.backgroundUrl }} style={styles.container}>
        <View style={styles.overlay}>{content}</View>
      </ImageBackground>
    );
  }

  return <View style={[styles.container, { backgroundColor: theme.primary }]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
    width: '100%',
  },
  logo: { width: 100, height: 100, marginBottom: 20 },
  hotelName: {
    fontSize: 32,
    fontWeight: '300',
    color: CREAM,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: GOLD,
    marginBottom: 32,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '300',
    color: CREAM,
    marginBottom: 24,
  },
  roomBadge: {
    alignItems: 'center',
    marginBottom: 32,
  },
  roomLabel: {
    fontSize: 12,
    color: GOLD,
    letterSpacing: 4,
    marginBottom: 4,
  },
  roomNumber: {
    fontSize: 48,
    fontWeight: '300',
    color: GOLD,
  },
  floorText: {
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.05)',
  },
  checkoutLabel: {
    fontSize: 11,
    color: MUTED,
    letterSpacing: 3,
    marginBottom: 4,
  },
  checkoutDate: {
    fontSize: 18,
    fontWeight: '400',
    color: CREAM,
  },
});
