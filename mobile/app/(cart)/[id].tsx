import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCartStore, type Cart, type CartItem } from '../../store/cartStore'
import { useAppTheme } from '../../styles/theme'
import { ProductCard } from '../../components/cart/ProductCard'
import { BudgetSummary } from '../../components/cart/BudgetSummary'
import { SupermarketHeader } from '../../components/cart/SupermarketHeader'
import { TopAppBar } from '../../components/shared/TopAppBar'
import { BottomSheetModal } from '../../components/shared/BottomSheetModal'
import { ProductForm } from '../../components/cart/ProductForm'
import { useState, useEffect } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function CartDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const theme = useAppTheme()
  const insets = useSafeAreaInsets()
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

  const buttonBarHeight = 56 + theme.spacing.lg * 2 + insets.bottom
  const scrollContentPaddingBottom = buttonBarHeight + theme.spacing.md

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceContainer,
      paddingHorizontal: theme.spacing.lg,
    },
    supermarketHeaderContainer: {
      paddingTop: theme.spacing.md,
    },
    scrollView: {
      flex: 1,
      paddingTop: theme.spacing.sm,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: scrollContentPaddingBottom,
    },
    productList: {
      gap: 16,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.onSurface,
      marginBottom: 16,
      marginTop: 8,
    },
    emptyState: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.4,
    },
    emptyStateText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.onSurface,
      marginTop: theme.spacing.md,
    },
    buttonBarContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surfaceContainerLowest,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
    },
    buttonBar: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      borderCurve: 'continuous',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    buttonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
      flexShrink: 1,
    },
  })

  return (
    <View style={styles.container}>
      {/* Fixed White Header */}
      <TopAppBar title="MercadoLibreta" onBackPress={() => router.back()} variant="solid-white" />
      <View style={styles.headerContainer}>
        <View style={styles.supermarketHeaderContainer}>
          <SupermarketHeader supermarket={cart.supermarket} itemCount={cart.items.length} />
        </View>
        <BudgetSummary
          totalBs={totalBs}
          totalUsd={totalUsd}
          budgetBs={budgetBs}
          budgetUsd={budgetUsd}
        />
      </View>

      {/* Scrollable Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product List */}
        <Text style={styles.sectionHeader}>Productos en Carrito</Text>
        <View style={styles.productList}>
          {cart.items.length > 0 ? (
            cart.items.map((item: CartItem) => (
              <ProductCard key={item.id} item={item} cartId={cart.id} onEditPress={() => setShowAddProduct(true)} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={{ width: 96, height: 96 }}>
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.colors.outline + '20',
                    borderRadius: theme.borderRadius.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name="shopping-bag" size={48} color={theme.colors.outline} />
                </View>
              </View>
              <Text style={styles.emptyStateText}>Sin productos</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button Bar */}
      <View style={styles.buttonBarContainer}>
        <View style={styles.buttonBar}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => setShowAddProduct(true)}
            accessibilityRole="button"
            accessibilityLabel="Agregar producto"
          >
            <MaterialIcons name="add" size={12} color="#FFFFFF" />
            <Text style={styles.buttonText}>Agregar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={handleScanPress}
            accessibilityRole="button"
            accessibilityLabel="Escanear producto"
          >
            <MaterialIcons name="camera-alt" size={12} color="#FFFFFF" />
            <Text style={styles.buttonText}>Escanear</Text>
          </Pressable>
        </View>
      </View>

      {/* Add Product Modal */}
      <BottomSheetModal
        isVisible={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        title="Agregar Producto"
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
