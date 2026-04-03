import { View, Text, ScrollView, Pressable, Image, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { useCartStore, type Cart, type CartItem } from '../../store/cartStore'
import { useAppTheme } from '../../styles/theme'
import { ProductCard } from '../../components/cart/ProductCard'
import { useState } from 'react'

export default function CartDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const theme = useAppTheme()
  const { carts, activeCartId } = useCartStore()
  const [showAddProduct, setShowAddProduct] = useState(false)

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
  const budgetBs = 4000 // Mock budget - in real app would be from cart
  const budgetUsd = 109 // Mock USD budget
  const isOverBudget = totalBs > budgetBs
  const overBudgetAmount = Math.max(0, totalBs - budgetBs)
  const progressPercentage = Math.min(100, (totalBs / budgetBs) * 100)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    topAppBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 64,
      backgroundColor: `${theme.colors.surfaceContainerLowest}CC`,
      backdropFilter: 'blur(20px)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      zIndex: 50,
    },
    topAppBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    appTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    supermarketLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
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
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 16,
    },
    totalAmount: {
      fontSize: 48,
      fontWeight: '800',
      color: theme.colors.onSurface,
    },
    totalUsd: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.secondary,
    },
    budgetLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: theme.colors.outline,
      textAlign: 'right',
    },
    budgetAmount: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    progressBar: {
      height: 16,
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: isOverBudget ? '#fb7171' : theme.colors.primary,
      borderRadius: 8,
    },
    overBudgetWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    overBudgetText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fb7171',
    },
    manualAddButton: {
      width: '100%',
      padding: 24,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    manualAddLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    addIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    manualAddText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.onSurface,
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
    scanFab: {
      position: 'absolute',
      bottom: 120,
      right: 24,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.secondary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 8,
    },
  })

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topAppBar}>
        <View style={styles.topAppBarLeft}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow_back" size={24} color={theme.colors.onSurfaceVariant} />
          </Pressable>
          <Text style={styles.appTitle}>MercadoLibreta</Text>
        </View>
        <Text style={styles.supermarketLabel}>{cart.supermarket}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budget & Total Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalAmount}>
                Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.totalUsd}>
                ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </Text>
            </View>
            <View>
              <Text style={styles.budgetLabel}>Presupuesto</Text>
              <Text style={styles.budgetAmount}>
                Bs. {budgetBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>

          {isOverBudget && (
            <View style={styles.overBudgetWarning}>
              <MaterialIcons name="warning" size={16} color="#fb7171" />
              <Text style={styles.overBudgetText}>
                Excedido por Bs.{' '}
                {overBudgetAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          )}
        </View>

        {/* Manual Add Product Button */}
        <Pressable style={styles.manualAddButton} onPress={() => setShowAddProduct(true)}>
          <View style={styles.manualAddLeft}>
            <View style={styles.addIcon}>
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.manualAddText}>Add Product Manually</Text>
          </View>
          <MaterialIcons name="chevron_right" size={24} color={theme.colors.outline} />
        </Pressable>

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
      <Pressable style={styles.scanFab}>
        <MaterialIcons
          name="qr_code_scanner"
          size={32}
          color="#FFFFFF"
          style={{ fontVariationSettings: "'FILL' 1" }}
        />
      </Pressable>

      {/* Add Product Modal (placeholder) */}
      {showAddProduct && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <Text>Add Product Form</Text>
          <Pressable onPress={() => setShowAddProduct(false)}>
            <Text>Close</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
