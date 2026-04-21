import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400)

interface ProductScanResultModalProps {
  isVisible: boolean
  onClose: () => void
  productName: string
  priceBs: number
  priceUsd: number
  onAddToCart: () => void
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
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
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
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: theme.spacing.xs,
  },
  productName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
    lineHeight: 24,
  },
  verifiedBadge: {
    backgroundColor: `${theme.colors.tertiaryContainer}30`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
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
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.outline,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  priceBs: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
    letterSpacing: -0.5,
  },
  priceUsd: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary,
    letterSpacing: -0.3,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: `${theme.colors.outlineVariant}30`,
    marginBottom: theme.spacing.xs,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    gap: 8,
  },
  addButtonText: {
    color: theme.colors.surfaceContainerLowest,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
}))

export function ProductScanResultModal({
  isVisible,
  onClose,
  productName,
  priceBs,
  priceUsd,
  onAddToCart,
}: ProductScanResultModalProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  const formatPriceBs = (price: number) => {
    return `Bs. ${price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPriceUsd = (price: number) => {
    return `$${price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalContainer as ViewStyle} onPress={onClose}>
        <Pressable style={styles.modalContent as ViewStyle} onPress={e => e.stopPropagation()}>
          <View style={styles.headerRow as ViewStyle}>
            <View style={styles.titleContainer as ViewStyle}>
              <Text style={styles.subtitle as TextStyle}>Producto Detectado</Text>
              <Text style={styles.productName as TextStyle}>{productName}</Text>
            </View>
            <View style={styles.verifiedBadge as ViewStyle}>
              <MaterialIcons name="verified" size={24} color={theme.colors.tertiary} />
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

          <Pressable
            style={({ pressed }) => [styles.addButton as ViewStyle, pressed && { opacity: 0.8 }]}
            onPress={() => {
              onAddToCart()
              onClose()
            }}
          >
            <MaterialIcons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText as TextStyle}>Añadir a la libreta</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
