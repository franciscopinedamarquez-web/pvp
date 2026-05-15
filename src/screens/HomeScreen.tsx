import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Keyboard,
  KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { searchByText, getAllProducts } from '../services/productService';
import type { Product } from '../services/productService';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';

const CATEGORIES = [
  { key: 'all', label: 'Todo' },
  { key: 'comics', label: 'Cómics' },
  { key: 'manga', label: 'Manga' },
  { key: 'juegos', label: 'Juegos' },
  { key: 'merchandising', label: 'Merch' },
  { key: 'libros', label: 'Libros' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(async (text: string, category: string) => {
    clearTimeout(debounceRef.current);
    if (!text.trim() && category === 'all') { setResults([]); setSearched(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        let products = text.trim() ? await searchByText(text) : await getAllProducts();
        if (category !== 'all') products = products.filter(p => p.category === category);
        setResults(products); setSearched(true);
      } finally { setLoading(false); }
    }, 350);
  }, []);

  const handleQueryChange = (text: string) => { setQuery(text); handleSearch(text, activeCategory); };
  const handleCategoryChange = (cat: string) => { setActiveCategory(cat); handleSearch(query, cat); };
  const handleClear = () => { setQuery(''); setResults([]); setSearched(false); setActiveCategory('all'); inputRef.current?.focus(); };

  if (selectedProduct) return <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.logo}>🦸 Alcalá Cómics</Text>
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
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={item => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryChip, activeCategory === item.key && styles.categoryChipActive]}
                onPress={() => handleCategoryChange(item.key)}
              >
                <Text style={[styles.categoryChipText, activeCategory === item.key && styles.categoryChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {!searched && !loading && (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => { Keyboard.dismiss(); router.push('/scanner'); }}
            activeOpacity={0.85}
          >
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={styles.scanText}>Escanear código de barras</Text>
            <Text style={styles.scanArrow}>→</Text>
          </TouchableOpacity>
        )}
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Buscando...</Text>
          </View>
        ) : !searched ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyIcon}>🗂</Text>
            <Text style={styles.emptyTitle}>Consulta un producto</Text>
            <Text style={styles.emptySubtitle}>Escribe en el buscador o escanea el código de barras.</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyIcon}>😕</Text>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySubtitle}>No se encontró "{query}".</Text>
          </View>
        ) : (
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
  searchSection: { backgroundColor: Colors.surface, paddingTop: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, paddingHorizontal: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  searchIcon: { fontSize: 16, marginRight: 6 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15, paddingVertical: 12 },
  clearButton: { padding: 6 },
  clearText: { color: Colors.textMuted, fontSize: 14, fontWeight: '700' },
  categoryList: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  categoryChipTextActive: { color: Colors.textOnPrimary },
  scanButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: Spacing.md, marginTop: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.primary + '55', gap: 10 },
  scanIcon: { fontSize: 22 },
  scanText: { flex: 1, color: Colors.primary, fontSize: 15, fontWeight: '700' },
  scanArrow: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  loadingText: { color: Colors.textSecondary, marginTop: 12, fontSize: 15 },
  listContent: { paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  resultCount: { color: Colors.textMuted, fontSize: 12, paddingHorizontal: Spacing.lg, paddingBottom: 4 },
});
