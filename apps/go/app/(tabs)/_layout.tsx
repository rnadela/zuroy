import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getConfig } from '../../src/lib/store';

export default function TabLayout() {
  const config = getConfig();
  const primaryColor = config?.hotel?.primaryColor || '#1a56db';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        headerStyle: { backgroundColor: primaryColor },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="amenities"
        options={{
          title: 'Amenities',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: 'Info',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
