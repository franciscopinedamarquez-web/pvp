import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import type { Product } from '../services/productService';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  compact?: boolean;
}

const CATEGORY_LABELS: Record<Product['category'], string> = {
  comics: '📚 CÓMIC', manga: '🎌 MANGA', juegos: '🎲 JUEGO', merchandising: '🎁 MERCH', libros: '📖 LIBRO',
};

const CATEGORY_COLORS: Record<Product['category'], string> = {
  comics: Colors.comics, manga: Colors.manga, juegos: Colors.juegos, merchandising: Colors.merch, libros: Colors.libros,
};

export default function ProductCard({ product, onPress, compact = false }: ProductCardProps) {
  const categoryColor = CATEGORY_COLORS[product.category];
  const isOnSale = !!product.salePrice;
  const isOutOfStock = product.stockStatus === 'outofstock';
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 2;

  return (
    <TouchableOpacity style={[styles.card, compact && styles.cardCompact]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22', borderColor: categoryColor + '55' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{CATEGORY_LABELS[product.category]}</Text>
          </View>
          <View style={[styles.stockBadge, isOutOfStock ? { backgroundColor: Colors.error + '22', borderColor: Colors.error + '55' } : isLowStock ? { backgroundColor: Colors.warning + '22', borderColor: Colors.warning + '55' } : { backgroundColor: Colors.success + '22', borderColor: Colors.success + '55' }]}>
            <Text style={[styles.stockBadgeText, { color: isOutOfStock ? Colors.error : isLowStock ? Colors.warning : Colors.success }]}>
              {isOutOfStock ? '⊘ Agotado' : isLowStock ? '⚠ Últimas unidades' : '✓ Disponible'}
            </Text>
          </View>
        </View>
        <Text style={styles.name} numberOfLines={compact ? 1 : 2}>{product.name}</Text>
        <View style={styles.meta}>
          {product.publisher && <Text style={styles.metaText}>{product.publisher}</Text>}
          {product.author && <Text style={styles.metaText}>· {product.author}</Text>}
        </View>
        <Text style={styles.sku}>SKU: {product.sku}</Text>
        {!compact && (
          <>
            <View style={styles.divider} />
            <View style={styles.footer}>
              <View style={styles.priceContainer}>
                {isOnSale && <Text style={styles.originalPrice}>{product.regularPrice} €</Text>}
                <Text style={[styles.price, isOnSale && styles.salePrice]}>{product.price} €</Text>
                {isOnSale && <View style={styles.saleBadge}><Text style={styles.saleText}>OFERTA</Text></View>}
              </View>
              <View style={styles.stockInfo}>
                <Text style={[styles.stockNumber, { color: isOutOfStock ? Colors.error : isLowStock ? Colors.warning : Colors.success }]}>
                  {isOutOfStock ? '0' : product.stockQuantity}
                </Text>
                <Text style={styles.stockLabel}>uds.</Text>
              </View>
            </View>
          </>
        )}
        {compact && (
          <View style={styles.compactFooter}>
            <Text style={styles.price}>{product.price} €</Text>
            <Text style={[styles.compactStock, { color: isOutOfStock ? Colors.error : isLowStock ? Colors.warning : Colors.success }]}>
              {isOutOfStock ? 'Agotado' : `${product.stockQuantity} uds`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, marginHorizontal: Spacing.md, marginVertical: Spacing.sm, overflow: 'hidden', flexDirection: 'row', borderWidth: 1, borderColor: Colors.border },
  cardCompact: { marginHorizontal: 0, marginVertical: 4 },
  categoryBar: { width: 4 },
  content: { flex: 1, padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm, flexWrap: 'wrap', gap: 4 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm, borderWidth: 1 },
  categoryText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm, borderWidth: 1 },
  stockBadgeText: { fontSize: 10, fontWeight: '600' },
  name: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 4 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 },
  metaText: { color: Colors.textSecondary, fontSize: 12, marginRight: 4 },
  sku: { color: Colors.textMuted, fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  price: { color: Colors.primary, fontSize: 22, fontWeight: '800' },
  salePrice: { color: Colors.accentLight },
  originalPrice: { color: Colors.textMuted, fontSize: 13, textDecorationLine: 'line-through' },
  saleBadge: { backgroundColor: Colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  saleText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  stockInfo: { alignItems: 'flex-end' },
  stockNumber: { fontSize: 28, fontWeight: '800' },
  stockLabel: { color: Colors.textMuted, fontSize: 11, marginTop: -4 },
  compactFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  compactStock: { fontSize: 12, fontWeight: '600' },
});
