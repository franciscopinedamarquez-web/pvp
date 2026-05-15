import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import type { Product } from '../services/productService';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<Product['category'], string> = {
  comics: '📚 CÓMIC', manga: '🎌 MANGA', juegos: '🎲 JUEGO', merchandising: '🎁 MERCH', libros: '📖 LIBRO',
};

const CATEGORY_COLORS: Record<Product['category'], string> = {
  comics: Colors.comics, manga: Colors.manga, juegos: Colors.juegos, merchandising: Colors.merch, libros: Colors.libros,
};

const CAT_EMOJI: Record<Product['category'], string> = {
  comics: '📚', manga: '🎌', juegos: '🎲', merchandising: '🎁', libros: '📖',
};

function formatPrice(price: string): string {
  const n = parseFloat(price);
  if (isNaN(n)) return '—';
  return n % 1 === 0 ? `${n} €` : `${n.toFixed(2).replace('.', ',')} €`;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [imgError, setImgError] = useState(false);
  const categoryColor = CATEGORY_COLORS[product.category];
  const isOutOfStock = product.stockStatus === 'outofstock';
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 2;
  const isOnSale = !!product.salePrice && product.salePrice !== product.regularPrice;
  const stockColor = isOutOfStock ? Colors.error : isLowStock ? Colors.warning : Colors.success;
  const stockLabel = isOutOfStock ? 'AGOTADO' : isLowStock ? 'ÚLTIMAS UNIDADES' : 'EN STOCK';
  const discount = isOnSale ? Math.round((1 - parseFloat(product.salePrice!) / parseFloat(product.regularPrice)) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha de producto</Text>
        <View style={{ width: 80 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {product.imageUrl && !imgError ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" onError={() => setImgError(true)} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: categoryColor + '18' }]}>
              <Text style={styles.placeholderEmoji}>{CAT_EMOJI[product.category]}</Text>
            </View>
          )}
          <View style={[styles.catBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.catBadgeText}>{CATEGORY_LABELS[product.category]}</Text>
          </View>
        </View>
        <Text style={styles.name}>{product.name}</Text>
        {product.publisher && (
          <Text style={styles.publisher}>{product.publisher}{product.author ? ` · ${product.author}` : ''}</Text>
        )}
        <View style={styles.priceBox}>
          {isOnSale ? (
            <>
              <View style={styles.priceTopRow}>
                <Text style={styles.priceOld}>{formatPrice(product.regularPrice)}</Text>
                <View style={styles.discountBadge}><Text style={styles.discountText}>-{discount}%</Text></View>
              </View>
              <Text style={styles.priceFinal}>{formatPrice(product.salePrice!)}</Text>
            </>
          ) : (
            <Text style={styles.priceFinal}>{formatPrice(product.price)}</Text>
          )}
          <Text style={styles.priceLabel}>Precio de venta al público</Text>
        </View>
        <View style={[styles.stockBox, { backgroundColor: stockColor + '12', borderColor: stockColor + '44' }]}>
          <View style={styles.stockLeft}>
            <Text style={[styles.stockNum, { color: stockColor }]}>{isOutOfStock ? '0' : product.stockQuantity}</Text>
            <Text style={styles.stockUnit}>unidades</Text>
          </View>
          <View style={[styles.stockBadge, { backgroundColor: stockColor }]}>
            <Text style={styles.stockBadgeText}>{stockLabel}</Text>
          </View>
        </View>
        {product.description ? (
          <View style={styles.descBox}>
            <Text style={styles.descText}>{product.description}</Text>
          </View>
        ) : null}
        <View style={styles.refBox}>
          <View style={styles.refRow}><Text style={styles.refLabel}>SKU</Text><Text style={styles.refVal}>{product.sku}</Text></View>
          <View style={styles.refDivider} />
          <View style={styles.refRow}><Text style={styles.refLabel}>Código de barras</Text><Text style={styles.refVal}>{product.barcode}</Text></View>
          <View style={styles.refDivider} />
          <View style={styles.refRow}><Text style={styles.refLabel}>ID interno</Text><Text style={styles.refVal}>#{product.id}</Text></View>
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
  headerTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  content: { paddingBottom: 48 },
  imageContainer: { height: 220, backgroundColor: '#fff', position: 'relative', marginBottom: Spacing.md },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 64 },
  catBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  catBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  name: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800', lineHeight: 26, marginHorizontal: Spacing.md, marginBottom: 4 },
  publisher: { color: Colors.textMuted, fontSize: 13, marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  priceBox: { backgroundColor: Colors.card, marginHorizontal: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  priceTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  priceOld: { color: Colors.textMuted, fontSize: 16, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  priceFinal: { color: Colors.primary, fontSize: 40, fontWeight: '800', lineHeight: 44 },
  priceLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  stockBox: { marginHorizontal: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, marginBottom: Spacing.sm },
  stockLeft: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  stockNum: { fontSize: 48, fontWeight: '800', lineHeight: 52 },
  stockUnit: { color: Colors.textSecondary, fontSize: 14, paddingBottom: 6 },
  stockBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  stockBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  descBox: { marginHorizontal: Spacing.md, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  descText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  refBox: { marginHorizontal: Spacing.md, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  refRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 11 },
  refDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  refLabel: { color: Colors.textMuted, fontSize: 12 },
  refVal: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
});
