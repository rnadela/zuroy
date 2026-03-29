import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
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
const INPUT_BG = '#2a2a4a';

interface ExtensionRequest {
  id: string;
  newCheckOut: string;
  reason?: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#e0a800',
  APPROVED: '#2ecc71',
  DENIED: '#e74c3c',
};

export default function ExtendScreen() {
  const config = getConfig();
  const { theme } = useTheme();
  const router = useRouter();

  const [newCheckOut, setNewCheckOut] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const gold = theme.secondary || GOLD;
  const dark = theme.primary || DARK;

  const fetchRequests = useCallback(() => {
    if (!config) return;
    api<ExtensionRequest[]>(
      `/hotels/${config.hotel.id}/reservations/${config.id}/extensions`,
    )
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [config]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSubmit = async () => {
    if (!config) return;
    if (!newCheckOut.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Invalid date', 'Enter date as YYYY-MM-DD');
      return;
    }
    setSubmitting(true);
    try {
      await api(
        `/hotels/${config.hotel.id}/reservations/${config.id}/extensions`,
        {
          method: 'POST',
          body: JSON.stringify({
            newCheckOut,
            ...(reason.trim() ? { reason: reason.trim() } : {}),
          }),
        },
      );
      Alert.alert('Submitted', 'Your extension request has been sent.');
      setNewCheckOut('');
      setReason('');
      fetchRequests();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: dark }}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <View>
          <Text style={[styles.heading, { color: gold }]}>Stay Extension</Text>

          {config && (
            <View style={styles.card}>
              <Text style={styles.label}>Current checkout</Text>
              <Text style={[styles.dateValue, { color: gold }]}>
                {config.checkOut}
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.label}>New checkout date</Text>
            <TextInput
              style={[styles.input, { borderBottomColor: gold }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={MUTED}
              value={newCheckOut}
              onChangeText={setNewCheckOut}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />

            <Text style={[styles.label, { marginTop: 18 }]}>
              Reason (optional)
            </Text>
            <TextInput
              style={[styles.input, styles.multiline, { borderBottomColor: gold }]}
              placeholder="Why do you need to extend?"
              placeholderTextColor={MUTED}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: gold }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={DARK} />
              ) : (
                <Text style={styles.buttonText}>Request Extension</Text>
              )}
            </TouchableOpacity>
          </View>

          {requests.length > 0 && (
            <Text style={[styles.sectionTitle, { color: gold }]}>
              Previous Requests
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.reqDate}>{item.newCheckOut}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: STATUS_COLORS[item.status] || MUTED },
              ]}
            >
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
          {item.reason ? (
            <Text style={styles.reqReason}>{item.reason}</Text>
          ) : null}
          <Text style={styles.reqMeta}>
            Submitted {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator
            size="small"
            color={gold}
            style={{ marginTop: 20 }}
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 20,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: MUTED,
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 18,
    fontWeight: '500',
  },
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderBottomWidth: 2,
    padding: 14,
    fontSize: 16,
    color: CREAM,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reqDate: {
    fontSize: 16,
    fontWeight: '500',
    color: CREAM,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  reqReason: {
    fontSize: 14,
    color: MUTED,
    marginTop: 8,
  },
  reqMeta: {
    fontSize: 12,
    color: MUTED,
    marginTop: 6,
  },
});
