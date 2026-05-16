import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Keyboard,
  KeyboardAvoidingView, Platform, SafeAreaView, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { searchByText, getLatestProducts } from '../services/productService';
import type { Product } from '../services/productService';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [novedades, setNovedades] = useState<Product[]>([]);
  const [novLoading, setNovLoading] = useState(true);
  const [novRefreshing, setNovRefreshing] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { loadNovedades(); }, []);

  const loadNovedades = async () => {
    setNovRefreshing(true);
    try {
      const products = await getLatestProducts();
      setNovedades(products);
    } finally { setNovLoading(false); setNovRefreshing(false); }
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
          /* Panel principal — novedades */
          <FlatList
            data={novedades}
            keyExtractor={item => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={novRefreshing} onRefresh={loadNovedades} tintColor={Colors.primary} />
            }
            ListHeaderComponent={
              <View>
                {/* Botón escáner */}
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => { Keyboard.dismiss(); router.push('/scanner'); }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.scanIcon}>📷</Text>
                  <Text style={styles.scanText}>Escanear código de barras</Text>
                  <Text style={styles.scanArrow}>→</Text>
                </TouchableOpacity>

                {/* Cabecera novedades */}
                <View style={styles.novHeader}>
                  <Text style={styles.novTitle}>🆕 Novedades</Text>
                  <Text style={styles.novDate}>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>

                {novLoading && (
                  <View style={styles.novLoading}>
                    <ActivityIndicator color={Colors.primary} size="small" />
                    <Text style={styles.novLoadingText}>Cargando novedades...</Text>
                  </View>
                )}
              </View>
            }
            ListEmptyComponent={
              !novLoading ? (
                <View style={styles.centerState}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyTitle}>Sin novedades</Text>
                  <Text style={styles.emptySubtitle}>Desliza hacia abajo para actualizar.</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => { Keyboard.dismiss(); setSelectedProduct(item); }} />
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
    backgroundColor: Colors.surface, paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 6 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15, paddingVertical: 12 },
  clearButton: { padding: 6 },
  clearText: { color: Colors.textMuted, fontSize: 14, fontWeight: '700' },
  scanButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.primary + '66', gap: 10,
  },
  scanIcon: { fontSize: 22 },
  scanText: { flex: 1, color: Colors.primary, fontSize: 15, fontWeight: '700' },
  scanArrow: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  novHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  novTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800' },
  novDate: { color: Colors.textMuted, fontSize: 12 },
  novLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  novLoadingText: { color: Colors.textMuted, fontSize: 13 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  loadingText: { color: Colors.textSecondary, marginTop: 12, fontSize: 15 },
  listContent: { paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  resultCount: { color: Colors.textMuted, fontSize: 12, paddingHorizontal: Spacing.lg, paddingBottom: 4 },
});
