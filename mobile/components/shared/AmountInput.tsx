import { forwardRef, useRef, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, type TextStyle } from 'react-native';
import CurrencyInput, { formatNumber } from 'react-native-currency-input';
import { useAppTheme } from '../../styles/theme';

interface AmountInputProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  placeholder?: string;
  error?: boolean;
  editable?: boolean;
  style?: any;
}

export const AmountInput = forwardRef<TextInput, AmountInputProps>(function AmountInput(
  { value, onValueChange, placeholder, error, editable = true, style },
  ref
) {
  const theme = useAppTheme();
  const inputRef = useRef<TextInput>(null);

  const handlePress = useCallback(() => {
    if (editable) {
      inputRef.current?.focus();
    }
  }, [editable]);

  const flatStyle = StyleSheet.flatten(style) as TextStyle || {};
  const textStyle: TextStyle = {
    fontSize: flatStyle?.fontSize,
    color: flatStyle?.color,
    fontWeight: flatStyle?.fontWeight,
    letterSpacing: flatStyle?.letterSpacing,
    textAlign: 'right',
  };

  const displayValue = value != null
    ? formatNumber(value, { delimiter: '.', separator: ',', precision: 2 })
    : '';

  return (
    <Pressable onPress={handlePress} style={{ flex: 1 }}>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            backgroundColor: theme.colors.surfaceContainerLow,
            borderWidth: 1,
            borderColor: error ? theme.colors.error : theme.colors.stoneSurface,
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.sm,
          },
          flatStyle as any,
          error && { borderColor: theme.colors.error },
        ]}
      >
        <CurrencyInput
          ref={inputRef}
          value={value}
          onChangeValue={onValueChange}
          delimiter="."
          separator=","
          precision={2}
          editable={editable}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
        />
        <Text style={[textStyle, !value && { color: theme.colors.ash }]}>
          {displayValue || placeholder || '0,00'}
        </Text>
      </View>
    </Pressable>
  );
});