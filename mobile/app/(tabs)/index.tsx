import { View, Text, ScrollView, Pressable, TextInput, Animated } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { createHomeStyles } from '../../styles/homeStyles'
import { SupermarketCarousel } from '../../components/home/SupermarketCarousel'
import { BudgetInput } from '../../components/home/BudgetInput'
import { CartCard } from '../../components/home/CartCard'
import { TipCard } from '../../components/home/TipCard'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { HorizontalScrollWithIndicators } from '../../components/shared/HorizontalScrollWithIndicators'
import { useCartStore } from '../../store/cartStore'
import { useAppTheme } from '../../styles/theme'

export default function HomeTab() {
  const theme = useAppTheme()
  const styles = createHomeStyles(theme)

  const [supermarkets, setSupermarkets] = useState([
    { id: '1', name: "Plaza's", icon: 'storefront', selected: true },
    { id: '2', name: 'Gamma', icon: 'store', selected: false },
    { id: '3', name: 'Central M.', icon: 'shopping-cart', selected: false },
    { id: '4', name: 'Plan Suarez', icon: 'local-mall', selected: false },
    { id: '5', name: 'Otro', icon: 'add-circle', selected: false },
  ])
  const [budgetBs, setBudgetBs] = useState('')
  const [budgetUsd, setBudgetUsd] = useState('')
  const [customMarketName, setCustomMarketName] = useState('')
  const [showCustomMarket, setShowCustomMarket] = useState(false)
  const [renderCustomMarket, setRenderCustomMarket] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    if (showCustomMarket) {
      setRenderCustomMarket(true)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderCustomMarket(false)
      })
    }
  }, [showCustomMarket])

  const handleSupermarketSelect = (id: string) => {
    setSupermarkets(prev =>
      prev.map(s => ({
        ...s,
        selected: s.id === id,
      }))
    )
    const selected = supermarkets.find(s => s.id === id)
    if (selected?.name === 'Otro') {
      setShowCustomMarket(true)
    } else {
      setShowCustomMarket(false)
    }
  }

  const router = useRouter()
  const { addCart, setActiveCart } = useCartStore()

  const handleStartList = () => {
    const selectedSupermarket = supermarkets.find(s => s.selected)
    let supermarketName = selectedSupermarket?.name || "Plaza's"
    if (selectedSupermarket?.name === 'Otro' && customMarketName.trim()) {
      supermarketName = customMarketName.trim()
    }
    const cartName = `${supermarketName} - ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`

    const newCart = {
      name: cartName,
      supermarket: supermarketName,
      items: [],
      totalBs: 0,
      totalUsd: 0,
      budgetBs: parseFloat(budgetBs) || 0,
      budgetUsd: parseFloat(budgetUsd) || 0,
    }

    addCart(newCart)
    const cartId = Date.now().toString()
    setActiveCart(cartId)
    router.push({ pathname: '/(cart)/[id]', params: { id: cartId } })
  }

  const handleBsBudgetChange = (text: string) => {
    // Allow empty string, numbers, and single decimal point
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setBudgetBs(text)
    }
  }

  const handleUsdBudgetChange = (text: string) => {
    // Allow empty string, numbers, and single decimal point
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setBudgetUsd(text)
    }
  }

  const latestCarts = [
    {
      id: '1',
      title: 'Semana de Víveres',
      subtitle: '85% completado',
      date: '12 OCT',
      progress: 85,
      color: theme.colors.primary,
      icon: 'bakery-dining',
    },
    {
      id: '2',
      title: 'Limpieza Mensual',
      subtitle: '40% completado',
      date: '05 OCT',
      progress: 40,
      color: '#ffc456',
      icon: 'cleaning-services',
    },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MercadoLibreta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.card}>
            <View>
              <Text style={styles.supermarketLabel}>Supermercado</Text>
              <SupermarketCarousel supermarkets={supermarkets} onSelect={handleSupermarketSelect} />

              {renderCustomMarket && (
                <Animated.View
                  style={[
                    styles.customMarketContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <View style={{ gap: theme.spacing.xs }}>
                    <Text style={styles.supermarketLabel}>Nombre del Supermercado</Text>
                    <TextInput
                      style={styles.customMarketInput}
                      placeholder="Ej. Plan Suarez"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      value={customMarketName}
                      onChangeText={setCustomMarketName}
                    />
                  </View>
                </Animated.View>
              )}
            </View>

            <View style={styles.budgetGrid}>
              <BudgetInput
                label="Presupuesto Bs"
                value={budgetBs}
                onChangeText={handleBsBudgetChange}
                keyboardType="numeric"
              />
              <BudgetInput
                label="Presupuesto USD"
                value={budgetUsd}
                onChangeText={handleUsdBudgetChange}
                keyboardType="numeric"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleStartList}
            >
              <View style={styles.primaryButtonOverlay} />
              <Text style={styles.primaryButtonText}>Comenzar Lista</Text>
              <MaterialIcons name="play-circle-outline" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Últimos Carritos"
            linkText="Ver todos"
            onLinkPress={() => console.log('Ver todos')}
          />

          <HorizontalScrollWithIndicators contentContainerStyle={styles.cartCardsContainer}>
            {latestCarts.map(cart => (
              <CartCard
                key={cart.id}
                title={cart.title}
                subtitle={cart.subtitle}
                date={cart.date}
                progress={cart.progress}
                color={cart.color}
                icon={cart.icon}
              />
            ))}
          </HorizontalScrollWithIndicators>
        </View>

        <View style={styles.section}>
          <TipCard
            title="Tip de Ahorro"
            text="Comprar marcas blancas en Plaza's puede ahorrarte hasta un 15% en tu carrito final."
          />
        </View>
      </ScrollView>
    </View>
  )
}
