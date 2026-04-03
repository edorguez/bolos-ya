import { View, Text, Image, type ViewStyle, type TextStyle, type ImageStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { CartItem } from '../../store/cartStore'

interface ProductCardProps {
  item: CartItem
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
    marginBottom: 4,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  priceRow: {
    flexDirection: 'column',
    gap: 2,
  },
  priceBs: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
  },
  priceUsd: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.outline,
  },
}))

export function ProductCard({ item }: ProductCardProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  // Placeholder image - in real app would use item.productImageUrl
  const imageUrl =
    item.productImageUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC6k9pYxNSoMVMuc_vD59UZLC-6VfJK8aEj5uGakolu4kW-WgHO5MYUzFdiz18MRHXcl5QwWKNYA3lcu3qjrcKIlEDziPD99ApevVCk68rNjpFzDoa07ZSNWGgycQ-FybsEAcp2m6XR0Xk5Eg-78cyYvv0sWlTsi2GZcEfF34On_I7yXLw0VoBA_j_lsxIrWvpr5bfk7A5EnddqyWWzX3g-uNNI-bcIAxI8UgtygDvh_GnHD_McmAhMAjay3GZCUx5DwN75OI4HM-T4'

  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.imageContainer as ViewStyle}>
        <Image source={{ uri: imageUrl }} style={styles.image as ImageStyle} />
      </View>
      <View style={styles.content as ViewStyle}>
        <View style={styles.header as ViewStyle}>
          <Text style={styles.title as TextStyle}>{item.name}</Text>
          <MaterialIcons
            name="edit"
            size={20}
            color={theme.colors.outline}
            style={styles.editButton as ViewStyle}
          />
        </View>
        <View style={styles.priceRow as ViewStyle}>
          <Text style={styles.priceBs as TextStyle}>
            Bs. {item.priceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.priceUsd as TextStyle}>
            ${item.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </Text>
        </View>
      </View>
    </View>
  )
}
