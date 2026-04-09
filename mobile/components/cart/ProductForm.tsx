import { View, Text, TextInput, Pressable, type ViewStyle, type TextStyle } from 'react-native'
import { useState, useEffect } from 'react'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { Button } from '../Button'

interface ProductFormProps {
  onSubmit: (product: {
    name: string
    priceBs: number
    priceUsd: number
    quantity: number
    supermarket: string
  }) => void
  supermarket: string
  onCancel?: () => void
}

const EXCHANGE_RATE = 36.7 // Mock exchange rate: 4000 Bs = 109 USD

const stylesheet = StyleSheet.create(theme => ({
  container: {
    gap: theme.spacing.xl,
  },
  illustrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: theme.colors.secondary,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.onSurfaceVariant,
    marginTop: theme.spacing.xs,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
    marginLeft: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 0,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.onSurface,
    fontWeight: theme.typography.fontWeight.bold,
  },
  quantitySection: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
  },
  quantityValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '800',
    minWidth: 32,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priceInputContainer: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  priceInputWrapper: {
    position: 'relative',
  },
  priceInput: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 0,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xl,
    paddingLeft: 60, // Space for currency symbol
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.onSurface,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'right',
  },
  currencySymbol: {
    position: 'absolute',
    left: theme.spacing.xl,
    top: '50%',
    transform: [{ translateY: -10 }], // Half of font size
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurfaceVariant,
  },
  syncContainer: {
    paddingTop: theme.spacing.lg,
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
}))

export function ProductForm({ onSubmit, supermarket, onCancel }: ProductFormProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [bsPrice, setBsPrice] = useState('')
  const [usdPrice, setUsdPrice] = useState('')
  const [bsEditable, setBsEditable] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update USD price when Bs price changes and Bs is editable
  useEffect(() => {
    if (bsEditable && bsPrice) {
      const bsValue = parseFloat(bsPrice)
      if (!isNaN(bsValue)) {
        const usdValue = bsValue / EXCHANGE_RATE
        setUsdPrice(usdValue.toFixed(2))
      } else {
        setUsdPrice('')
      }
    }
  }, [bsPrice, bsEditable])

  // Update Bs price when USD price changes and USD is editable
  useEffect(() => {
    if (!bsEditable && usdPrice) {
      const usdValue = parseFloat(usdPrice)
      if (!isNaN(usdValue)) {
        const bsValue = usdValue * EXCHANGE_RATE
        setBsPrice(bsValue.toFixed(2))
      } else {
        setBsPrice('')
      }
    }
  }, [usdPrice, bsEditable])

  const handleBsPriceChange = (text: string) => {
    // Allow empty string, numbers, and single decimal point
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setBsPrice(text)
      setErrors(prev => ({ ...prev, bsPrice: '' }))
    }
  }

  const handleUsdPriceChange = (text: string) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setUsdPrice(text)
      setErrors(prev => ({ ...prev, usdPrice: '' }))
    }
  }

  const toggleEditableCurrency = () => {
    setBsEditable(!bsEditable)
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'El nombre del producto es requerido'
    }

    const bsValue = parseFloat(bsPrice)
    const usdValue = parseFloat(usdPrice)

    if (isNaN(bsValue) && isNaN(usdValue)) {
      newErrors.price = 'Ingresa un precio en Bs. o USD'
    } else if (bsEditable && (isNaN(bsValue) || bsValue <= 0)) {
      newErrors.bsPrice = 'Ingresa un precio válido mayor a 0'
    } else if (!bsEditable && (isNaN(usdValue) || usdValue <= 0)) {
      newErrors.usdPrice = 'Ingresa un precio válido mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const bsValue = parseFloat(bsPrice)
    const usdValue = parseFloat(usdPrice)

    // Calculate the other currency if one is missing
    let finalBs = bsValue
    let finalUsd = usdValue

    if (isNaN(finalBs) && !isNaN(finalUsd)) {
      finalBs = finalUsd * EXCHANGE_RATE
    } else if (isNaN(finalUsd) && !isNaN(finalBs)) {
      finalUsd = finalBs / EXCHANGE_RATE
    }

    onSubmit({
      name: name.trim(),
      priceBs: finalBs,
      priceUsd: finalUsd,
      quantity,
      supermarket,
    })

    // Reset form
    setName('')
    setQuantity(1)
    setBsPrice('')
    setUsdPrice('')
    setBsEditable(true)
    setErrors({})
  }

  const getSyncIconColor = () => {
    return bsEditable ? theme.colors.primary : theme.colors.primary
  }

  return (
    <View style={styles.container as ViewStyle}>
      {/* Illustration Row */}
      <View style={styles.illustrationRow as ViewStyle}>
        <View style={styles.iconContainer as ViewStyle}>
          <MaterialIcons
            name="inventory_2"
            size={36}
            color={theme.colors.secondary}
            style={styles.icon as TextStyle}
          />
        </View>
        <View>
          <Text style={styles.title as TextStyle}>Detalles del Producto</Text>
          <Text style={styles.subtitle as TextStyle}>Ingresa la información para tu libreta</Text>
        </View>
      </View>

      {/* Product Name Input */}
      <View style={styles.inputGroup as ViewStyle}>
        <Text style={styles.label as TextStyle}>Nombre del Producto</Text>
        <TextInput
          style={styles.textInput as TextStyle}
          placeholder="Ej. Harina Pan 1kg"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={name}
          onChangeText={text => {
            setName(text)
            setErrors(prev => ({ ...prev, name: '' }))
          }}
        />
        {errors.name && <Text style={styles.errorText as TextStyle}>{errors.name}</Text>}
      </View>

      {/* Quantity Section */}
      <View style={styles.quantitySection as ViewStyle}>
        <View>
          <Text style={styles.quantityLabel as TextStyle}>Cantidad</Text>
          <Text style={styles.quantityValue as TextStyle}>Unidades en carro</Text>
        </View>
        <View style={styles.quantityControls as ViewStyle}>
          <Pressable
            style={[
              styles.quantityButton as ViewStyle,
              { backgroundColor: theme.colors.surfaceContainerHigh },
            ]}
            onPress={decrementQuantity}
          >
            <MaterialIcons name="remove" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={styles.quantityNumber as TextStyle}>{quantity}</Text>
          <Pressable
            style={[styles.quantityButton as ViewStyle, { backgroundColor: theme.colors.primary }]}
            onPress={incrementQuantity}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Price Conversion Row */}
      <View style={styles.priceRow as ViewStyle}>
        {/* Bs Input */}
        <View style={styles.priceInputContainer as ViewStyle}>
          <Text style={styles.label as TextStyle}>Precio en Bolívares (Bs.)</Text>
          <View style={styles.priceInputWrapper as ViewStyle}>
            <TextInput
              style={[
                styles.priceInput as TextStyle,
                !bsEditable && { color: theme.colors.onSurfaceVariant },
              ]}
              placeholder="0.00"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={bsPrice}
              onChangeText={handleBsPriceChange}
              keyboardType="numeric"
              editable={bsEditable}
            />
            <Text style={styles.currencySymbol as TextStyle}>Bs.</Text>
          </View>
          {errors.bsPrice && <Text style={styles.errorText as TextStyle}>{errors.bsPrice}</Text>}
        </View>

        {/* Sync Icon */}
        <View style={styles.syncContainer as ViewStyle}>
          <Pressable style={styles.syncButton as ViewStyle} onPress={toggleEditableCurrency}>
            <MaterialIcons
              name="sync_alt"
              size={20}
              color={getSyncIconColor()}
              style={{ transform: [{ rotate: bsEditable ? '0deg' : '180deg' }] }}
            />
          </Pressable>
        </View>

        {/* USD Input */}
        <View style={styles.priceInputContainer as ViewStyle}>
          <Text style={[styles.label as TextStyle, { textAlign: 'right' }]}>
            Precio en Dólares ($)
          </Text>
          <View style={styles.priceInputWrapper as ViewStyle}>
            <TextInput
              style={[
                styles.priceInput as TextStyle,
                bsEditable && { color: theme.colors.onSurfaceVariant },
              ]}
              placeholder="0.00"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={usdPrice}
              onChangeText={handleUsdPriceChange}
              keyboardType="numeric"
              editable={!bsEditable}
            />
            <Text style={styles.currencySymbol as TextStyle}>$</Text>
          </View>
          {errors.usdPrice && <Text style={styles.errorText as TextStyle}>{errors.usdPrice}</Text>}
        </View>
      </View>

      {errors.price && <Text style={styles.errorText as TextStyle}>{errors.price}</Text>}

      {/* Action Button */}
      <Button
        title="Agregar Producto"
        onPress={handleSubmit}
        variant="primary"
        size="large"
        fullWidth
      />
    </View>
  )
}
