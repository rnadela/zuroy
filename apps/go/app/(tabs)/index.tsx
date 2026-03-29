import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { getConfig } from '../../src/lib/store';
import { useTheme } from '../../src/context/ThemeContext';

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
      <View style={styles.card}>
        <Text style={styles.welcome}>Welcome, {guestName}!</Text>
        <Text style={styles.info}>
          Room {room.number}
          {room.floor ? ` • Floor ${room.floor}` : ''}
        </Text>
        <Text style={styles.info}>Checkout: {new Date(checkOut).toLocaleDateString()}</Text>
      </View>
    </>
  );

  if (theme.backgroundUrl) {
    return (
      <ImageBackground
        source={{ uri: theme.backgroundUrl }}
        style={styles.container}
        imageStyle={{ opacity: 0.8 }}
      >
        {content}
      </ImageBackground>
    );
  }

  return <View style={[styles.container, { backgroundColor: theme.primary }]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 120, height: 120, marginBottom: 16 },
  hotelName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  welcome: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  info: { fontSize: 16, color: '#4b5563', marginBottom: 4 },
});
