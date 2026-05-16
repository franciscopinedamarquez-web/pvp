import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, SafeAreaView, RefreshControl,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { getCategories, getProductsByCategory } from '../services/productService';
import type { Category, Product } from '../services/productService';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setCatLoading(true);
    try {
      const cats = await getCategories();
      setCategories(cats);
    } finally { setCatLoading(false); }
  };

  const selectCategory = async (cat: Category) => {
    setSelectedCat(cat);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setProdLoading(true);
    try {
      const prods = await getProductsByCategory(cat.id, 1);
      setProducts(prods);
      setHasMore(prods.length === 100);
    } finally { setProdLoading(false); }
  };

  const loadMore = async () => {
    if (!selectedCat || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const prods = await getProductsByCategory(selectedCat.id, nextPage);
      setProducts(prev => [...prev, ...prods]);
      setPage(nextPage);
      setHasMore(prods.length === 100);
    } finally { setLoadingMore(false); }
  };

  const handleRefresh = async () => {
    if (!selectedCat) return;
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    try {
      const prods = await getProductsByCategory(selectedCat.id, 1);
      setProducts(prods);
      setHasMore(prods.length === 100);
    } finally { setRefreshing(false); }
  };

  if (selectedProduct) return <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />;

  // Vista de productos de una categoría
  if (selectedCat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedCat(null)} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Categorías</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{selectedCat.name}</Text>
            <Text style={styles.headerSub}>{selectedCat.count} productos</Text>
          </View>
          <View style={{ width: 80 }} />
        </View>

        {prodLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => setSelectedProduct(item)} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListHeaderComponent={
              <Text style={styles.resultCount}>
                {products.length} de {selectedCat.count} productos
              </Text>
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadMoreBox}>
                  <ActivityIndicator color={Colors.primary} size="small" />
                  <Text style={styles.loadMoreText}>Cargando más...</Text>
                </View>
              ) : hasMore ? (
                <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                  <Text style={styles.loadMoreBtnText}>Cargar 100 más →</Text>
                </TouchableOpacity>
              ) : products.length > 0 ? (
                <Text style={styles.endText}>— Fin de la lista —</Text>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.centerState}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Sin productos</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // Vista de lista de categorías
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSimple}>
        <Text style={styles.logo}>Categorías</Text>
        <Text style={styles.logoSub}>Selecciona una categoría para explorar</Text>
      </View>

      {catLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.catItem}
              onPress={() => selectCategory(item)}
              activeOpacity={0.8}
            >
              <View style={styles.catItemLeft}>
                <Text style={styles.catName}>{item.name}</Text>
              </View>
              <View style={styles.catItemRight}>
                <View style={styles.catCountBadge}>
                  <Text style={styles.catCount}>{item.count}</Text>
                </View>
                <Text style={styles.catArrow}>›</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 80 },
  backIcon: { color: Colors.primary, fontSize: 20, fontWeight: '700' },
  backText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  headerSub: { color: Colors.textMuted, fontSize: 11, marginTop: 1 },
  headerSimple: {
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logo: { color: Colors.primary, fontSize: 18, fontWeight: '800' },
  logoSub: { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  catList: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  catItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  catItemLeft: { flex: 1 },
  catName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  catItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catCountBadge: {
    backgroundColor: Colors.primary + '22', borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  catCount: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  catArrow: { color: Colors.textMuted, fontSize: 22, fontWeight: '300' },
  separator: { height: 6 },
  listContent: { paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  loadingText: { color: Colors.textSecondary, marginTop: 12, fontSize: 15 },
  resultCount: { color: Colors.textMuted, fontSize: 12, paddingHorizontal: Spacing.lg, paddingBottom: 4 },
  loadMoreBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: Spacing.md },
  loadMoreText: { color: Colors.textMuted, fontSize: 13 },
  loadMoreBtn: {
    margin: Spacing.md, padding: Spacing.md,
    backgroundColor: Colors.primary + '18', borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.primary + '44', alignItems: 'center',
  },
  loadMoreBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  endText: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', padding: Spacing.lg },
});
