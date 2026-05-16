import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../src/utils/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface, borderBottomColor: Colors.border, borderBottomWidth: 1 },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border, borderTopWidth: 1, height: 65, paddingBottom: 10, paddingTop: 6 },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          headerLeft: () => <Text style={styles.headerLogo}>AC</Text>,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Panel', headerTitle: 'Alcalá Cómics Staff', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
        <Tabs.Screen name="scanner" options={{ title: 'Escáner', headerTitle: '📷 Escáner', tabBarIcon: ({ focused }) => <TabIcon emoji="📷" focused={focused} /> }} />
        <Tabs.Screen name="search" options={{ title: 'Buscar', headerTitle: '🔍 Buscar', tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} /> }} />
        <Tabs.Screen name="categories" options={{ title: 'Categorías', headerTitle: '📂 Categorías', tabBarIcon: ({ focused }) => <TabIcon emoji="📂" focused={focused} /> }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  tabIconFocused: { backgroundColor: Colors.primary + '22' },
  tabEmoji: { fontSize: 18 },
  headerLogo: { color: Colors.primary, fontSize: 14, fontWeight: '800', marginLeft: 14 },
});
