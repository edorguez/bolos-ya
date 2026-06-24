import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  Dimensions,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { AmountInput } from './AmountInput';
import { parseAmountInput } from '../../utils/amountUtils';
import { useBCV } from '../../store/bcvStore';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);

interface ManualEntryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (name: string, priceBs: number, priceUsd: number) => void;
}

const stylesheet = StyleSheet.create(theme => ({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginBottom: theme.spacing.xxl,
  },
  modalContent: {
    width: MODAL_WIDTH,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    gap: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.emberOrange,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-end',
  },
  priceInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  priceInput: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'right',
  },
  currencyToggle: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.stoneSurface,
    minWidth: 60,
    alignItems: 'center',
  },
  currencyToggleActive: {
    backgroundColor: theme.colors.midnight,
  },
  currencyToggleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurfaceVariant,
  },
  currencyToggleTextActive: {
    color: theme.colors.white,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.xxs,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurfaceVariant,
  },
  addButton: {
    flex: 1,
    backgroundColor: theme.colors.midnight,
    borderRadius: theme.borderRadius.button,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
}));

export function ManualEntryModal({ isVisible, onClose, onSubmit }: ManualEntryModalProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const { rate: exchangeRate } = useBCV();
  const EXCHANGE_RATE = exchangeRate?.usdRate ?? 55;

  const [name, setName] = useState('');
  const [topCurrency, setTopCurrency] = useState<'BS' | 'USD'>('BS');
  const [bsRawDigits, setBsRawDigits] = useState('');
  const [usdRawDigits, setUsdRawDigits] = useState('');

  const isBsEditable = topCurrency === 'BS';

  const handleBsChange = (digits: string) => {
    setBsRawDigits(digits);
    if (digits.length > 0) {
      const bsValue = parseAmountInput(digits);
      setUsdRawDigits(String(Math.round((bsValue / EXCHANGE_RATE) * 100)));
    } else {
      setUsdRawDigits('');
    }
  };

  const handleUsdChange = (digits: string) => {
    setUsdRawDigits(digits);
    if (digits.length > 0) {
      const usdValue = parseAmountInput(digits);
      setBsRawDigits(String(Math.round(usdValue * EXCHANGE_RATE * 100)));
    } else {
      setBsRawDigits('');
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const priceBs = isBsEditable
      ? parseAmountInput(bsRawDigits)
      : parseAmountInput(usdRawDigits) * EXCHANGE_RATE;

    const priceUsd = isBsEditable
      ? parseAmountInput(bsRawDigits) / EXCHANGE_RATE
      : parseAmountInput(usdRawDigits);

    if (priceBs <= 0 && priceUsd <= 0) return;

    onSubmit(name.trim(), priceBs, priceUsd);
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalContainer as ViewStyle} onPress={onClose}>
        <Pressable style={styles.modalContent as ViewStyle} onPress={e => e.stopPropagation()}>
          <Text style={styles.headerTitle as TextStyle}>Ingreso Manual</Text>

          <View style={styles.inputGroup as ViewStyle}>
            <Text style={styles.label as TextStyle}>Nombre del Producto</Text>
            <TextInput
              style={styles.textInput as TextStyle}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Harina Pan"
              placeholderTextColor={theme.colors.ash}
            />
          </View>

          <View style={styles.inputGroup as ViewStyle}>
            <Text style={styles.label as TextStyle}>Precio</Text>
            <View style={styles.priceRow as ViewStyle}>
              <View style={styles.priceInputWrapper as ViewStyle}>
                <AmountInput
                  rawDigits={isBsEditable ? bsRawDigits : usdRawDigits}
                  onRawDigitsChange={isBsEditable ? handleBsChange : handleUsdChange}
                  placeholder={isBsEditable ? 'Bs. 0,00' : '$ 0,00'}
                  style={styles.priceInput as TextStyle}
                />
              </View>
              <Pressable
                style={[
                  styles.currencyToggle as ViewStyle,
                  styles.currencyToggleActive as ViewStyle,
                ]}
                onPress={() => setTopCurrency(current => (current === 'BS' ? 'USD' : 'BS'))}
              >
                <Text
                  style={[
                    styles.currencyToggleText as TextStyle,
                    styles.currencyToggleTextActive as TextStyle,
                  ]}
                >
                  {topCurrency}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.actionRow as ViewStyle}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton as ViewStyle,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText as TextStyle}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.addButton as ViewStyle, pressed && { opacity: 0.8 }]}
              onPress={handleSubmit}
            >
              <MaterialIcons name="add-circle" size={20} color={theme.colors.white} />
              <Text style={styles.addButtonText as TextStyle}>Añadir</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
