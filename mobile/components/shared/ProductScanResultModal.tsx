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
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

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
    backgroundColor: `${theme.colors.surfaceContainerLowest}EE`,

    borderRadius: theme.borderRadius.lg,
    padding: 24,
    marginBottom: 24,
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
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  productName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.onSurface,
    lineHeight: 24,
  },
  verifiedBadge: {
    backgroundColor: `${theme.colors.tertiaryContainer}30`,
    padding: 8,
    borderRadius: theme.borderRadius.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  priceColumn: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.outline,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  priceBs: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.onSurface,
    letterSpacing: -0.5,
  },
  priceUsd: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.secondary,
    letterSpacing: -0.3,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: `${theme.colors.outlineVariant}30`,
    marginBottom: 4,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
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
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalContainer as ViewStyle} onPress={onClose}>
        <Pressable style={styles.modalContent as ViewStyle} onPress={e => e.stopPropagation()}>
          <View style={styles.headerRow as ViewStyle}>
            <View style={styles.titleContainer as ViewStyle}>
              <Text style={styles.subtitle as TextStyle}>Price Detected</Text>
              <Text style={styles.productName as TextStyle}>{productName}</Text>
            </View>
            <View style={styles.verifiedBadge as ViewStyle}>
              <MaterialIcons name="verified" size={24} color={theme.colors.tertiary} />
            </View>
          </View>

          <View style={styles.priceRow as ViewStyle}>
            <View style={styles.priceColumn as ViewStyle}>
              <Text style={styles.priceLabel as TextStyle}>En Bolívares</Text>
              <Text style={styles.priceBs as TextStyle}>{formatPriceBs(priceBs)}</Text>
            </View>
            <View style={styles.divider as ViewStyle} />
            <View style={styles.priceColumn as ViewStyle}>
              <Text style={styles.priceLabel as TextStyle}>En Dólares</Text>
              <Text style={styles.priceUsd as TextStyle}>{formatPriceUsd(priceUsd)}</Text>
            </View>
          </View>

          <Pressable
            style={styles.addButton as ViewStyle}
            onPress={() => {
              onAddToCart()
              onClose()
            }}
          >
            <MaterialIcons name="add_circle" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText as TextStyle}>Añadir a la libreta</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
