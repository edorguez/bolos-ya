import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AmountInput } from '../shared/AmountInput';
import { useAppTheme } from '../../styles/theme';
import { createHomeStyles } from '../../styles/homeStyles';

interface BudgetFieldsProps {
  topCurrency: 'BS' | 'USD';
  budgetBs: string;
  budgetUsd: string;
  fieldErrors: Record<string, string>;
  onBsChange: (text: string) => void;
  onUsdChange: (text: string) => void;
  onToggleCurrency: () => void;
}

export function BudgetFields({
  topCurrency,
  budgetBs,
  budgetUsd,
  fieldErrors,
  onBsChange,
  onUsdChange,
  onToggleCurrency,
}: BudgetFieldsProps) {
  const theme = useAppTheme();
  const styles = createHomeStyles(theme);

  const handleBsChange = (digits: string) => {
    onBsChange(digits);
  };

  const handleUsdChange = (digits: string) => {
    onUsdChange(digits);
  };

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleCurrency();
  };

  return (
    <View style={styles.budgetRow as ViewStyle}>
      <View style={styles.budgetFields as ViewStyle}>
        {topCurrency === 'BS' ? (
          <>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto Bolívares</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <AmountInput
                rawDigits={budgetBs}
                onRawDigitsChange={handleBsChange}
                placeholder="0,00"
                error={!!fieldErrors.budgetBs || !!fieldErrors.budgetUsd}
                style={styles.budgetInput as any}
              />
              <Text style={styles.budgetSymbol as TextStyle}>Bs.</Text>
            </View>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto USD</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <AmountInput
                rawDigits={budgetUsd}
                onRawDigitsChange={() => {}}
                placeholder="0,00"
                editable={false}
                style={[styles.budgetInput as any, { color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.stoneSurface }]}
              />
              <Text style={styles.budgetSymbol as TextStyle}>$</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto USD</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <AmountInput
                rawDigits={budgetUsd}
                onRawDigitsChange={handleUsdChange}
                placeholder="0,00"
                error={!!fieldErrors.budgetBs || !!fieldErrors.budgetUsd}
                style={styles.budgetInput as any}
              />
              <Text style={styles.budgetSymbol as TextStyle}>$</Text>
            </View>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto Bolívares</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <AmountInput
                rawDigits={budgetBs}
                onRawDigitsChange={() => {}}
                placeholder="0,00"
                editable={false}
                style={[styles.budgetInput as any, { color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.stoneSurface }]}
              />
              <Text style={styles.budgetSymbol as TextStyle}>Bs.</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.budgetSwapSide as ViewStyle}>
        <Pressable
          style={({ pressed }) => [
            styles.budgetSwapButton as ViewStyle,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleToggle}
        >
          <MaterialIcons
            name="swap-vert"
            size={18}
            color={theme.colors.primary}
            style={{ transform: [{ rotate: topCurrency === 'BS' ? '0deg' : '180deg' }] }}
          />
        </Pressable>
      </View>
    </View>
  );
}
