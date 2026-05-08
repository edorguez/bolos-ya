import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  type ViewStyle,
  type TextStyle,
  ScrollView,
} from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);

interface ProductScanResultModalProps {
  isVisible: boolean;
  onClose: () => void;
  productName: string;
  priceBs: number;
  priceUsd: number;
  rawText?: string;
  onAddToCart: () => void;
}

const stylesheet = StyleSheet.create(theme => ({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    width: MODAL_WIDTH,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.emberOrange,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  productName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurface,
    lineHeight: 24,
    letterSpacing: theme.typography.letterSpacing.lg,
  },
  verifiedBadge: {
    backgroundColor: theme.colors.meadowGreen + '20',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  toggleButton: {
    backgroundColor: theme.colors.stoneSurface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  toggleButtonText: {
    color: theme.colors.emberOrange,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  rawTextContainer: {
    marginTop: theme.spacing.md,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  rawText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.outline,
    fontFamily: 'monospace',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  priceColumn: {
    flex: 1,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.outline,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
    letterSpacing: 1,
  },
  priceBs: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurface,
    letterSpacing: theme.typography.letterSpacing.lg,
  },
  priceUsd: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.emberOrange,
    letterSpacing: theme.typography.letterSpacing.lg,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.stoneSurface,
    marginBottom: theme.spacing.xs,
  },
  addButton: {
    backgroundColor: theme.colors.midnight,
    borderRadius: theme.borderRadius.button,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
}));

export function ProductScanResultModal({
  isVisible,
  onClose,
  productName,
  priceBs,
  priceUsd,
  rawText,
  onAddToCart,
}: ProductScanResultModalProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const [showRawText, setShowRawText] = useState(false);

  const formatPriceBs = (price: number) => {
    return `Bs. ${price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPriceUsd = (price: number) => {
    return `$${price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalContainer as ViewStyle} onPress={onClose}>
        <Pressable style={styles.modalContent as ViewStyle} onPress={e => e.stopPropagation()}>
          <View style={styles.headerRow as ViewStyle}>
            <View style={styles.titleContainer as ViewStyle}>
              <Text style={styles.subtitle as TextStyle}>Producto Detectado</Text>
              <Text style={styles.productName as TextStyle}>{productName}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {rawText && (
                <Pressable
                  style={styles.toggleButton as ViewStyle}
                  onPress={() => setShowRawText(!showRawText)}
                >
                  <Text style={styles.toggleButtonText as TextStyle}>
                    {showRawText ? 'Ocultar texto' : 'Ver texto'}
                  </Text>
                </Pressable>
              )}
              <View style={styles.verifiedBadge as ViewStyle}>
                <MaterialIcons name="verified" size={24} color={theme.colors.meadowGreen} />
              </View>
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

          {rawText && showRawText && (
            <View style={styles.rawTextContainer as ViewStyle}>
              <ScrollView>
                <Text style={styles.rawText as TextStyle}>{rawText}</Text>
              </ScrollView>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.addButton as ViewStyle, pressed && { opacity: 0.8 }]}
            onPress={() => {
              onAddToCart();
              onClose();
            }}
          >
            <MaterialIcons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText as TextStyle}>Añadir a la libreta</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
