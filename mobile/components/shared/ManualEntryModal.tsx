import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useAppTheme } from '../../styles/theme';
import { createManualEntryModalStyles } from '../../styles/manualEntryModalStyles';
import { AmountInput } from './AmountInput';
import { parseAmountInput } from '../../utils/amountUtils';
import { useBCV } from '../../store/bcvStore';
import { MaterialIcons } from '@expo/vector-icons';

interface ManualEntryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (name: string, priceBs: number, priceUsd: number, priceBcv: number, quantity: number) => void;
}

export function ManualEntryModal({ isVisible, onClose, onSubmit }: ManualEntryModalProps) {
  const theme = useAppTheme();
  const styles = createManualEntryModalStyles(theme);
  const { rate: exchangeRate } = useBCV();
  const EXCHANGE_RATE = exchangeRate?.usdRate ?? 55;

  const [name, setName] = useState('');
  const [topCurrency, setTopCurrency] = useState<'BS' | 'USD'>('BS');
  const [bsRawDigits, setBsRawDigits] = useState('');
  const [usdRawDigits, setUsdRawDigits] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

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
    setError(null);

    if (!name.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }

    if (!exchangeRate) {
      setError('Tasa de cambio no disponible. Verifica tu conexión.');
      return;
    }

    const priceBs = isBsEditable
      ? parseAmountInput(bsRawDigits)
      : parseAmountInput(usdRawDigits) * EXCHANGE_RATE;

    const priceUsd = isBsEditable
      ? parseAmountInput(bsRawDigits) / EXCHANGE_RATE
      : parseAmountInput(usdRawDigits);

    if (priceBs <= 0 && priceUsd <= 0) {
      setError('Ingresa un precio válido');
      return;
    }

    if (priceBs < 0 || priceUsd < 0) {
      setError('Precio inválido');
      return;
    }

    onSubmit(name.trim().slice(0, 100), priceBs, priceUsd, exchangeRate.usdRate, quantity);
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
              maxLength={100}
            />
          </View>

          <View style={styles.quantitySection as ViewStyle}>
            <Text style={styles.label as TextStyle}>Cantidad</Text>
            <View style={styles.quantityControls as ViewStyle}>
              <Pressable
                style={({ pressed }) => [
                  styles.quantityButton as ViewStyle,
                  { backgroundColor: theme.colors.surfaceContainerHigh },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={decrementQuantity}
              >
                <MaterialIcons name="remove" size={24} color={theme.colors.primary} />
              </Pressable>
              <Text style={styles.quantityNumber as TextStyle}>{quantity}</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.quantityButton as ViewStyle,
                  { backgroundColor: theme.colors.primary },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={incrementQuantity}
              >
                <MaterialIcons name="add" size={24} color={theme.colors.white} />
              </Pressable>
            </View>
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
          {error && (
            <Text style={styles.errorText as TextStyle}>{error}</Text>
          )}

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
