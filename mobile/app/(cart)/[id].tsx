import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCartStore, type Cart, type CartItem } from '../../store/cartStore';
import { useAppTheme } from '../../styles/theme';
import { ProductCard } from '../../components/cart/ProductCard';
import { BudgetSummary } from '../../components/cart/BudgetSummary';
import { SupermarketHeader } from '../../components/cart/SupermarketHeader';
import { TopAppBar } from '../../components/shared/TopAppBar';
import { BottomSheetModal } from '../../components/shared/BottomSheetModal';
import { ActionSheetModal } from '../../components/shared/ActionSheetModal';
import { ProductForm } from '../../components/cart/ProductForm';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCartDetail } from '../../services/cartService';
import { useAuth } from '../../store/authStore';
import type { ApiCartDetailResponse } from '../../types';

export default function CartDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const {
    carts,
    addCart,
    addItemToCart,
    setActiveCart,
    updateItem,
    removeItemFromCart,
    completeCart,
  } = useCartStore();
  const { user } = useAuth();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isLoadingFromApi, setIsLoadingFromApi] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showCompleteCartSheet, setShowCompleteCartSheet] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  useEffect(() => {
    setActiveCart(id);
  }, [id, setActiveCart]);

  useEffect(() => {
    if (!id || !user?.id) return;

    const exists = carts.some(c => c.id === id);
    if (!exists) {
      setIsLoadingFromApi(true);
      getCartDetail(id, user.id)
        .then((apiCart: ApiCartDetailResponse) => {
          addCart({
            id: apiCart.id,
            name: apiCart.supermarketName,
            supermarket: apiCart.supermarketName,
            items: apiCart.items.map(item => ({
              id: item.id,
              productId: item.productId,
              name: item.name,
              priceBs: item.priceBs,
              priceUsd: item.priceUsd,
              quantity: item.quantity,
              supermarket: apiCart.supermarketName,
              productImageUrl: item.imageUrl || undefined,
            })),
            totalBs: apiCart.totalEstimatedBs ?? 0,
            totalUsd: apiCart.totalEstimatedUsd ?? 0,
            budgetBs: apiCart.budgetBs,
            budgetUsd: apiCart.budgetUsd,
          });
        })
        .catch(() => {})
        .finally(() => setIsLoadingFromApi(false));
    }
  }, [id, user?.id, addCart]);

  const handleScanPress = () => {
    router.push('/(cart)/scan');
  };

  const handleAddProduct = (product: {
    name: string;
    priceBs: number;
    priceUsd: number;
    quantity: number;
    supermarket: string;
  }) => {
    if (!cart) return;

    addItemToCart(cart.id, {
      productId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: product.name,
      priceBs: product.priceBs,
      priceUsd: product.priceUsd,
      quantity: product.quantity,
      supermarket: product.supermarket,
    });

    setShowAddProduct(false);
  };

  const handleEditProduct = (product: {
    name: string;
    priceBs: number;
    priceUsd: number;
    quantity: number;
    supermarket: string;
  }) => {
    if (!cart || !editingItem) return;

    updateItem(cart.id, editingItem.id, {
      name: product.name,
      priceBs: product.priceBs,
      priceUsd: product.priceUsd,
      quantity: product.quantity,
      supermarket: product.supermarket,
    });

    setShowEditModal(false);
    setEditingItem(null);
  };

  const cart = carts.find((c: Cart) => c.id === id);

  if (!cart) {
    if (isLoadingFromApi) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.midnight} />
        </View>
      );
    }
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
    );
  }

  const totalBs = cart.totalBs || 0;
  const totalUsd = cart.totalUsd || 0;
  const budgetBs = cart.budgetBs || 4000;
  const budgetUsd = cart.budgetUsd || 109;

  const buttonBarHeight = 56 + theme.spacing.lg * 2 + insets.bottom;
  const scrollContentPaddingBottom = buttonBarHeight + theme.spacing.md;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.stoneSurface,
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
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 16,
      marginTop: 8,
      letterSpacing: theme.typography.letterSpacing.lg,
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
      bottom: theme.spacing.md,
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
      position: 'relative',
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.midnight,
      borderRadius: theme.borderRadius.button,
    },
    buttonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: '#FFFFFF',
      flexShrink: 1,
    },
    buttonCircle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.secondaryContainer,
      borderRadius: theme.borderRadius.full,
    },
    buttonCircleComplete: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.meadowGreen,
      borderRadius: theme.borderRadius.full,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      position: 'absolute',
      top: -10,
      left: '50%',
      transform: [{ translateX: '-50%' }],
      zIndex: 10,
    },
  });

  return (
    <View style={styles.container}>
      <TopAppBar title="MercadoLibreta" onBackPress={() => router.back()} />
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>Productos en Carrito</Text>
        <View style={styles.productList}>
          {cart.items.length > 0 ? (
            cart.items.map((item: CartItem) => (
              <ProductCard
                key={item.id}
                item={item}
                cartId={cart.id}
                onMenuPress={() => {
                  setSelectedItem(item);
                  setShowActionSheet(true);
                }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={{ width: 96, height: 96 }}>
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.colors.outline + '20',
                    borderRadius: theme.borderRadius.md,
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
            style={({ pressed }) => [styles.buttonCircleComplete, pressed && { opacity: 0.8 }]}
            onPress={() => setShowCompleteCartSheet(true)}
            accessibilityRole="button"
            accessibilityLabel="Completar Carrito"
          >
            <MaterialCommunityIcons name="cart-check" size={24} color="#FFFFFF" />
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

      <BottomSheetModal
        isVisible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        title="Editar Producto"
        showBackButton={true}
      >
        {cart && editingItem && (
          <ProductForm
            onSubmit={handleEditProduct}
            supermarket={cart.supermarket}
            initialData={editingItem}
            onCancel={() => {
              setShowEditModal(false);
              setEditingItem(null);
            }}
          />
        )}
      </BottomSheetModal>

      <ActionSheetModal
        isVisible={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
          setSelectedItem(null);
        }}
        options={[
          {
            label: 'Editar',
            icon: 'edit',
            color: theme.colors.midnight,
            onPress: () => {
              setEditingItem(selectedItem);
              setShowEditModal(true);
            },
          },
          {
            label: 'Eliminar',
            icon: 'delete',
            color: theme.colors.error,
            onPress: () => {
              if (selectedItem && cart) {
                removeItemFromCart(cart.id, selectedItem.id);
              }
            },
          },
        ]}
      />

      <ActionSheetModal
        isVisible={showCompleteCartSheet}
        onClose={() => setShowCompleteCartSheet(false)}
        options={[
          {
            label: 'Sí, completar carrito',
            icon: 'check-circle',
            color: theme.colors.success,
            onPress: () => {
              if (cart) {
                completeCart(cart.id);
                setShowCompleteCartSheet(false);
                Alert.alert('Carrito completado', 'El carrito ha sido movido al historial.');
              }
            },
          },
          {
            label: 'Cancelar',
            icon: 'cancel',
            color: theme.colors.outline,
            onPress: () => setShowCompleteCartSheet(false),
          },
        ]}
      />
    </View>
  );
}
