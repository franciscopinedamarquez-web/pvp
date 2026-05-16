import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Keyboard,
  KeyboardAvoidingView, Platform, SafeAreaView, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { searchByText, getLatestProducts, getBestSellers, getOutOfStockProducts } from '../services/productService';
import type { Product } from '../services/productService';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';

type Section = 'novedades' | 'masvendidos' | 'agotados' | null;

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [sectionProducts, setSectionProducts] = useState<Product[]>([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadSection = async (section: Section, refresh = false) => {
    if (!section) return;
    if (section === activeSection && !refresh) { setActiveSection(null); return; }
    setActiveSection(section);
    setSectionLoading(true);
    if (refresh) setRefreshing(true);
    try {
      let products: Product[] = [];
      if (section === 'novedades') products = await getLatestProducts();
      else if (section === 'masvendidos') products = await getBestSellers();
      else if (section === 'agotados') products = await getOutOfStockProducts();
      setSectionProducts(products);
    } finally { setSectionLoading(false); setRefreshing(false); }
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

  const SECTIONS = [
    { key: 'novedades' as Section, label: 'Novedades', icon: '🆕' },
    { key: 'masvendidos' as Section, label: 'Más vendidos', icon: '⭐' },
    { key: 'agotados' as Section, label: 'Agotados hoy', icon: '⊘' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.header}>
          <Text style={styles.logo}>Alcalá Cómics</Text>
          <Text style={styles.logoSub}>Consultor de productos</Text>
        </View>

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
            data={activeSection ? sectionProducts : []}
            keyExtractor={item => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              activeSection ? (
                <RefreshControl refreshing={refreshing} onRefresh={() => loadSection(activeSection, true)} tintColor={Colors.primary} />
              ) : undefined
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

                {/* Botones de sección */}
                <View style={styles.sectionButtons}>
                  {SECTIONS.map(s => (
                    <TouchableOpacity
                      key={s.key}
                      style={[styles.sectionBtn, activeSection === s.key && styles.sectionBtnActive]}
                      onPress={() => loadSection(s.key)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.sectionBtnIcon}>{s.icon}</Text>
                      <Text style={[styles.sectionBtnLabel, activeSection === s.key && styles.sectionBtnLabelActive]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {sectionLoading && (
                  <View style={styles.novLoading}>
                    <ActivityIndicator color={Colors.primary} size="small" />
                    <Text style={styles.novLoadingText}>Cargando...</Text>
                  </View>
                )}

                {activeSection && !sectionLoading && sectionProducts.length > 0 && (
                  <Text style={styles.resultCount}>{sectionProducts.length} producto{sectionProducts.length !== 1 ? 's' : ''}</Text>
                )}
              </View>
            }
            ListEmptyComponent={
              activeSection && !sectionLoading ? (
                <View style={styles.centerState}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyTitle}>Sin productos</Text>
                  <Text style={styles.emptySubtitle}>Desliza hacia abajo para actualizar.</Text>
                </View>
              ) : !activeSection ? (
                <View style={styles.centerState}>
                  <Text style={styles.emptyIcon}>👆</Text>
                  <Text style={styles.emptyTitle}>Selecciona una sección</Text>
                  <Text style={styles.emptySubtitle}>O usa el buscador para encontrar cualquier producto.</Text>
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
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.primary + '66', gap: 10,
  },
  scanIcon: { fontSize: 22 },
  scanText: { flex: 1, color: Colors.primary, fontSize: 15, fontWeight: '700' },
  scanArrow: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  sectionButtons: {
    flexDirection: 'row', gap: Spacing.sm,
    marginHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: Spacing.sm,
  },
  sectionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingVertical: 10, paddingHorizontal: 6,
    borderWidth: 1, borderColor: Colors.border, gap: 4,
  },
  sectionBtnActive: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary,
  },
  sectionBtnIcon: { fontSize: 20 },
  sectionBtnLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  sectionBtnLabelActive: { color: Colors.primary, fontWeight: '700' },
  novLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  novLoadingText: { color: Colors.textMuted, fontSize: 13 },
  centerState: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  loadingText: { color: Colors.textSecondary, marginTop: 12, fontSize: 15 },
  listContent: { paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  resultCount: { color: Colors.textMuted, fontSize: 12, paddingHorizontal: Spacing.lg, paddingBottom: 4 },
});
