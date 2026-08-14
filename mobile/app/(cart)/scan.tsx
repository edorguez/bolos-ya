import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { useAppTheme } from '../../styles/theme';
import { createScanStyles } from '../../styles/scanStyles';
import { TopAppBar } from '../../components/shared/TopAppBar';
import { ProductScanResultModal } from '../../components/shared/ProductScanResultModal';
import { ManualEntryModal } from '../../components/shared/ManualEntryModal';
import { NoRecognitionModal } from '../../components/shared/NoRecognitionModal';
import { WaveText } from '../../components/shared/WaveText';
import { usePulse } from '../../hooks/animations';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../store/authStore';
import { useBCV } from '../../store/bcvStore';
import { addCartProduct } from '../../services/cartService';
import { Toast } from '../../components/shared/Toast';
import { scanImage, preprocessImage, rotateImage } from '../../lib/ocr';
import { MaterialIcons } from '@expo/vector-icons';

// Clamps a crop rectangle to the photo bounds.
function clampCrop(
  originX: number,
  originY: number,
  width: number,
  height: number,
  photoW: number,
  photoH: number
): { originX: number; originY: number; width: number; height: number } {
  const ox = Math.max(0, Math.min(originX, photoW - 1));
  const oy = Math.max(0, Math.min(originY, photoH - 1));
  const w = Math.max(1, Math.min(width, photoW - ox));
  const h = Math.max(1, Math.min(height, photoH - oy));
  return { originX: ox, originY: oy, width: w, height: h };
}

export default function ScanScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createScanStyles(theme);
  const { activeCartId, carts, addProductToCart } = useCartStore();
  const { user } = useAuth();
  const { rate: exchangeRate } = useBCV();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    name: string;
    priceBs: number;
    priceUsd: number;
    confidence?: number;
    imageUri?: string;
    imageAspectRatio?: number;
  } | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const [showNoRecognition, setShowNoRecognition] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  const cameraLayoutRef = useRef<{ width: number; height: number } | null>(null);
  const middleRowLayoutRef = useRef<{ x: number; y: number } | null>(null);
  const scanAreaLayoutRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Physical device rotation (degrees, counter-clockwise from upright:
  // 0 = upright, 90 = head-left, 180 = upside-down, 270 = head-right). The
  // app is portrait-locked, so the camera's capture rotation is based on this
  // physical angle, and EXIF orientation is unreliable across devices.
  const deviceAngleRef = useRef<number | null>(null);

  const handleCameraLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    cameraLayoutRef.current = { width, height };
  };

  const handleMiddleRowLayout = (e: LayoutChangeEvent) => {
    const { x, y } = e.nativeEvent.layout;
    middleRowLayoutRef.current = { x, y };
  };

  const handleScanAreaLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    scanAreaLayoutRef.current = { x, y, width, height };
  };

  const dotPulse = usePulse({ min: 0.3, max: 1, duration: 900 });
  const cornerPulse = usePulse({ min: 0.7, max: 1, duration: 1200 });

  const activeCart = activeCartId ? carts.find(c => c.id === activeCartId) : null;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    let active = true;
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y }) => {
      if (!active) return;
      const raw = (Math.atan2(-x, -y) * 180) / Math.PI;
      deviceAngleRef.current = ((raw % 360) + 360) % 360;
    });
    return () => {
      active = false;
      subscription.remove();
      Accelerometer.removeAllListeners();
    };
  }, []);

  const startScanning = async () => {
    if (isScanning || !cameraRef.current) return;

    setIsScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        base64: false,
        exif: true,
        shutterSound: false,
      });

      const camLayout = cameraLayoutRef.current;
      const middleRowLayout = middleRowLayoutRef.current;
      const scanLayout = scanAreaLayoutRef.current;

      const camW = camLayout?.width ?? 0;
      const camH = camLayout?.height ?? 0;
      const relX = Math.max(0, (middleRowLayout?.x ?? 0) + (scanLayout?.x ?? 0));
      const relY = Math.max(0, (middleRowLayout?.y ?? 0) + (scanLayout?.y ?? 0));
      const scanW = scanLayout?.width ?? 0;
      const scanH = scanLayout?.height ?? 0;

      let processedUri: string;
      const validMeasure = camW > 0 && camH > 0 && scanW > 0 && scanH > 0;

      if (validMeasure) {
        const containerLandscape = camW > camH;
        const photoLandscape = photo.width > photo.height;

        let photoUri = photo.uri;
        let photoW = photo.width;
        let photoH = photo.height;
        let rotationDeg = 0;
        const deviceAngle = deviceAngleRef.current;

        // Rotate the captured photo so it matches the (portrait) preview.
        // EXIF orientation is unreliable across devices (some cameras report
        // 0/1 even when rotated), so the direction is derived from the physical
        // device orientation reported by the accelerometer. The raw photo is
        // normally landscape and is rotated 90°/270° to become portrait; when
        // the phone is upside down the camera returns a portrait raw that must
        // be flipped 180° instead.
        if (deviceAngle !== null) {
          if (photoLandscape) {
            // Only the head-left position needs 270° CW; upright and head-right
            // both need 90° CW.
            rotationDeg = deviceAngle >= 45 && deviceAngle < 135 ? 270 : 90;
          } else {
            rotationDeg = deviceAngle >= 135 && deviceAngle < 225 ? 180 : 0;
          }
        } else {
          const orientation = (photo.exif as Record<string, unknown> | undefined)?.Orientation;
          if (orientation === 6) rotationDeg = 90;
          else if (orientation === 8) rotationDeg = 270;
          else if (orientation === 3) rotationDeg = 180;
          else rotationDeg = photoLandscape ? 90 : 0;
        }

        if (rotationDeg !== 0) {
          try {
            const rotated = await rotateImage(photo.uri, rotationDeg);
            photoUri = rotated.uri;
            photoW = rotated.width;
            photoH = rotated.height;
          } catch {
            rotationDeg = 0;
          }
        }

        // The preview and the captured photo show the same full frame, so the
        // box maps onto the photo with a simple per-axis scale (the photo is a
        // scaled copy of what the user framed).
        const scaleX = photoW / camW;
        const scaleY = photoH / camH;
        const originX = Math.round(relX * scaleX);
        const originY = Math.round(relY * scaleY);
        const width = Math.round(scanW * scaleX);
        const height = Math.round(scanH * scaleY);

        console.log('[SCAN] crop', {
          photoW: photo.width,
          photoH: photo.height,
          cam: { camW, camH },
          scan: { relX, relY, scanW, scanH },
          containerLandscape,
          photoLandscape,
          rotationDeg,
          deviceAngle,
          exifOrientation: (photo.exif as Record<string, unknown> | undefined)?.Orientation,
          cropPhotoW: photoW,
          cropPhotoH: photoH,
          scaleX,
          scaleY,
          originX,
          originY,
          width,
          height,
        });

        // Clamp to the photo bounds so we never read outside the image.
        const {
          originX: ox,
          originY: oy,
          width: w,
          height: h,
        } = clampCrop(originX, originY, width, height, photoW, photoH);

        processedUri = await preprocessImage(photoUri, {
          originX: ox,
          originY: oy,
          width: w,
          height: h,
        });
      } else {
        // Never fall back to the full image: that would read text outside the
        // scan rectangle. Use a center crop instead.
        console.warn('[SCAN] layout not ready (center crop)', {
          camLayout,
          middleRowLayout,
          scanLayout,
        });
        const w = Math.round(photo.width * 0.6);
        const h = Math.round(photo.height * 0.6);
        const ox = Math.max(0, Math.round((photo.width - w) / 2));
        const oy = Math.max(0, Math.round((photo.height - h) / 2));
        processedUri = await preprocessImage(photo.uri, {
          originX: ox,
          originY: oy,
          width: w,
          height: h,
        });
      }

      const result = await scanImage(processedUri);

      if (result.warning || !result.productName || !result.price || result.price === 0) {
        setShowNoRecognition(true);
      } else {
        setScanResult({
          name: result.productName,
          priceBs: result.priceBs,
          priceUsd: result.priceUsd,
          confidence: result.confidence,
          imageUri: processedUri,
          imageAspectRatio: scanW > 0 && scanH > 0 ? scanW / scanH : 1.8,
        });
      }
    } catch (error) {
      console.error('OCR scanning failed:', error);
      setShowNoRecognition(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddToCart = async (quantity: number) => {
    if (!scanResult || !activeCart || !user?.id) return;

    const name = scanResult.name.slice(0, 100).trim();
    const priceBs = scanResult.priceBs;
    const priceUsd = scanResult.priceUsd;
    const rate = exchangeRate?.usdRate ?? 0;

    if (!name) {
      setToast({ message: 'Nombre de producto inválido', isError: true });
      return;
    }
    if (priceBs <= 0 && priceUsd <= 0) {
      setToast({ message: 'Precio inválido', isError: true });
      return;
    }
    if (priceBs < 0 || priceUsd < 0) {
      setToast({ message: 'Precio inválido', isError: true });
      return;
    }
    if (!rate && rate !== 0) {
      setToast({
        message: 'Tasa de cambio no disponible. Se usará 0 como referencia.',
        isError: false,
      });
    }

    try {
      const result = await addCartProduct(
        {
          cartId: activeCart.id,
          supermarketId: activeCart.supermarketId,
          name,
          priceUsd,
          priceBs,
          priceBcv: rate || 0,
          quantity,
          isManualEntry: false,
        },
        user.id
      );

      addProductToCart(activeCart.id, {
        id: result.id,
        productId: result.productId,
        name: result.name,
        priceBs: result.priceBs,
        priceUsd: result.priceUsd,
        quantity: result.quantity,
        supermarket: activeCart.supermarket,
        productImageUrl: result.imageUrl || undefined,
      });

      setScanResult(null);
      setToast({ message: 'Producto agregado exitosamente', isError: false });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error al agregar producto',
        isError: true,
      });
    }
  };

  const handleManualSubmit = async (
    name: string,
    priceBs: number,
    priceUsd: number,
    priceBcv: number,
    quantity: number
  ) => {
    if (!activeCart || !user?.id) return;

    const trimmed = name.trim().slice(0, 100);

    if (!trimmed) {
      setToast({ message: 'Nombre de producto requerido', isError: true });
      return;
    }
    if (priceBs <= 0 && priceUsd <= 0) {
      setToast({ message: 'Ingresa un precio válido', isError: true });
      return;
    }
    if (priceBs < 0 || priceUsd < 0) {
      setToast({ message: 'Precio inválido', isError: true });
      return;
    }
    if (priceBcv <= 0) {
      setToast({
        message: 'Tasa de cambio no disponible. Se usará 0 como referencia.',
        isError: false,
      });
    }

    try {
      const result = await addCartProduct(
        {
          cartId: activeCart.id,
          supermarketId: activeCart.supermarketId,
          name: trimmed,
          priceUsd,
          priceBs,
          priceBcv,
          quantity,
          isManualEntry: true,
        },
        user.id
      );

      addProductToCart(activeCart.id, {
        id: result.id,
        productId: result.productId,
        name: result.name,
        priceBs: result.priceBs,
        priceUsd: result.priceUsd,
        quantity: result.quantity,
        supermarket: activeCart.supermarket,
        productImageUrl: result.imageUrl || undefined,
      });

      setShowManualEntry(false);
      setToast({ message: 'Producto agregado exitosamente', isError: false });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error al agregar producto',
        isError: true,
      });
    }
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
      <TopAppBar title="Merki" onBackPress={() => router.back()} />

      <View onLayout={handleCameraLayout} style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing={cameraType}
          ratio="16:9"
          autofocus="on"
        />

        <View style={styles.overlayPanels} pointerEvents="none">
          <View style={[styles.overlayTint, { flex: 0.8 }]} />

          <View onLayout={handleMiddleRowLayout} style={styles.overlayMiddleRow}>
            <View style={[styles.overlayTint, { flex: 1 }]} />

            <Animated.View onLayout={handleScanAreaLayout} style={[styles.scanArea, cornerPulse]}>
              <View style={[styles.cornerLine, styles.cornerVertical, { top: 0, left: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerHorizontal, { top: 0, left: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerVertical, { top: 0, right: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerHorizontal, { top: 0, right: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerVertical, { bottom: 0, left: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerHorizontal, { bottom: 0, left: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerVertical, { bottom: 0, right: 0 }]} />
              <View style={[styles.cornerLine, styles.cornerHorizontal, { bottom: 0, right: 0 }]} />
            </Animated.View>

            <View style={[styles.overlayTint, { flex: 1 }]} />
          </View>

          <View style={[styles.overlayTint, { flex: 1 }]} />
        </View>

        {isScanning ? (
          <View style={styles.statusContainer}>
            <Animated.View
              style={[styles.statusDot, { backgroundColor: theme.colors.emberOrange }, dotPulse]}
            />
            <WaveText text="Escaneando..." style={styles.statusText} />
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
        imageUri={scanResult?.imageUri || ''}
        imageAspectRatio={scanResult?.imageAspectRatio ?? 1.8}
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

      <Toast
        message={toast?.message ?? null}
        isError={toast?.isError ?? true}
        onDismiss={() => setToast(null)}
      />
    </View>
  );
}
