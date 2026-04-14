import {
  View,
  Text,
  Image,
  Pressable,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { CartItem, useCartStore } from '../../store/cartStore'

interface ProductCardProps {
  item: CartItem
  cartId: string
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: `${theme.colors.outlineVariant}10`,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceContainer,
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceColumn: {
    flexDirection: 'column',
    gap: 2,
  },
  priceBs: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
  },
  priceUsd: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.onSurfaceVariant,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 16,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  quantityText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
    minWidth: 20,
    textAlign: 'center',
  },
}))

export function ProductCard({ item, cartId }: ProductCardProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)
  const { updateItemQuantity, removeItemFromCart } = useCartStore()

  // Placeholder image - in real app would use item.productImageUrl
  const imageUrl =
    item.productImageUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC6k9pYxNSoMVMuc_vD59UZLC-6VfJK8aEj5uGakolu4kW-WgHO5MYUzFdiz18MRHXcl5QwWKNYA3lcu3qjrcKIlEDziPD99ApevVCk68rNjpFzDoa07ZSNWGgycQ-FybsEAcp2m6XR0Xk5Eg-78cyYvv0sWlTsi2GZcEfF34On_I7yXLw0VoBA_j_lsxIrWvpr5bfk7A5EnddqyWWzX3g-uNNI-bcIAxI8UgtygDvh_GnHD_McmAhMAjay3GZCUx5DwN75OI4HM-T4'

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateItemQuantity(cartId, item.id, item.quantity - 1)
    } else {
      removeItemFromCart(cartId, item.id)
    }
  }

  const handleIncrease = () => {
    updateItemQuantity(cartId, item.id, item.quantity + 1)
  }

  const handleEdit = () => {
    // TODO: Open edit modal
  }

  const handleDelete = () => {
    removeItemFromCart(cartId, item.id)
  }

  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.imageContainer as ViewStyle}>
        <Image source={{ uri: imageUrl }} style={styles.image as ImageStyle} />
      </View>
      <View style={styles.content as ViewStyle}>
        <View style={styles.header as ViewStyle}>
          <Text style={styles.title as TextStyle}>{item.name}</Text>
          <View style={styles.actionButtons as ViewStyle}>
            <Pressable onPress={handleEdit} style={styles.actionButton as ViewStyle}>
              <MaterialIcons name="edit" size={20} color={theme.colors.onSurfaceVariant} />
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.actionButton as ViewStyle}>
              <MaterialIcons name="delete" size={20} color={theme.colors.error} />
            </Pressable>
          </View>
        </View>
        <View style={styles.priceRow as ViewStyle}>
          <View style={styles.priceColumn as ViewStyle}>
            <Text style={styles.priceBs as TextStyle}>
              Bs. {item.priceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.priceUsd as TextStyle}>
              $ {item.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </Text>
          </View>
          <View style={styles.quantityControls as ViewStyle}>
            <Pressable onPress={handleDecrease} style={styles.quantityButton as ViewStyle}>
              <MaterialIcons name="remove" size={16} color={theme.colors.primary} />
            </Pressable>
            <Text style={styles.quantityText as TextStyle}>{item.quantity}</Text>
            <Pressable onPress={handleIncrease} style={styles.quantityButton as ViewStyle}>
              <MaterialIcons name="add" size={16} color={theme.colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}
