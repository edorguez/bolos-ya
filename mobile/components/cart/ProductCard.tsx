import { memo, useCallback } from 'react';
import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { createCardStyles } from '../../styles/cards';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ProductCardProps {
  id: string;
  name: string;
  priceBs: number;
  priceUsd: number;
  quantity: number;
  productImageUrl?: string;
  cartId: string;
  onMenuPress: (productId: string) => void;
  onQuantityChange?: (productId: string, newQuantity: number) => void;
}

const stylesheet = StyleSheet.create(theme => {
  const cardStyles = createCardStyles(theme);
  return {
    card: {
      ...cardStyles.base,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    iconContainer: {
      width: theme.sizes.productIcon,
      height: theme.sizes.productIcon,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary + '0D',
      borderWidth: 1,
      borderColor: theme.colors.primary + '1A',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
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
      fontSize: theme.typography.fontSize.xxs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
    },
    priceUsd: {
      fontSize: theme.typography.fontSize.xxs,
      color: theme.colors.primaryText,
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
      width: theme.sizes.quantityButton,
      height: theme.sizes.quantityButton,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceContainerLowest,
    },
    quantityButtonPressed: {
      transform: [{ scale: 1.1 }],
      backgroundColor: theme.colors.surfaceContainerHigh,
    },
    quantityText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      minWidth: theme.sizes.logo,
      textAlign: 'center',
    },
  };
});

function ProductCardComponent({
  id,
  name,
  priceBs,
  priceUsd,
  quantity,
  cartId: _cartId,
  onMenuPress,
  onQuantityChange,
}: ProductCardProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const handleDecrease = useCallback(() => {
    if (quantity <= 1 || !onQuantityChange) return;
    onQuantityChange(id, quantity - 1);
  }, [id, quantity, onQuantityChange]);

  const handleIncrease = useCallback(() => {
    if (quantity >= 9999 || !onQuantityChange) return;
    onQuantityChange(id, quantity + 1);
  }, [id, quantity, onQuantityChange]);

  const handleMenu = useCallback(() => {
    onMenuPress(id);
  }, [id, onMenuPress]);

  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.iconContainer as ViewStyle}>
        <MaterialIcons
          name="shopping-basket"
          size={theme.iconSize.xl}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.content as ViewStyle}>
        <View style={styles.header as ViewStyle}>
          <View style={styles.leftColumn as ViewStyle}>
            <Text style={styles.title as TextStyle}>{name}</Text>
            <View style={styles.quantityRow as ViewStyle}>
              <View style={styles.quantityControls as ViewStyle}>
                <Pressable
                  onPress={handleDecrease}
                  style={({ pressed }) => [
                    styles.quantityButton as ViewStyle,
                    pressed && (styles.quantityButtonPressed as ViewStyle),
                  ]}
                >
                  <MaterialIcons
                    name="remove"
                    size={theme.iconSize.sm}
                    color={theme.colors.primaryText}
                  />
                </Pressable>
                <Text style={styles.quantityText as TextStyle}>{quantity}</Text>
                <Pressable
                  onPress={handleIncrease}
                  style={({ pressed }) => [
                    styles.quantityButton as ViewStyle,
                    pressed && (styles.quantityButtonPressed as ViewStyle),
                  ]}
                >
                  <MaterialIcons
                    name="add"
                    size={theme.iconSize.sm}
                    color={theme.colors.primaryText}
                  />
                </Pressable>
              </View>
            </View>
          </View>
          <View style={styles.rightColumn as ViewStyle}>
            <Pressable
              onPress={handleMenu}
              style={({ pressed }) => [styles.menuButton as ViewStyle, pressed && { opacity: 0.7 }]}
            >
              <MaterialIcons
                name="more-horiz"
                size={theme.iconSize.md}
                color={theme.colors.onSurfaceVariant}
              />
            </Pressable>
            <View style={styles.priceColumn as ViewStyle}>
              <Text style={styles.priceBs as TextStyle}>
                Bs. {priceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.priceUsd as TextStyle}>
                $ {priceUsd.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export const ProductCard = memo(ProductCardComponent);
