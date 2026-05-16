import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import type { Product } from '../services/productService';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

const CATEGORY_COLORS: Record<Product['category'], string> = {
  comics: Colors.comics, manga: Colors.manga, juegos: Colors.juegos,
  merchandising: Colors.merch, libros: Colors.libros,
};

const CATEGORY_LABELS: Record<Product['category'], string> = {
  comics: 'CÓMIC', manga: 'MANGA', juegos: 'JUEGO', merchandising: 'MERCH', libros: 'LIBRO',
};

const CAT_EMOJI: Record<Product['category'], string> = {
  comics: '📚', manga: '🎌', juegos: '🎲', merchandising: '🎁', libros: '📖',
};

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const categoryColor = CATEGORY_COLORS[product.category];
  const isOutOfStock = product.stockStatus === 'outofstock';
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 2;
  const isOnSale = !!product.salePrice;
  const stockColor = isOutOfStock ? Colors.error : isLowStock ? Colors.warning : Colors.success;
  const stockLabel = isOutOfStock ? 'Agotado' : isLowStock ? `${product.stockQuantity} ud` : `${product.stockQuantity} uds`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.imageWrapper}>
        {product.imageUrl && !imgError ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" onError={() => setImgError(true)} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: categoryColor + '22' }]}>
            <Text style={styles.placeholderEmoji}>{CAT_EMOJI[product.category]}</Text>
          </View>
        )}
        <View style={[styles.catPill, { backgroundColor: categoryColor }]}>
          <Text style={styles.catPillText}>{CATEGORY_LABELS[product.category]}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {product.publisher && <Text style={styles.publisher} numberOfLines={1}>{product.publisher}</Text>}
        <View style={styles.priceRow}>
          {isOnSale ? (
            <>
              <Text style={styles.priceOld}>{product.regularPrice}</Text>
              <Text style={styles.priceSale}>{product.salePrice}</Text>
            </>
          ) : (
            <Text style={styles.price}>{product.price}</Text>
          )}
        </View>
        <View style={[styles.stockRow, { borderColor: stockColor + '44', backgroundColor: stockColor + '14' }]}>
          <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
          <Text style={[styles.stockText, { color: stockColor }]}>{stockLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, marginHorizontal: Spacing.md, marginVertical: 6, overflow: 'hidden', flexDirection: 'row', borderWidth: 1, borderColor: Colors.border },
  imageWrapper: { width: 90, height: 110, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 32 },
  catPill: { position: 'absolute', bottom: 4, left: 4, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  catPillText: { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },
  info: { flex: 1, padding: 10, justifyContent: 'space-between' },
  name: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 2 },
  publisher: { color: Colors.textMuted, fontSize: 11, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  price: { color: Colors.primary, fontSize: 20, fontWeight: '800' },
  priceSale: { color: Colors.accentLight, fontSize: 20, fontWeight: '800' },
  priceOld: { color: Colors.textMuted, fontSize: 12, textDecorationLine: 'line-through' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, alignSelf: 'flex-start' },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  stockText: { fontSize: 11, fontWeight: '700' },
});
