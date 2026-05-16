import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Keyboard,
  KeyboardAvoidingView, Platform, SafeAreaView, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { searchByText, getAllProducts, getOutOfStockProducts } from '../services/productService';
import type { Product } from '../services/productService';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';

const TODAY = new Date().toISOString().split('T')[0];
const OOS_CACHE_KEY = `oos_cache_${TODAY}`;

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [outOfStock, setOutOfStock] = useState<Product[]>([]);
  const [oosLoading, setOosLoading] = useState(true);
  const [oosRefreshing, setOosRefreshing] = useState(false);

  useEffect(() => { loadOutOfStock(false); }, []);

  const loadOutOfStock = async (forceRefresh: boolean) => {
    if (!forceRefresh) {
      try {
        const cached = await AsyncStorage.getItem(OOS_CACHE_KEY);
        if (cached) { setOutOfStock(JSON.parse(cached)); setOosLoading(false); return; }
      } catch {}
    }
    setOosRefreshing(true);
    try {
      const products = await getOutOfStockProducts();
      setOutOfStock(products);
      await AsyncStorage.setItem(OOS_CACHE_KEY, JSON.stringify(products));
    } finally { setOosLoading(false); setOosRefreshing(false); }
  };

  const handleSearch = useCallback(async (text: string) => {
    clearTimeout(debounceRef.current);
    if (!text.trim()) { setResults([]); setSearched(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const products = await searchByText(text);
        setResults(products); setSearched(true);
      } finally { setLoading(false); }
    }, 350);
  }, []);

  const handleQueryChange = (text: string) => { setQuery(text); handleSearch(text); };
  const handleClear = () => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); };

  if (selectedProduct) return <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={styles.logo}>🦸 Alcalá Cómics</Text>
          <Text style={styles.logoSub}>Consultor de productos</Text>
        </View>

        {/* Buscador */}
        <View style={styles.searchSection}>
          <View style={styles.inputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={handleQueryChange}
              placeholder="Buscar por nombre, SKU, editorial..."
              placeholderTextColor={Colors.textMuted}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contenido */}
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Buscando...</Text>
          </View>
        ) : searched && results.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyIcon}>😕</Text>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySubtitle}>No se encontró "{query}".</Text>
          </View>
        ) : searched ? (
          <FlatList
            data={results}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => { Keyboard.dismiss(); setSelectedProduct(item); }} />
            )}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={<Text style={styles.resultCount}>{results.length} producto{results.length !== 1 ? 's' : ''}</Text>}
          />
        ) : (
          <FlatList
            data={outOfStock}
            keyExtractor={item => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={oosRefreshing} onRefresh={() => loadOutOfStock(true)} tintColor={Colors.primary} />
            }
            ListHeaderComponent={
              <View>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => { Keyboard.dismiss(); router.push('/scanner'); }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.scanIcon}>📷</Text>
                  <Text style={styles.scanText}>Escanear código de barras</Text>
                  <Text style={styles.scanArrow}>→</Text>
                </TouchableOpacity>
                <View style={styles.oosHeader}>
                  <Text style={styles.oosTitle}>⊘ Agotados hoy</Text>
                  <Text style={styles.oosDate}>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</Text>
                </View>
                {oosLoading && (
                  <View style={styles.oosLoading}>
                    <ActivityIndicator color={Colors.primary} size="small" />
                    <Text style={styles.oosLoadingText}>Cargando...</Text>
                  </View>
                )}
              </View>
            }
            ListEmptyComponent={
              !oosLoading ? (
                <View style={styles.oosEmpty}>
                  <Text style={styles.oosEmptyIcon}>✅</Text>
                  <Text style={styles.oosEmptyText}>No hay productos agotados</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <View style={styles.oosItem}>
                <View style={styles.oosItemLeft}>
                  <Text style={styles.oosItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.oosItemSku}>{item.sku}</Text>
                </View>
                <View style={styles.oosItemRight}>
                  <Text style={styles.oosItemPrice}>{item.price}</Text>
                  <View style={styles.oosBadge}><Text style={styles.oosBadgeText}>AGOTADO</Text></View>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  logo: { color: Colors.primary, fontSize: 18, fontWeight: '800' },
  logoSub: { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  searchSection: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 6 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15, paddingVertical: 12 },
  clearButton: { padding: 6 },
  clearText: { color: Colors.textMuted, fontSize: 14, fontWeight: '700' },
  scanButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.primary + '66', gap: 10,
  },
  scanIcon: { fontSize: 22 },
  scanText: { flex: 1, color: Colors.primary, fontSize: 15, fontWeight: '700' },
  scanArrow: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  oosHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  oosTitle: { color: Colors.error, fontSize: 14, fontWeight: '700' },
  oosDate: { color: Colors.textMuted, fontSize: 12 },
  oosLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  oosLoadingText: { color: Colors.textMuted, fontSize: 13 },
  oosEmpty: { alignItems: 'center', paddingVertical: Spacing.xl },
  oosEmptyIcon: { fontSize: 36, marginBottom: 8 },
  oosEmptyText: { color: Colors.textMuted, fontSize: 14 },
  oosItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: Spacing.md, marginBottom: 6,
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: 12, borderWidth: 1, borderColor: Colors.error + '33',
  },
  oosItemLeft: { flex: 1, marginRight: 10 },
  oosItemName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  oosItemSku: { color: Colors.textMuted, fontSize: 11, fontFamily: 'monospace' },
  oosItemRight: { alignItems: 'flex-end', gap: 4 },
  oosItemPrice: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  oosBadge: {
    backgroundColor: Colors.error + '18', borderWidth: 1,
    borderColor: Colors.error + '44', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  oosBadgeText: { color: Colors.error, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  loadingText: { color: Colors.textSecondary, marginTop: 12, fontSize: 15 },
  listContent: { paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  resultCount: { color: Colors.textMuted, fontSize: 12, paddingHorizontal: Spacing.lg, paddingBottom: 4 },
});
