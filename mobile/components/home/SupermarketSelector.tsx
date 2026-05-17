import { View, Text, TextInput, Animated, type ViewStyle, type TextStyle } from 'react-native';
import { useAppTheme } from '../../styles/theme';
import { createHomeStyles } from '../../styles/homeStyles';
import { SupermarketCarousel } from './SupermarketCarousel';
import type { SupermarketOption } from '../../services/supermarketService';

interface SupermarketSelectorProps {
  supermarkets: SupermarketOption[];
  customMarketName: string;
  fieldErrors: Record<string, string>;
  renderCustomMarket: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onSupermarketSelect: (id: string) => void;
  onCustomMarketChange: (text: string) => void;
}

export function SupermarketSelector({
  supermarkets,
  customMarketName,
  fieldErrors,
  renderCustomMarket,
  fadeAnim,
  slideAnim,
  onSupermarketSelect,
  onCustomMarketChange,
}: SupermarketSelectorProps) {
  const theme = useAppTheme();
  const styles = createHomeStyles(theme);

  return (
    <View>
      <Text style={styles.supermarketLabel}>Supermercado</Text>
      <SupermarketCarousel supermarkets={supermarkets} onSelect={onSupermarketSelect} />

      {renderCustomMarket ? (
        <Animated.View
          style={[
            styles.customMarketContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={{ gap: theme.spacing.xs }}>
            <Text style={styles.supermarketLabel}>Nombre del Supermercado</Text>
            <TextInput
              style={[styles.customMarketInput, fieldErrors.customMarketName && styles.errorBorder]}
              placeholder="Ej. Plan Suarez"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={customMarketName}
              onChangeText={onCustomMarketChange}
            />
            {fieldErrors.customMarketName ? (
              <Text style={styles.errorText as TextStyle}>{fieldErrors.customMarketName}</Text>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
