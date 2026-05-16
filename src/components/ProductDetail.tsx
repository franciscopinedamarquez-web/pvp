import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image, FlatList, Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import type { Product } from '../services/productService';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<Product['category'], string> = {
  comics: '📚 CÓMIC', manga: '🎌 MANGA', juegos: '🎲 JUEGO',
  merchandising: '🎁 MERCH', libros: '📖 LIBRO',
};

const CATEGORY_COLORS: Record<Product['category'], string> = {
  comics: Colors.comics, manga: Colors.manga, juegos: Colors.juegos,
  merchandising: Colors.merch, libros: Colors.libros,
};

const CAT_EMOJI: Record<Product['category'], string> = {
  comics: '📚', manga: '🎌', juegos: '🎲', merchandising: '🎁', libros: '📖',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const categoryColor = CATEGORY_COLORS[product.category];
  const isOutOfStock = product.stockStatus === 'outofstock';
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 2;
  const isOnSale = !!product.salePrice;
  const stockColor = isOutOfStock ? Colors.error : isLowStock ? Colors.warning : Colors.success;
  const stockLabel = isOutOfStock ? 'AGOTADO' : isLowStock ? 'ÚLTIMAS UNIDADES' : 'EN STOCK';
  const [activeImg, setActiveImg] = useState(0);
  const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Galería de imágenes */}
        {images.length > 0 ? (
          <View style={styles.galleryWrapper}>
            <FlatList
              data={images}
              keyExtractor={(_, i) => String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                setActiveImg(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
              }}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={[styles.galleryImage, { width: SCREEN_WIDTH }]} resizeMode="contain" />
              )}
            />
            {/* Indicador de fotos */}
            {images.length > 1 && (
              <View style={styles.dotsRow}>
                {images.map((_, i) => (
                  <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
                ))}
              </View>
            )}
            {/* Badge categoría */}
            <View style={[styles.catBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.catBadgeText}>{CATEGORY_LABELS[product.category]}</Text>
            </View>
            {/* Contador de fotos */}
            {images.length > 1 && (
              <View style={styles.photoCounter}>
                <Text style={styles.photoCounterText}>{activeImg + 1}/{images.length}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: categoryColor + '18' }]}>
            <Text style={styles.placeholderEmoji}>{CAT_EMOJI[product.category]}</Text>
          </View>
        )}

        <View style={styles.body}>

          {/* Nombre */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Categorías y tags */}
          {product.categories?.length > 0 && (
            <View style={styles.tagsRow}>
              {product.categories.map((c, i) => (
                <View key={i} style={styles.tagChip}>
                  <Text style={styles.tagText}>{c}</Text>
                </View>
              ))}
            </View>
          )}

          {/* PRECIO */}
          <View style={styles.priceBox}>
            {isOnSale ? (
              <>
                <Text style={styles.priceOld}>{product.regularPrice}</Text>
                <Text style={styles.priceFinal}>{product.salePrice}</Text>
              </>
            ) : (
              <Text style={styles.priceFinal}>{product.price}</Text>
            )}
            <Text style={styles.priceLabel}>Precio de venta al público</Text>
          </View>

          {/* STOCK */}
          <View style={[styles.stockBox, { backgroundColor: stockColor + '12', borderColor: stockColor + '44' }]}>
            <View style={styles.stockLeft}>
              <Text style={[styles.stockNum, { color: stockColor }]}>{isOutOfStock ? '0' : product.stockQuantity}</Text>
              <Text style={styles.stockUnit}>unidades</Text>
            </View>
            <View style={[styles.stockBadge, { backgroundColor: stockColor }]}>
              <Text style={styles.stockBadgeText}>{stockLabel}</Text>
            </View>
          </View>

          {/* DESCRIPCIÓN CORTA */}
          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          ) : null}

          {/* DESCRIPCIÓN COMPLETA */}
          {product.fullDescription && product.fullDescription !== product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción completa</Text>
              <Text style={styles.descText}>{product.fullDescription}</Text>
            </View>
          ) : null}

          {/* ATRIBUTOS (autor, editorial, páginas, etc.) */}
          {product.attributes?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Datos del producto</Text>
              <View style={styles.attrBox}>
                {product.attributes.map((attr, i) => (
                  <View key={i}>
                    {i > 0 && <View style={styles.attrDivider} />}
                    <View style={styles.attrRow}>
                      <Text style={styles.attrLabel}>{attr.name}</Text>
                      <Text style={styles.attrValue}>{attr.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAGS */}
          {product.tags?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Etiquetas</Text>
              <View style={styles.tagsRow}>
                {product.tags.map((tag, i) => (
                  <View key={i} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* REFERENCIAS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referencia</Text>
            <View style={styles.refBox}>
              <View style={styles.refRow}>
                <Text style={styles.refLabel}>SKU / Código de barras</Text>
                <Text style={styles.refVal}>{product.sku}</Text>
              </View>
              {product.weight && (
                <>
                  <View style={styles.refDivider} />
                  <View style={styles.refRow}>
                    <Text style={styles.refLabel}>Peso</Text>
                    <Text style={styles.refVal}>{product.weight} kg</Text>
                  </View>
                </>
              )}
              <View style={styles.refDivider} />
              <View style={styles.refRow}>
                <Text style={styles.refLabel}>ID interno</Text>
                <Text style={styles.refVal}>#{product.id}</Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
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
  headerTitle: { flex: 1, color: Colors.textPrimary, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  content: { paddingBottom: 48 },
  galleryWrapper: { height: 280, backgroundColor: '#fff', position: 'relative' },
  galleryImage: { height: 280, backgroundColor: '#fff' },
  dotsRow: { position: 'absolute', bottom: 8, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.25)' },
  dotActive: { backgroundColor: Colors.primary, width: 14 },
  catBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  catBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  photoCounter: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  photoCounterText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  imagePlaceholder: { height: 220, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 64 },
  body: { padding: Spacing.md },
  name: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800', lineHeight: 26, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tagChip: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.border,
  },
  tagText: { color: Colors.textSecondary, fontSize: 11 },
  priceBox: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  priceOld: { color: Colors.textMuted, fontSize: 16, textDecorationLine: 'line-through', marginBottom: 2 },
  priceFinal: { color: Colors.primary, fontSize: 40, fontWeight: '800', lineHeight: 44 },
  priceLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  stockBox: {
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, marginBottom: Spacing.sm,
  },
  stockLeft: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  stockNum: { fontSize: 48, fontWeight: '800', lineHeight: 52 },
  stockUnit: { color: Colors.textSecondary, fontSize: 14, paddingBottom: 6 },
  stockBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  stockBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  section: { marginBottom: Spacing.md },
  sectionTitle: {
    color: Colors.textMuted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  descText: {
    color: Colors.textSecondary, fontSize: 14, lineHeight: 22,
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  attrBox: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  attrRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 12 },
  attrDivider: { height: 1, backgroundColor: Colors.border },
  attrLabel: { color: Colors.textMuted, fontSize: 13, flex: 1 },
  attrValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  refBox: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  refRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  refDivider: { height: 1, backgroundColor: Colors.border },
  refLabel: { color: Colors.textMuted, fontSize: 12 },
  refVal: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
});
