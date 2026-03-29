import { View, Text, Image, ImageBackground, StyleSheet, Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { getConfig } from '../../src/lib/store';
import { useTheme } from '../../src/context/ThemeContext';

const GOLD = '#c9a84c';
const CREAM = '#f5f0e8';
const MUTED = '#8a8578';

export default function HomeScreen() {
  const config = getConfig();
  const { theme } = useTheme();
  if (!config) return null;
  const { hotel, guestName, room, checkOut, hotspotSsid, hotspotPassword, hotspotEnabled, hotspotDataUsedMb } = config;

  const dataCap = hotel.hotspotDataCapMb;
  const usagePercent = dataCap && hotspotDataUsedMb != null ? Math.min((hotspotDataUsedMb / dataCap) * 100, 100) : 0;

  const copyPassword = async () => {
    if (hotspotPassword) {
      await Clipboard.setStringAsync(hotspotPassword);
      Alert.alert('Copied', 'Password copied to clipboard');
    }
  };

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

      {hotspotSsid && (
        <View style={styles.hotspotCard}>
          <Text style={styles.hotspotTitle}>YOUR HOTSPOT</Text>
          {hotspotEnabled === false && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>Data limit reached</Text>
            </View>
          )}
          <Text style={styles.ssidText}>{hotspotSsid}</Text>
          {hotspotPassword && (
            <Pressable onPress={copyPassword} style={styles.passwordRow}>
              <Text style={styles.passwordText}>{hotspotPassword}</Text>
              <Text style={styles.copyHint}>TAP TO COPY</Text>
            </Pressable>
          )}
          {dataCap && hotspotDataUsedMb != null ? (
            <View style={styles.usageContainer}>
              <View style={styles.usageBarBg}>
                <View style={[styles.usageBarFill, { width: `${usagePercent}%` }]} />
              </View>
              <Text style={styles.usageText}>
                {hotspotDataUsedMb} MB / {dataCap} MB
              </Text>
            </View>
          ) : hotspotDataUsedMb != null ? (
            <Text style={styles.usageText}>{hotspotDataUsedMb} MB used</Text>
          ) : null}
        </View>
      )}
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
  hotspotCard: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    marginTop: 24,
    width: '100%',
  },
  hotspotTitle: {
    fontSize: 11,
    color: GOLD,
    letterSpacing: 4,
    marginBottom: 12,
  },
  ssidText: {
    fontSize: 28,
    fontWeight: '300',
    color: CREAM,
    letterSpacing: 2,
    marginBottom: 8,
  },
  passwordRow: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
  },
  passwordText: {
    fontSize: 20,
    fontWeight: '400',
    color: CREAM,
    fontFamily: 'monospace' as never,
    letterSpacing: 2,
  },
  copyHint: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 3,
    marginTop: 4,
  },
  usageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  usageBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 2,
  },
  usageText: {
    fontSize: 12,
    color: MUTED,
    letterSpacing: 1,
  },
  warningBadge: {
    backgroundColor: 'rgba(211, 47, 47, 0.2)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#ef5350',
    fontWeight: '600',
  },
});
