import {
  View,
  Text,
  TextInput,
  Pressable,
  LayoutAnimation,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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

  const handleBsChange = (text: string) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      onBsChange(text);
    }
  };

  const handleUsdChange = (text: string) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      onUsdChange(text);
    }
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
              <TextInput
                style={[
                  styles.budgetInput as TextStyle,
                  (fieldErrors.budgetBs || fieldErrors.budgetUsd) && {
                    borderColor: theme.colors.error,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={budgetBs}
                onChangeText={handleBsChange}
                keyboardType="numeric"
                editable={true}
              />
              <Text style={styles.budgetSymbol as TextStyle}>Bs.</Text>
            </View>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto USD</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <TextInput
                style={[
                  styles.budgetInput as TextStyle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={budgetUsd}
                editable={false}
              />
              <Text style={styles.budgetSymbol as TextStyle}>$</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto USD</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <TextInput
                style={[
                  styles.budgetInput as TextStyle,
                  (fieldErrors.budgetBs || fieldErrors.budgetUsd) && {
                    borderColor: theme.colors.error,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={budgetUsd}
                onChangeText={handleUsdChange}
                keyboardType="numeric"
                editable={true}
              />
              <Text style={styles.budgetSymbol as TextStyle}>$</Text>
            </View>
            <Text style={styles.budgetLabel as TextStyle}>Presupuesto Bolívares</Text>
            <View style={styles.budgetInputWrapper as ViewStyle}>
              <TextInput
                style={[
                  styles.budgetInput as TextStyle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={budgetBs}
                editable={false}
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
