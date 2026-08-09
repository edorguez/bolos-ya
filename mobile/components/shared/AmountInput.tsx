import { forwardRef, useRef, useCallback, useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet as RNStyleSheet,
  type TextStyle,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { formatNumber } from 'react-native-currency-input';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { createInputStyles } from '../../styles/inputs';

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

const stylesheet = StyleSheet.create(theme => {
  const inputStyles = createInputStyles(theme);
  return {
    shell: {
      ...inputStyles.base,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    shellError: inputStyles.error,
    shellFocused: inputStyles.focused,
    shellReadOnly: {
      backgroundColor: theme.colors.stoneSurface,
      color: theme.colors.onSurfaceVariant,
    },
  };
});

export const AmountInput = memo(
  forwardRef<TextInput, AmountInputProps>(function AmountInput(
    { value, onValueChange, placeholder, error, editable = true, style, maxValue = MAX_DEFAULT },
    _ref
  ) {
    const theme = useAppTheme();
    const styles = stylesheet(theme);
    const inputRef = useRef<TextInput>(null);
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;

    const focusedRef = useRef(false);
    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState(() => formatAmount(value));
    const [syncKey, setSyncKey] = useState(0);

    useEffect(() => {
      if (focusedRef.current) return;
      const formatted = formatAmount(value);
      setText(formatted);
      if (inputRef.current?.setNativeProps) {
        inputRef.current.setNativeProps({ text: formatted });
      } else {
        setSyncKey(key => key + 1);
      }
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

    const flatStyle = (RNStyleSheet.flatten(style) as TextStyle) || {};

    return (
      <Pressable onPress={handlePress} style={{ flex: 1 }}>
        <View
          style={[
            styles.shell as ViewStyle,
            error && (styles.shellError as ViewStyle),
            isFocused && !error && (styles.shellFocused as ViewStyle),
            !editable && (styles.shellReadOnly as ViewStyle),
            flatStyle as ViewStyle,
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
              setIsFocused(true);
            }}
            onBlur={() => {
              focusedRef.current = false;
              setIsFocused(false);
            }}
            editable={editable}
            caretHidden
            importantForAutofill="no"
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
          />
          <Text
            style={[
              {
                fontSize: theme.typography.fontSize.sm,
                color: editable ? theme.colors.text : theme.colors.onSurfaceVariant,
                textAlign: 'right',
              },
              !value && { color: theme.colors.ash },
            ]}
          >
            {text || placeholder || '0,00'}
          </Text>
        </View>
      </Pressable>
    );
  })
);
