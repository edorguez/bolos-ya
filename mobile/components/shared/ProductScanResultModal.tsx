import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useAppTheme } from '../../styles/theme';
import { createProductScanResultModalStyles } from '../../styles/productScanResultModalStyles';
import { MaterialIcons } from '@expo/vector-icons';

interface ProductScanResultModalProps {
  isVisible: boolean;
  onClose: () => void;
  productName: string;
  priceBs: number;
  priceUsd: number;
  onAddToCart: (quantity: number) => void;
}

export function ProductScanResultModal({
  isVisible,
  onClose,
  productName,
  priceBs,
  priceUsd,
  onAddToCart,
}: ProductScanResultModalProps) {
  const theme = useAppTheme();
  const styles = createProductScanResultModalStyles(theme);

  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const formatPriceBs = (price: number) => {
    return `Bs. ${price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPriceUsd = (price: number) => {
    return `$${price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalContainer as ViewStyle} onPress={onClose}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <Pressable style={styles.modalContent as ViewStyle} onPress={e => e.stopPropagation()}>
            <View style={styles.headerRow as ViewStyle}>
              <View style={styles.titleContainer as ViewStyle}>
                <Text style={styles.subtitle as TextStyle}>Producto Detectado</Text>
                <Text style={styles.productName as TextStyle}>{productName}</Text>
              </View>
              <View style={styles.verifiedBadge as ViewStyle}>
                <MaterialIcons name="verified" size={24} color={theme.colors.meadowGreen} />
              </View>
            </View>

            <View style={styles.priceRow as ViewStyle}>
              <View style={styles.priceColumn as ViewStyle}>
                <Text style={styles.priceLabel as TextStyle}>Bolívares</Text>
                <Text style={styles.priceBs as TextStyle}>{formatPriceBs(priceBs)}</Text>
              </View>
              <View style={styles.divider as ViewStyle} />
              <View style={styles.priceColumn as ViewStyle}>
                <Text style={styles.priceLabel as TextStyle}>Dólares</Text>
                <Text style={styles.priceUsd as TextStyle}>{formatPriceUsd(priceUsd)}</Text>
              </View>
            </View>

            <View style={styles.quantitySection as ViewStyle}>
              <Text style={styles.priceLabel as TextStyle}>Cantidad</Text>
              <View style={styles.quantityControls as ViewStyle}>
                <Pressable
                  style={({ pressed }) => [
                    styles.quantityButton as ViewStyle,
                    { backgroundColor: theme.colors.surfaceContainerHigh },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={decrementQuantity}
                >
                  <MaterialIcons name="remove" size={24} color={theme.colors.primary} />
                </Pressable>
                <Text style={styles.quantityNumber as TextStyle}>{quantity}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.quantityButton as ViewStyle,
                    { backgroundColor: theme.colors.primary },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={incrementQuantity}
                >
                  <MaterialIcons name="add" size={24} color={theme.colors.white} />
                </Pressable>
              </View>
            </View>

            <View style={styles.actionRow as ViewStyle}>
              <Pressable
                style={({ pressed }) => [
                  styles.retryButton as ViewStyle,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={onClose}
              >
                <Text style={styles.retryButtonText as TextStyle}>Reintentar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.addButton as ViewStyle, pressed && { opacity: 0.8 }]}
                onPress={() => {
                  onAddToCart(quantity);
                  onClose();
                }}
              >
                <MaterialIcons name="add-circle" size={20} color={theme.colors.white} />
                <Text style={styles.addButtonText as TextStyle}>Añadir</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
