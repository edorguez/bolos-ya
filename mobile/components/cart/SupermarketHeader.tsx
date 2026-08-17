import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { getCartIcon, getCartColorKey } from '../../utils/iconUtils';

interface SupermarketHeaderProps {
  cartId: string;
  supermarket: string;
  productCount: number;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  logoContainer: {
    width: theme.sizes.iconButton,
    height: theme.sizes.iconButton,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.onSurface,
    letterSpacing: theme.typography.letterSpacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: '500',
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
}));

export function SupermarketHeader({ cartId, supermarket, productCount }: SupermarketHeaderProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const icon = getCartIcon(cartId);
  const colorKey = getCartColorKey(cartId) as keyof typeof theme.colors;
  const iconColor = theme.colors[colorKey];

  return (
    <View style={styles.container as ViewStyle}>
      <View style={[styles.logoContainer as ViewStyle, { backgroundColor: iconColor + '20' }]}>
        <MaterialIcons
          name={icon as keyof typeof MaterialIcons.glyphMap}
          size={theme.iconSize.md}
          color={iconColor}
        />
      </View>
      <View style={styles.textContainer as ViewStyle}>
        <Text style={styles.title as TextStyle}>{supermarket}</Text>
        <Text style={styles.subtitle as TextStyle}>Carrito Activo • {productCount} productos</Text>
      </View>
    </View>
  );
}
