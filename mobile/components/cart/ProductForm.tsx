import {
  View,
  Text,
  TextInput,
  Pressable,
  type ViewStyle,
  type TextStyle,
  LayoutAnimation,
} from 'react-native'
import { useState, useEffect } from 'react'
import { useAppTheme } from '../../styles/theme'
import { Button } from '../Button'
import { MaterialIcons } from '@expo/vector-icons'
import { createProductFormStyles } from '../../styles/productFormStyles'

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
  initialData?: {
    name: string
    priceBs: number
    priceUsd: number
    quantity: number
    supermarket: string
  }
}

const EXCHANGE_RATE = 475.7 // Mock exchange rate: 4000 Bs = 109 USD

export function ProductForm({ onSubmit, supermarket, onCancel, initialData }: ProductFormProps) {
  const theme = useAppTheme()
  const styles = createProductFormStyles(theme)

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [bsPrice, setBsPrice] = useState('')
  const [usdPrice, setUsdPrice] = useState('')
  const [topCurrency, setTopCurrency] = useState<'BS' | 'USD'>('BS')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const bsEditable = topCurrency === 'BS'

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

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setQuantity(initialData.quantity)
      setBsPrice(initialData.priceBs.toFixed(2))
      setUsdPrice(initialData.priceUsd.toFixed(2))
      setTopCurrency('BS')
      setErrors({})
    }
  }, [initialData])

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setTopCurrency(prev => (prev === 'BS' ? 'USD' : 'BS'))
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
    setTopCurrency('BS')
    setErrors({})
  }

  const getSyncIconColor = () => {
    return bsEditable ? theme.colors.primary : theme.colors.primary
  }

  const buttonTitle = initialData ? 'Editar Producto' : 'Agregar Producto'

  return (
    <View style={styles.container as ViewStyle}>
      {/* Illustration Row */}
      <View style={styles.illustrationRow as ViewStyle}>
        <View style={styles.iconContainer as ViewStyle}>
          <MaterialIcons
            name="shopping-bag"
            size={36}
            color={theme.colors.secondary}
            style={styles.icon as TextStyle}
          />
        </View>
        <View>
          <Text style={styles.title as TextStyle}>Detalles del Producto</Text>
          <Text style={styles.subtitle as TextStyle}>Ingresa la información para tu carrito</Text>
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
      <View style={styles.inputGroup as ViewStyle}>
        <Text style={styles.label as TextStyle}>Cantidad</Text>
        <View style={styles.quantitySection as ViewStyle}>
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
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Currency Inputs */}
      <View>
        {topCurrency === 'BS' ? (
          <>
            {/* BS Input (Top) */}
            <View style={styles.priceInputContainer as ViewStyle}>
              <Text style={styles.label as TextStyle}>Precio en Bolívares (Bs.)</Text>
              <View style={styles.priceInputWrapper as ViewStyle}>
                <TextInput
                  style={styles.priceInput as TextStyle}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={bsPrice}
                  onChangeText={handleBsPriceChange}
                  keyboardType="numeric"
                  editable={true}
                />
                <Text style={styles.currencySymbol as TextStyle}>Bs.</Text>
              </View>
              {errors.bsPrice && (
                <Text style={styles.errorText as TextStyle}>{errors.bsPrice}</Text>
              )}
            </View>

            {/* Sync Icon */}
            <View style={styles.syncContainer as ViewStyle}>
              <Pressable
                style={({ pressed }) => [
                  styles.syncButton as ViewStyle,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={toggleEditableCurrency}
              >
                <MaterialIcons
                  name="swap-vert"
                  size={20}
                  color={getSyncIconColor()}
                  style={{ transform: [{ rotate: '0deg' }] }}
                />
              </Pressable>
            </View>

            {/* USD Input (Bottom) */}
            <View style={styles.priceInputContainer as ViewStyle}>
              <Text style={styles.label as TextStyle}>Precio en Dólares ($)</Text>
              <View style={styles.priceInputWrapper as ViewStyle}>
                <TextInput
                  style={[styles.priceInput as TextStyle, { color: theme.colors.onSurfaceVariant }]}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={usdPrice}
                  onChangeText={handleUsdPriceChange}
                  keyboardType="numeric"
                  editable={false}
                />
                <Text style={styles.currencySymbol as TextStyle}>$</Text>
              </View>
              {errors.usdPrice && (
                <Text style={styles.errorText as TextStyle}>{errors.usdPrice}</Text>
              )}
            </View>
          </>
        ) : (
          <>
            {/* USD Input (Top) */}
            <View style={styles.priceInputContainer as ViewStyle}>
              <Text style={styles.label as TextStyle}>Precio en Dólares ($)</Text>
              <View style={styles.priceInputWrapper as ViewStyle}>
                <TextInput
                  style={styles.priceInput as TextStyle}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={usdPrice}
                  onChangeText={handleUsdPriceChange}
                  keyboardType="numeric"
                  editable={true}
                />
                <Text style={styles.currencySymbol as TextStyle}>$</Text>
              </View>
              {errors.usdPrice && (
                <Text style={styles.errorText as TextStyle}>{errors.usdPrice}</Text>
              )}
            </View>

            {/* Sync Icon */}
            <View style={styles.syncContainer as ViewStyle}>
              <Pressable
                style={({ pressed }) => [
                  styles.syncButton as ViewStyle,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={toggleEditableCurrency}
              >
                <MaterialIcons
                  name="swap-vert"
                  size={20}
                  color={getSyncIconColor()}
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </Pressable>
            </View>

            {/* BS Input (Bottom) */}
            <View style={styles.priceInputContainer as ViewStyle}>
              <Text style={styles.label as TextStyle}>Precio en Bolívares (Bs.)</Text>
              <View style={styles.priceInputWrapper as ViewStyle}>
                <TextInput
                  style={[styles.priceInput as TextStyle, { color: theme.colors.onSurfaceVariant }]}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={bsPrice}
                  onChangeText={handleBsPriceChange}
                  keyboardType="numeric"
                  editable={false}
                />
                <Text style={styles.currencySymbol as TextStyle}>Bs.</Text>
              </View>
              {errors.bsPrice && (
                <Text style={styles.errorText as TextStyle}>{errors.bsPrice}</Text>
              )}
            </View>
          </>
        )}

        {errors.price && <Text style={styles.errorText as TextStyle}>{errors.price}</Text>}
      </View>

      {/* Action Button */}
      <View style={styles.buttonContainer as ViewStyle}>
        <Button
          title={buttonTitle}
          onPress={handleSubmit}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </View>
  )
}
