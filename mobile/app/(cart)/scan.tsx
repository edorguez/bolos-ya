import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import { useAppTheme } from '../../styles/theme';
import { createScanStyles } from '../../styles/scanStyles';
import { TopAppBar } from '../../components/shared/TopAppBar';
import { ProductScanResultModal } from '../../components/shared/ProductScanResultModal';
import { ManualEntryModal } from '../../components/shared/ManualEntryModal';
import { NoRecognitionModal } from '../../components/shared/NoRecognitionModal';
import { useCartStore } from '../../store/cartStore';
import { scanImage, preprocessImage } from '../../lib/ocr';
import { MaterialIcons } from '@expo/vector-icons';

export default function ScanScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createScanStyles(theme);
  const { activeCartId, carts, addProductToCart } = useCartStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    name: string;
    priceBs: number;
    priceUsd: number;
    confidence?: number;
  } | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const [showNoRecognition, setShowNoRecognition] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const activeCart = activeCartId ? carts.find(c => c.id === activeCartId) : null;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startScanning = async () => {
    if (isScanning || !cameraRef.current) return;

    setIsScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        base64: false,
        exif: false,
        shutterSound: false,
      });

      const processedUri = await preprocessImage(photo.uri);
      const result = await scanImage(processedUri);

      if (result.warning || !result.productName || !result.price || result.price === 0) {
        setShowNoRecognition(true);
      } else {
        setScanResult({
          name: result.productName,
          priceBs: result.priceBs,
          priceUsd: result.priceUsd,
          confidence: result.confidence,
        });
      }
    } catch (error) {
      console.error('OCR scanning failed:', error);
      setShowNoRecognition(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddToCart = () => {
    if (!scanResult || !activeCart) return;

    addProductToCart(activeCart.id, {
      productId: `scanned_${Date.now()}`,
      name: scanResult.name,
      priceBs: scanResult.priceBs,
      priceUsd: scanResult.priceUsd,
      quantity: 1,
      supermarket: activeCart.supermarket,
    });

    setScanResult(null);
    router.back();
  };

  const handleManualSubmit = (name: string, priceBs: number, priceUsd: number) => {
    if (!activeCart) return;

    addProductToCart(activeCart.id, {
      productId: `scanned_${Date.now()}`,
      name,
      priceBs,
      priceUsd,
      quantity: 1,
      supermarket: activeCart.supermarket,
    });

    setShowManualEntry(false);
    router.back();
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Sin acceso a la cámara</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: theme.colors.emberOrange, marginTop: 16 }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="MercadoLibreta" onBackPress={() => router.back()} />

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing={cameraType}
          ratio="16:9"
          autofocus="on"
        />

        <View style={styles.overlayPanels} pointerEvents="none">
          <View style={[styles.overlayTint, { flex: 0.8 }]} />

          <View style={styles.overlayMiddleRow}>
            <View style={[styles.overlayTint, { flex: 1 }]} />

            <View style={styles.scanArea}>
              <View style={[styles.cornerLine, styles.cornerVertical, { top: 0, left: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerHorizontal, { top: 0, left: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerVertical, { top: 0, right: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerHorizontal, { top: 0, right: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerVertical, { bottom: 0, left: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerHorizontal, { bottom: 0, left: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerVertical, { bottom: 0, right: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerHorizontal, { bottom: 0, right: 0 }]} />
            </View>

            <View style={[styles.overlayTint, { flex: 1 }]} />
          </View>

          <View style={[styles.overlayTint, { flex: 1 }]} />
        </View>

        {isScanning ? (
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.emberOrange }]} />
            <Text style={styles.statusText}>Escaneando...</Text>
          </View>
        ) : (
          <Text style={styles.hintText}>
            Apunta a la etiqueta del producto y mantén tu teléfono vertical
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.floatingCameraButton,
            { backgroundColor: theme.colors.emberOrange },
            pressed ? { opacity: 0.8 } : null,
            isScanning ? { opacity: 0.4 } : null,
          ]}
          onPress={startScanning}
          disabled={isScanning}
        >
          <MaterialIcons name="photo-camera" size={40} color="#fff" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.flipCameraButton,
            pressed ? { opacity: 0.6 } : null,
            isScanning ? { opacity: 0.4 } : null,
          ]}
          onPress={toggleCameraType}
          disabled={isScanning}
        >
          <MaterialIcons name="flip-camera-ios" size={28} color="#fff" />
        </Pressable>
      </View>

      <ProductScanResultModal
        isVisible={!!scanResult}
        onClose={() => setScanResult(null)}
        productName={scanResult?.name || ''}
        priceBs={scanResult?.priceBs || 0}
        priceUsd={scanResult?.priceUsd || 0}
        onAddToCart={handleAddToCart}
      />

      <NoRecognitionModal
        isVisible={showNoRecognition}
        onClose={() => setShowNoRecognition(false)}
        onManualEntry={() => {
          setShowNoRecognition(false);
          setShowManualEntry(true);
        }}
      />

      <ManualEntryModal
        isVisible={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSubmit={handleManualSubmit}
      />
    </View>
  );
}
