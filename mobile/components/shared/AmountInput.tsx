import { forwardRef, useRef, useCallback, useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { formatNumber } from 'react-native-currency-input';
import { useAppTheme } from '../../styles/theme';

interface AmountInputProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  placeholder?: string;
  error?: boolean;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  maxValue?: number;
}

const MAX_DEFAULT = 999_999_999_999.99;
const PRECISION = 2;

const FORMAT_OPTIONS = { delimiter: '.', separator: ',', precision: PRECISION } as const;

const formatAmount = (value: number | null): string =>
  value != null ? formatNumber(value, FORMAT_OPTIONS) : '';

const parseAmount = (raw: string): number | null => {
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return null;
  return Number(digits) / 10 ** PRECISION;
};

export const AmountInput = memo(
  forwardRef<TextInput, AmountInputProps>(function AmountInput(
    { value, onValueChange, placeholder, error, editable = true, style, maxValue = MAX_DEFAULT },
    _ref
  ) {
    const theme = useAppTheme();
    const inputRef = useRef<TextInput>(null);
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;

    const focusedRef = useRef(false);
    const [text, setText] = useState(() => formatAmount(value));
    const [syncKey, setSyncKey] = useState(0);

    useEffect(() => {
      if (focusedRef.current) return;
      setText(formatAmount(value));
      setSyncKey(key => key + 1);
    }, [value]);

    const handleChangeText = useCallback(
      (raw: string) => {
        const nextValue = parseAmount(raw);
        if (nextValue != null && nextValue > maxValue) return;
        setText(formatAmount(nextValue));
        onValueChangeRef.current(nextValue);
      },
      [maxValue]
    );

    const handlePress = useCallback(() => {
      if (editable) {
        inputRef.current?.focus();
      }
    }, [editable]);

    const flatStyle = (StyleSheet.flatten(style) as TextStyle) || {};
    const textStyle: TextStyle = {
      fontSize: flatStyle?.fontSize,
      color: flatStyle?.color,
      fontWeight: flatStyle?.fontWeight,
      letterSpacing: flatStyle?.letterSpacing,
      textAlign: 'right',
    };

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
            flatStyle as ViewStyle,
            error && { borderColor: theme.colors.error },
          ]}
        >
          <TextInput
            key={syncKey}
            ref={inputRef}
            keyboardType="numeric"
            defaultValue={formatAmount(value)}
            onChangeText={handleChangeText}
            onFocus={() => {
              focusedRef.current = true;
            }}
            onBlur={() => {
              focusedRef.current = false;
            }}
            editable={editable}
            caretHidden
            importantForAutofill="no"
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
          />
          <Text style={[textStyle, !value && { color: theme.colors.ash }]}>
            {text || placeholder || '0,00'}
          </Text>
        </View>
      </Pressable>
    );
  })
);
