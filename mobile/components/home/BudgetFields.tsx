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
  budgetBs: number;
  budgetUsd: number;
  fieldErrors: Record<string, string>;
  onBsChange: (value: number | null) => void;
  onUsdChange: (value: number | null) => void;
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
                value={budgetBs}
                onValueChange={onBsChange}
                placeholder="0,00"
                error={!!fieldErrors.budgetBs || !!fieldErrors.budgetUsd}
                style={styles.budgetInput as ViewStyle}
              />
              <Text style={styles.budgetSymbol as TextStyle}>Bs.</Text>
            </View>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto USD</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <AmountInput
                value={budgetUsd}
                onValueChange={() => {}}
                placeholder="0,00"
                editable={false}
                style={[
                  styles.budgetInput as ViewStyle,
                  {
                    color: theme.colors.onSurfaceVariant,
                    backgroundColor: theme.colors.stoneSurface,
                  } as ViewStyle,
                ]}
              />
              <Text style={styles.budgetSymbol as TextStyle}>$</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto USD</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <AmountInput
                value={budgetUsd}
                onValueChange={onUsdChange}
                placeholder="0,00"
                error={!!fieldErrors.budgetBs || !!fieldErrors.budgetUsd}
                style={styles.budgetInput as ViewStyle}
              />
              <Text style={styles.budgetSymbol as TextStyle}>$</Text>
            </View>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto Bolívares</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <AmountInput
                value={budgetBs}
                onValueChange={() => {}}
                placeholder="0,00"
                editable={false}
                style={[
                  styles.budgetInput as ViewStyle,
                  {
                    color: theme.colors.onSurfaceVariant,
                    backgroundColor: theme.colors.stoneSurface,
                  } as ViewStyle,
                ]}
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
