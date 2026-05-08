import { View, Text, Image, type ViewStyle, type TextStyle, type ImageStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

interface SupermarketHeaderProps {
  supermarket: string;
  itemCount: number;
  logoUrl?: string;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceContainer,
    overflow: 'hidden',
    flexShrink: 0,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    letterSpacing: -0.25,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
}));

export function SupermarketHeader({ supermarket, itemCount, logoUrl }: SupermarketHeaderProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const defaultLogoUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAqxgdfttwxFbmt1ckbVGF1PkfkEYc4Kf6O3JxGJHloxrtwLzANfhp15Ob4x3-AWD6UHcWyxSV5Lz1KIjx8I_ueYx8UlnQIfOXxYpyAYSdgDsR51-_EN9Bk7ABbjtvRSCavXV6OPqVF3svzT0dtV1omMxdoWxXw-UwzYrmLSjDcXr0CPhQrfTMJGixzwNwElAv7iplTVtaOgVcELaBjvfkJZf6G8O2PKz3t2Bn0vcyZADhJVe1iGetqm_wQwd8J7mkZ2voL3k-k-VxG';

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.logoContainer as ViewStyle}>
        <Image source={{ uri: logoUrl || defaultLogoUrl }} style={styles.logo as ImageStyle} />
      </View>
      <View style={styles.textContainer as ViewStyle}>
        <Text style={styles.title as TextStyle}>{supermarket}</Text>
        <Text style={styles.subtitle as TextStyle}>Carrito Activo • {itemCount} productos</Text>
      </View>
    </View>
  );
}
