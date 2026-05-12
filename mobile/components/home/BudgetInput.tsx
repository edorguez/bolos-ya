import {
  View,
  Text,
  TextInput,
  TextInputProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

interface BudgetInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  currency?: string;
  inputStyle?: TextInputProps['style'];
  hasError?: boolean;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
  },
  input: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
  },
}));

export function BudgetInput({ label, currency, inputStyle, hasError, ...props }: BudgetInputProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  return (
    <View style={styles.container as ViewStyle}>
      <Text style={styles.label as TextStyle}>{label}</Text>
      <TextInput
        style={[
          styles.input as TextStyle,
          hasError && { borderColor: theme.colors.error },
          inputStyle,
        ]}
        placeholder="0.00"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        keyboardType="numeric"
        {...props}
      />
    </View>
  );
}
