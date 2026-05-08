import {
  View,
  Text,
  Image,
  Pressable,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { CartItem, useCartStore } from '../../store/cartStore';
import { MaterialIcons } from '@expo/vector-icons';

interface ProductCardProps {
  item: CartItem;
  cartId: string;
  onMenuPress: () => void;
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
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
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurface,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    paddingRight: theme.spacing.xs,
  },
  leftColumn: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  menuButton: {
    padding: theme.spacing.xxs,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.sm,
  },
  quantityRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceColumn: {
    flexDirection: 'column',
    gap: 1,
    alignItems: 'flex-end',
  },
  priceBs: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurface,
  },
  priceUsd: {
    fontSize: theme.typography.fontSize.xxs,
    color: theme.colors.onSurfaceVariant,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    gap: theme.spacing.md,
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
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurface,
    minWidth: 20,
    textAlign: 'center',
  },
}));

export function ProductCard({ item, cartId, onMenuPress }: ProductCardProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const { updateItemQuantity, removeItemFromCart } = useCartStore();

  const imageUrl =
    item.productImageUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC6k9pYxNSoMVMuc_vD59UZLC-6VfJK8aEj5uGakolu4kW-WgHO5MYUzFdiz18MRHXcl5QwWKNYA3lcu3qjrcKIlEDziPD99ApevVCk68rNjpFzDoa07ZSNWGgycQ-FybsEAcp2m6XR0Xk5Eg-78cyYvv0sWlTsi2GZcEfF34On_I7yXLw0VoBA_j_lsxIrWvpr5bfk7A5EnddqyWWzX3g-uNNI-bcIAxI8UgtygDvh_GnHD_McmAhMAjay3GZCUx5DwN75OI4HM-T4';

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateItemQuantity(cartId, item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    updateItemQuantity(cartId, item.id, item.quantity + 1);
  };

  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.imageContainer as ViewStyle}>
        <Image source={{ uri: imageUrl }} style={styles.image as ImageStyle} />
      </View>
      <View style={styles.content as ViewStyle}>
        <View style={styles.header as ViewStyle}>
          <View style={styles.leftColumn as ViewStyle}>
            <Text style={styles.title as TextStyle}>{item.name}</Text>
            <View style={styles.quantityRow as ViewStyle}>
              <View style={styles.quantityControls as ViewStyle}>
                <Pressable
                  onPress={handleDecrease}
                  style={({ pressed }) => [
                    styles.quantityButton as ViewStyle,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <MaterialIcons name="remove" size={16} color={theme.colors.emberOrange} />
                </Pressable>
                <Text style={styles.quantityText as TextStyle}>{item.quantity}</Text>
                <Pressable
                  onPress={handleIncrease}
                  style={({ pressed }) => [
                    styles.quantityButton as ViewStyle,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <MaterialIcons name="add" size={16} color={theme.colors.emberOrange} />
                </Pressable>
              </View>
            </View>
          </View>
          <View style={styles.rightColumn as ViewStyle}>
            <Pressable
              onPress={onMenuPress}
              style={({ pressed }) => [styles.menuButton as ViewStyle, pressed && { opacity: 0.7 }]}
            >
              <MaterialIcons name="more-horiz" size={20} color={theme.colors.onSurfaceVariant} />
            </Pressable>
            <View style={styles.priceColumn as ViewStyle}>
              <Text style={styles.priceBs as TextStyle}>
                Bs. {item.priceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.priceUsd as TextStyle}>
                $ {item.priceUsd.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
