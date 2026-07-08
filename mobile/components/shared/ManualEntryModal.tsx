import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  Animated,
  Keyboard,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useAppTheme } from '../../styles/theme';
import { createManualEntryModalStyles } from '../../styles/manualEntryModalStyles';
import { AmountInput } from './AmountInput';
import { useBCV } from '../../store/bcvStore';
import { MaterialIcons } from '@expo/vector-icons';

interface ManualEntryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    priceBs: number,
    priceUsd: number,
    priceBcv: number,
    quantity: number
  ) => void;
}

export function ManualEntryModal({ isVisible, onClose, onSubmit }: ManualEntryModalProps) {
  const theme = useAppTheme();
  const styles = createManualEntryModalStyles(theme);
  const { rate: exchangeRate } = useBCV();
  const EXCHANGE_RATE = exchangeRate?.usdRate ?? 55;

  const [name, setName] = useState('');
  const [topCurrency, setTopCurrency] = useState<'BS' | 'USD'>('BS');
  const [bsAmount, setBsAmount] = useState(0);
  const [usdAmount, setUsdAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const isBsEditable = topCurrency === 'BS';

  const handleBsChange = (value: number | null) => {
    const bsVal = value ?? 0;
    setBsAmount(bsVal);
    if (bsVal > 0) {
      setUsdAmount(bsVal / EXCHANGE_RATE);
    } else {
      setUsdAmount(0);
    }
  };

  const handleUsdChange = (value: number | null) => {
    const usdVal = value ?? 0;
    setUsdAmount(usdVal);
    if (usdVal > 0) {
      setBsAmount(usdVal * EXCHANGE_RATE);
    } else {
      setBsAmount(0);
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

    const priceBs = isBsEditable ? bsAmount : usdAmount * EXCHANGE_RATE;
    const priceUsd = isBsEditable ? bsAmount / EXCHANGE_RATE : usdAmount;

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

  const slideAnim = useRef(new Animated.Value(500)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const translateY = Animated.add(slideAnim, keyboardOffset);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  useEffect(() => {
    if (isVisible) {
      setName('');
      setTopCurrency('BS');
      setBsAmount(0);
      setUsdAmount(0);
      setError(null);
      setQuantity(1);
    }
  }, [isVisible]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates.height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [keyboardOffset]);

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalContainer as ViewStyle} onPress={onClose}>
        <Animated.View style={{ transform: [{ translateY }] }}>
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
                    value={isBsEditable ? bsAmount : usdAmount}
                    onValueChange={isBsEditable ? handleBsChange : handleUsdChange}
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
            {error && <Text style={styles.errorText as TextStyle}>{error}</Text>}

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
                style={({ pressed }) => [
                  styles.addButton as ViewStyle,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleSubmit}
              >
                <MaterialIcons name="add-circle" size={20} color={theme.colors.white} />
                <Text style={styles.addButtonText as TextStyle}>Añadir</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
