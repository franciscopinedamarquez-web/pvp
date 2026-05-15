import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import type { Product } from '../services/productService';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<Product['category'], string> = {
  comics: '📚 CÓMIC', manga: '🎌 MANGA', juegos: '🎲 JUEGO', merchandising: '🎁 MERCHANDISING', libros: '📖 LIBRO',
};

const CATEGORY_COLORS: Record<Product['category'], string> = {
  comics: Colors.comics, manga: Colors.manga, juegos: Colors.juegos, merchandising: Colors.merch, libros: Colors.libros,
};

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const categoryColor = CATEGORY_COLORS[product.category];
  const isOutOfStock = product.stockStatus === 'outofstock';
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 2;
  const isOnSale = !!product.salePrice;
  const stockColor = isOutOfStock ? Colors.error : isLowStock ? Colors.warning : Colors.success;
  const stockLabel = isOutOfStock ? 'AGOTADO' : isLowStock ? 'ÚLTIMAS UNIDADES' : 'EN STOCK';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Producto</Text>
        <View style={{ width: 80 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.categoryBanner, { backgroundColor: categoryColor + '18', borderColor: categoryColor + '44' }]}>
          <Text style={[styles.categoryBannerText, { color: categoryColor }]}>{CATEGORY_LABELS[product.category]}</Text>
        </View>
        <Text style={styles.name}>{product.name}</Text>
        {(product.publisher || product.author) && (
          <View style={styles.metaRow}>
            {product.publisher && <View style={styles.metaItem}><Text style={styles.metaLabel}>Editorial</Text><Text style={styles.metaValue}>{product.publisher}</Text></View>}
            {product.author && <View style={styles.metaItem}><Text style={styles.metaLabel}>Autor/a</Text><Text style={styles.metaValue}>{product.author}</Text></View>}
          </View>
        )}
        {product.description && (
          <View style={styles.descriptionBox}><Text style={styles.descriptionText}>{product.description}</Text></View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💶 Precio</Text>
          <View style={styles.priceBlock}>
            {isOnSale ? (
              <>
                <Text style={styles.originalPriceLarge}>{product.regularPrice} €</Text>
                <Text style={styles.salePriceLarge}>{product.salePrice} €</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{Math.round((1 - parseFloat(product.salePrice!) / parseFloat(product.regularPrice)) * 100)}%</Text>
                </View>
              </>
            ) : (
              <Text style={styles.priceLarge}>{product.price} €</Text>
            )}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Stock</Text>
          <View style={[styles.stockBlock, { borderColor: stockColor + '44', backgroundColor: stockColor + '10' }]}>
            <View style={styles.stockMain}>
              <Text style={[styles.stockNumber, { color: stockColor }]}>{isOutOfStock ? '0' : product.stockQuantity}</Text>
              <Text style={styles.stockUnit}>unidades</Text>
            </View>
            <View style={[styles.stockStatusBadge, { backgroundColor: stockColor }]}>
              <Text style={styles.stockStatusText}>{stockLabel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔖 Referencia</Text>
          <View style={styles.referenceBlock}>
            <View style={styles.referenceRow}><Text style={styles.referenceLabel}>SKU</Text><Text style={styles.referenceValue}>{product.sku}</Text></View>
            <View style={styles.referenceDivider} />
            <View style={styles.referenceRow}><Text style={styles.referenceLabel}>Código de barras</Text><Text style={styles.referenceValue}>{product.barcode}</Text></View>
            <View style={styles.referenceDivider} />
            <View style={styles.referenceRow}><Text style={styles.referenceLabel}>ID Interno</Text><Text style={styles.referenceValue}>#{product.id}</Text></View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 80 },
  backIcon: { color: Colors.primary, fontSize: 20, fontWeight: '700' },
  backText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  headerTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  categoryBanner: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 5, borderRadius: BorderRadius.sm, borderWidth: 1, marginBottom: Spacing.sm },
  categoryBannerText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  name: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: Spacing.md },
  metaRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, flexWrap: 'wrap' },
  metaItem: { flex: 1, minWidth: 120, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  metaLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  metaValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  descriptionBox: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary + '66', borderWidth: 1, borderColor: Colors.border },
  descriptionText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  section: { marginBottom: Spacing.md },
  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: Spacing.sm },
  priceBlock: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  priceLarge: { color: Colors.primary, fontSize: 40, fontWeight: '800' },
  salePriceLarge: { color: Colors.accentLight, fontSize: 40, fontWeight: '800' },
  originalPriceLarge: { color: Colors.textMuted, fontSize: 22, textDecorationLine: 'line-through', alignSelf: 'flex-end', marginBottom: 4 },
  discountBadge: { backgroundColor: Colors.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.sm, alignSelf: 'flex-start' },
  discountText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  stockBlock: { borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
  stockMain: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  stockNumber: { fontSize: 52, fontWeight: '800', lineHeight: 56 },
  stockUnit: { color: Colors.textSecondary, fontSize: 14, paddingBottom: 8 },
  stockStatusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.sm },
  stockStatusText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  referenceBlock: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  referenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12 },
  referenceDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  referenceLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
  referenceValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },
});
