import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { getAllProducts } from '../services/productService';
import type { Product } from '../services/productService';

interface Stats {
  total: number; inStock: number; outOfStock: number; lowStock: number; onSale: number;
  byCategory: Record<string, number>;
}

export default function HomeScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const products = await getAllProducts();
      const low = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 2);
      setLowStockItems(low);
      setStats({
        total: products.length,
        inStock: products.filter(p => p.stockStatus === 'instock').length,
        outOfStock: products.filter(p => p.stockStatus === 'outofstock').length,
        lowStock: low.length,
        onSale: products.filter(p => !!p.salePrice).length,
        byCategory: products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {} as Record<string, number>),
      });
    } finally { setLoading(false); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.heroTitle}>Panel de Control</Text>
          <Text style={styles.heroSubtitle}>Alcalá Cómics · Staff App</Text>
        </View>
        <View style={styles.logoBox}><Text style={styles.logoEmoji}>🦸</Text></View>
      </View>
      {loading ? (
        <View style={styles.loadingBox}><ActivityIndicator color={Colors.primary} /></View>
      ) : stats ? (
        <>
          <View style={styles.statsGrid}>
            {[
              { value: stats.total, label: 'Productos', color: Colors.info, icon: '📦' },
              { value: stats.inStock, label: 'En stock', color: Colors.success, icon: '✅' },
              { value: stats.outOfStock, label: 'Agotados', color: Colors.error, icon: '⊘' },
              { value: stats.onSale, label: 'En oferta', color: Colors.accent, icon: '🏷' },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { borderColor: s.color + '33' }]}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          {lowStockItems.length > 0 && (
            <View style={styles.alertBox}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertTitle}>{lowStockItems.length} producto{lowStockItems.length > 1 ? 's' : ''} con stock bajo</Text>
              </View>
              {lowStockItems.map(p => (
                <View key={p.id} style={styles.alertItem}>
                  <Text style={styles.alertItemName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.alertItemStock}>{p.stockQuantity} ud{p.stockQuantity !== 1 ? 's' : ''}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos por categoría</Text>
            <View style={styles.categoryGrid}>
              {[
                { key: 'comics', label: 'Cómics', icon: '📚', color: Colors.comics },
                { key: 'manga', label: 'Manga', icon: '🎌', color: Colors.manga },
                { key: 'juegos', label: 'Juegos', icon: '🎲', color: Colors.juegos },
                { key: 'merchandising', label: 'Merch', icon: '🎁', color: Colors.merch },
                { key: 'libros', label: 'Libros', icon: '📖', color: Colors.libros },
              ].map(cat => (
                <View key={cat.key} style={[styles.categoryCard, { borderColor: cat.color + '44', backgroundColor: cat.color + '12' }]}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[styles.catCount, { color: cat.color }]}>{stats.byCategory[cat.key] || 0}</Text>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  heroText: { flex: 1 },
  greeting: { color: Colors.textMuted, fontSize: 13, marginBottom: 2 },
  heroTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: Colors.primary, fontSize: 13, fontWeight: '600', marginTop: 2 },
  logoBox: { width: 60, height: 60, borderRadius: BorderRadius.md, backgroundColor: Colors.primary + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary + '44' },
  logoEmoji: { fontSize: 30 },
  loadingBox: { padding: Spacing.xl, alignItems: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1 },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  alertBox: { backgroundColor: Colors.warning + '10', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '44' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  alertIcon: { fontSize: 16 },
  alertTitle: { color: Colors.warning, fontWeight: '700', fontSize: 14 },
  alertItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderTopWidth: 1, borderTopColor: Colors.warning + '22' },
  alertItemName: { color: Colors.textSecondary, fontSize: 13, flex: 1, marginRight: 8 },
  alertItemStock: { color: Colors.warning, fontWeight: '700', fontSize: 13 },
  section: { marginBottom: Spacing.md },
  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: Spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryCard: { flex: 1, minWidth: '28%', borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center', borderWidth: 1 },
  catIcon: { fontSize: 20, marginBottom: 2 },
  catCount: { fontSize: 22, fontWeight: '800' },
  catLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
});
