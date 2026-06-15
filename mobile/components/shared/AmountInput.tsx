import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { formatAmountInput, sanitizeAmountInput } from '../../utils/amountUtils';
import { useAppTheme } from '../../styles/theme';

interface AmountInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  rawDigits: string;
  onRawDigitsChange: (digits: string) => void;
  error?: boolean;
}

export const AmountInput = forwardRef<TextInput, AmountInputProps>(function AmountInput(
  { rawDigits, onRawDigitsChange, placeholder, error, style, ...rest },
  ref
) {
  const theme = useAppTheme();

  return (
    <TextInput
      ref={ref}
      value={formatAmountInput(rawDigits)}
      onChangeText={text => onRawDigitsChange(sanitizeAmountInput(text))}
      keyboardType="number-pad"
      placeholder={placeholder}
      placeholderTextColor={theme.colors.ash}
      style={[style, error && { borderColor: theme.colors.error }]}
      {...rest}
    />
  );
});
