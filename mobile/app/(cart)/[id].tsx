import { View, Text, ScrollView, Pressable, Image, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { useCartStore, type Cart, type CartItem } from '../../store/cartStore'
import { useAppTheme } from '../../styles/theme'
import { ProductCard } from '../../components/cart/ProductCard'
import { BudgetSummary } from '../../components/cart/BudgetSummary'
import { TopAppBar } from '../../components/shared/TopAppBar'
import { ManualAddButton } from '../../components/cart/ManualAddButton'
import { ScanFab } from '../../components/shared/ScanFab'
import { BottomSheetModal } from '../../components/shared/BottomSheetModal'
import { ProductForm } from '../../components/cart/ProductForm'
import { useState, useEffect } from 'react'

export default function CartDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const theme = useAppTheme()
  const { carts, activeCartId, addItemToCart, setActiveCart } = useCartStore()
  const [showAddProduct, setShowAddProduct] = useState(false)

  useEffect(() => {
    setActiveCart(id)
  }, [id, setActiveCart])

  const handleScanPress = () => {
    router.push('/(cart)/scan')
  }

  const handleAddProduct = (product: {
    name: string
    priceBs: number
    priceUsd: number
    quantity: number
    supermarket: string
  }) => {
    if (!cart) return

    addItemToCart(cart.id, {
      productId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: product.name,
      priceBs: product.priceBs,
      priceUsd: product.priceUsd,
      quantity: product.quantity,
      supermarket: product.supermarket,
      // productImageUrl can be omitted for now
    })

    setShowAddProduct(false)
  }

  const cart = carts.find((c: Cart) => c.id === id)

  if (!cart) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Cart not found</Text>
      </View>
    )
  }

  const totalBs = cart.totalBs || 0
  const totalUsd = cart.totalUsd || 0
  const budgetBs = cart.budgetBs || 4000
  const budgetUsd = cart.budgetUsd || 109

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      flex: 1,
      paddingTop: 80,
      paddingHorizontal: 24,
      paddingBottom: 120,
    },
    heroSection: {
      marginBottom: 32,
    },

    productList: {
      gap: 16,
    },
    sectionHeader: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 2,
      color: theme.colors.outline,
      marginBottom: 16,
    },
  })

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <TopAppBar
        title="MercadoLibreta"
        leftLabel={cart.supermarket}
        onBackPress={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budget & Total Hero Section */}
        <View style={styles.heroSection}>
          <BudgetSummary
            totalBs={totalBs}
            totalUsd={totalUsd}
            budgetBs={budgetBs}
            budgetUsd={budgetUsd}
          />
        </View>

        {/* Manual Add Product Button */}
        <ManualAddButton onPress={() => setShowAddProduct(true)} />

        {/* Product List */}
        <Text style={styles.sectionHeader}>Tu Carrito</Text>
        <View style={styles.productList}>
          {cart.items.length > 0 ? (
            cart.items.map((item: CartItem) => <ProductCard key={item.id} item={item} />)
          ) : (
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
                paddingVertical: 32,
              }}
            >
              No products yet. Add your first product!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Scan FAB */}
      <ScanFab onPress={handleScanPress} />

      {/* Add Product Modal */}
      <BottomSheetModal
        isVisible={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        title="Add Product"
        subtitle="Ingresa los detalles del producto"
        showBackButton={true}
      >
        {cart && (
          <ProductForm
            onSubmit={handleAddProduct}
            supermarket={cart.supermarket}
            onCancel={() => setShowAddProduct(false)}
          />
        )}
      </BottomSheetModal>
    </View>
  )
}
