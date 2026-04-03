import { View, Text, ScrollView, Pressable } from 'react-native'
import { useState } from 'react'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { useRouter } from 'expo-router'
import { createHomeStyles } from '../../styles/homeStyles'
import { SupermarketButton } from '../../components/home/SupermarketButton'
import { BudgetInput } from '../../components/home/BudgetInput'
import { CartCard } from '../../components/home/CartCard'
import { TipCard } from '../../components/home/TipCard'
import { SectionHeader } from '../../components/shared/SectionHeader'
import { useCartStore } from '../../store/cartStore'
import { useAppTheme } from '../../styles/theme'

export default function HomeTab() {
  const theme = useAppTheme()
  const styles = createHomeStyles(theme)

  const [supermarkets, setSupermarkets] = useState([
    { id: '1', name: "Plaza's", icon: 'storefront', selected: true },
    { id: '2', name: 'Gamma', icon: 'store', selected: false },
    { id: '3', name: 'Others', icon: 'local_mall', selected: false },
  ])
  const [budgetBs, setBudgetBs] = useState('')
  const [budgetUsd, setBudgetUsd] = useState('')

  const handleSupermarketSelect = (id: string) => {
    setSupermarkets(prev =>
      prev.map(s => ({
        ...s,
        selected: s.id === id,
      }))
    )
  }

  const router = useRouter()
  const { addCart, setActiveCart } = useCartStore()

  const handleStartList = () => {
    const selectedSupermarket = supermarkets.find(s => s.selected)
    const cartName = `${selectedSupermarket?.name || 'New'} Cart`

    const newCart = {
      name: cartName,
      supermarket: selectedSupermarket?.name || "Plaza's",
      items: [],
      totalBs: 0,
      totalUsd: 0,
    }

    addCart(newCart)
    const cartId = Date.now().toString() // Store generates ID based on timestamp
    setActiveCart(cartId)
    // @ts-ignore
    router.push({ pathname: '/(cart)/[id]', params: { id: cartId } })
  }

  const latestCarts = [
    {
      id: '1',
      title: 'Week Groceries',
      subtitle: '85% completed',
      date: '12 OCT',
      progress: 85,
      color: theme.colors.secondary,
      icon: 'bakery_dining',
    },
    {
      id: '2',
      title: 'Monthly Cleaning',
      subtitle: '40% completed',
      date: '05 OCT',
      progress: 40,
      color: theme.colors.tertiary,
      icon: 'cleaning_services',
    },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MercadoLibreta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionHeader
            title="Configure New Cart"
            icon="shopping_cart"
            iconColor={theme.colors.primary}
          />

          <View style={styles.card}>
            <View>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.bold,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                Supermarket
              </Text>
              <View style={styles.supermarketGrid}>
                {supermarkets.map(supermarket => (
                  <SupermarketButton
                    key={supermarket.id}
                    selected={supermarket.selected}
                    icon={supermarket.icon}
                    name={supermarket.name}
                    onPress={() => handleSupermarketSelect(supermarket.id)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.budgetGrid}>
              <BudgetInput
                label="Budget Bs."
                value={budgetBs}
                onChangeText={setBudgetBs}
                keyboardType="numeric"
              />
              <BudgetInput
                label="Budget USD"
                value={budgetUsd}
                onChangeText={setBudgetUsd}
                keyboardType="numeric"
              />
            </View>

            <Pressable style={styles.primaryButton} onPress={handleStartList}>
              <Text style={styles.primaryButtonText}>Start List</Text>
              <MaterialIcons name="arrow_forward" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Latest Carts"
            linkText="View all"
            onLinkPress={() => console.log('View all carts')}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cartCardsContainer}
          >
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
          </ScrollView>
        </View>

        <View style={styles.section}>
          <TipCard
            title="Savings Tip"
            text="Buying white-label brands at Plaza's can save you up to 15% on your final cart."
          />
        </View>
      </ScrollView>
    </View>
  )
}
