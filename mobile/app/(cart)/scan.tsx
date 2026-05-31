import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import { useAppTheme } from '../../styles/theme';
import { TopAppBar } from '../../components/shared/TopAppBar';
import { Toast } from '../../components/shared/Toast';
import { ProductScanResultModal } from '../../components/shared/ProductScanResultModal';
import { useCartStore } from '../../store/cartStore';
import { scanImage } from '../../services/ocr';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCANNER_FRAME_WIDTH = SCREEN_WIDTH * 0.8;
const SCANNER_FRAME_HEIGHT = SCREEN_WIDTH * 0.6;

export default function ScanScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { activeCartId, carts, addProductToCart } = useCartStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    name: string;
    priceBs: number;
    priceUsd: number;
    rawText?: string;
    confidence?: number;
  } | null>(null);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView>(null);
  const [toast, setToast] = useState<string | null>(null);

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

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      const result = await scanImage(photo.uri);

      setScanResult({
        name: result.productName,
        priceBs: result.priceBs,
        priceUsd: result.priceUsd,
        rawText: result.rawText,
        confidence: result.confidence,
      });
    } catch (error) {
      console.error('OCR scanning failed:', error);
      setToast(
        error instanceof Error ? error.message : 'No se pudo leer la etiqueta. Intenta nuevamente.'
      );
    } finally {
      animation.stop();
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

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    cameraContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scannerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scannerFrame: {
      width: SCANNER_FRAME_WIDTH,
      height: SCANNER_FRAME_HEIGHT,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.4)',
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      backgroundColor: 'transparent',
    },
    scanLineContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
    },
    cornerTL: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 24,
      height: 24,
      borderTopWidth: 4,
      borderLeftWidth: 4,
      borderColor: theme.colors.white,
      borderTopLeftRadius: 8,
    },
    cornerTR: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 24,
      height: 24,
      borderTopWidth: 4,
      borderRightWidth: 4,
      borderColor: theme.colors.white,
      borderTopRightRadius: 8,
    },
    cornerBL: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 24,
      height: 24,
      borderBottomWidth: 4,
      borderLeftWidth: 4,
      borderColor: theme.colors.white,
      borderBottomLeftRadius: 8,
    },
    cornerBR: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      borderBottomWidth: 4,
      borderRightWidth: 4,
      borderColor: theme.colors.white,
      borderBottomRightRadius: 8,
    },
    statusContainer: {
      marginTop: 32,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.full,
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.emberOrange,
    },
    statusText: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    floatingCameraButton: {
      position: 'absolute',
      bottom: 140,
      alignSelf: 'center',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.emberOrange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flipCameraButton: {
      position: 'absolute',
      bottom: 140,
      right: 32,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.white }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.white }}>No access to camera</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: theme.colors.emberOrange, marginTop: 16 }}>Go back</Text>
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
        />

        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {isScanning && (
              <Animated.View
                style={[
                  styles.scanLineContainer,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, SCANNER_FRAME_HEIGHT],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={{
                    height: 2,
                    backgroundColor: theme.colors.emberOrange,
                    shadowColor: theme.colors.emberOrange,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                  }}
                />
              </Animated.View>
            )}
          </View>

          {isScanning && (
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.emberOrange }]} />
              <Text style={styles.statusText}>Scanning...</Text>
            </View>
          )}
        </View>

        <Pressable
          style={styles.floatingCameraButton}
          onPress={startScanning}
          disabled={isScanning}
        >
          <MaterialIcons name="photo-camera" size={40} color={theme.colors.white} />
        </Pressable>

        <Pressable style={styles.flipCameraButton} onPress={toggleCameraType}>
          <MaterialIcons name="flip-camera-ios" size={28} color={theme.colors.white} />
        </Pressable>
      </View>

      <Toast message={toast} onDismiss={() => setToast(null)} />

      <ProductScanResultModal
        isVisible={!!scanResult}
        onClose={() => setScanResult(null)}
        productName={scanResult?.name || ''}
        priceBs={scanResult?.priceBs || 0}
        priceUsd={scanResult?.priceUsd || 0}
        rawText={scanResult?.rawText}
        onAddToCart={handleAddToCart}
      />
    </View>
  );
}
