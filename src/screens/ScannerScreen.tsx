import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { searchByBarcode } from '../services/productService';
import type { Product } from '../services/productService';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lastCode, setLastCode] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!scanned) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]));
      loop.start();
      return () => loop.stop();
    }
  }, [scanned]);

  useEffect(() => {
    if (product || notFound) {
      Animated.spring(resultAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }).start();
    } else {
      resultAnim.setValue(0);
    }
  }, [product, notFound]);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || data === lastCode) return;
    setScanned(true); setLastCode(data); setLoading(true); setProduct(null); setNotFound(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const result = await searchByBarcode(data);
      if (result) { setProduct(result); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
      else { setNotFound(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }
    } catch (e) { setNotFound(true); }
    finally { setLoading(false); }
  };

  const handleReset = () => { setScanned(false); setProduct(null); setNotFound(false); setLastCode(''); };

  if (showDetail && product) {
    return <ProductDetail product={product} onClose={() => setShowDetail(false)} />;
  }

  if (!permission) return <View style={styles.centered}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Acceso a la Cámara</Text>
        <Text style={styles.permissionText}>Necesitamos permiso para escanear códigos de barras.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scanLineTranslate = scanLineAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e', 'qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {!scanned && <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]} />}
            {loading && <View style={styles.loadingOverlay}><ActivityIndicator color={Colors.primary} size="large" /><Text style={styles.loadingText}>Buscando...</Text></View>}
          </View>
        </View>
        {!scanned && <View style={styles.instructionBox}><Text style={styles.instructionText}>📦 Apunta al código de barras</Text></View>}
      </View>
      <View style={styles.resultContainer}>
        {!scanned && !product && !notFound && (
          <View style={styles.readyState}>
            <Text style={styles.readyTitle}>Listo para escanear</Text>
            <Text style={styles.readySubtitle}>Compatible con EAN-13, EAN-8, Code128, QR y más</Text>
          </View>
        )}
        {(product || notFound) && (
          <Animated.View style={[styles.resultContent, { opacity: resultAnim, transform: [{ translateY: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            {notFound && (
              <View style={styles.notFoundBox}>
                <Text style={styles.notFoundIcon}>🔍</Text>
                <Text style={styles.notFoundTitle}>Producto no encontrado</Text>
                <Text style={styles.notFoundCode}>Código: {lastCode}</Text>
              </View>
            )}
            {product && <ProductCard product={product} onPress={() => setShowDetail(true)} />}
            <TouchableOpacity style={styles.scanAgainButton} onPress={handleReset}>
              <Text style={styles.scanAgainText}>⟳ Escanear otro producto</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const SCAN_SIZE = 240;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  cameraWrapper: { height: 320, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
  scanArea: { width: SCAN_SIZE, height: SCAN_SIZE, backgroundColor: 'transparent', position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: Colors.primary, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: Colors.primary },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,10,30,0.8)', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  instructionBox: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  instructionText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: BorderRadius.full },
  resultContainer: { flex: 1 },
  readyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  readyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  readySubtitle: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  resultContent: { flex: 1, paddingTop: Spacing.sm },
  notFoundBox: { margin: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.warning + '44' },
  notFoundIcon: { fontSize: 36, marginBottom: 8 },
  notFoundTitle: { color: Colors.warning, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  notFoundCode: { color: Colors.textSecondary, fontFamily: 'monospace', fontSize: 13 },
  scanAgainButton: { margin: Spacing.md, marginTop: Spacing.sm, backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  scanAgainText: { color: Colors.textOnPrimary, fontWeight: '800', fontSize: 16 },
  permissionIcon: { fontSize: 56, marginBottom: Spacing.md },
  permissionTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm },
  permissionText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  permissionButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  permissionButtonText: { color: Colors.textOnPrimary, fontWeight: '700', fontSize: 16 },
});
