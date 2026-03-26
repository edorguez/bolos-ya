import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

export default function HomeTab() {
  const theme = useAppTheme()

  // Dynamic style functions
  const getSupermarketButtonStyle = (selected: boolean): ViewStyle => ({
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: selected ? 2 : 0,
    borderColor: selected ? theme.colors.primary : 'transparent',
  })

  const getProgressFillStyle = (percentage: number, color: string): ViewStyle => ({
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: color,
    borderRadius: theme.borderRadius.full,
  })

  const getSupermarketLabelStyle = (selected: boolean): TextStyle => ({
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: selected ? theme.colors.onSurface : theme.colors.outline,
  })

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.xl,
    },
    header: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onSurface,
    },
    sectionLink: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    card: {
      backgroundColor: '#f8eae8',
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}10`,
    },
    supermarketGrid: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    budgetGrid: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    budgetInputContainer: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    budgetLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: theme.colors.onSurfaceVariant,
    },
    budgetInput: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
    },
    cartCardsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    cartCard: {
      minWidth: 280,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    cartCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cartIconContainer: {
      width: 48,
      height: 48,
      backgroundColor: `${theme.colors.secondary}20`,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartDate: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.outline,
    },
    cartTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onSurface,
    },
    cartSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.surfaceContainerHighest,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    tipCard: {
      backgroundColor: theme.colors.tertiaryContainer,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      overflow: 'hidden',
    },
    tipIconContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tipTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#583d00',
    },
    tipText: {
      fontSize: theme.typography.fontSize.sm,
      color: '#583d00',
      opacity: 0.8,
    },
  })

  // Mock data
  const supermarkets = [
    { id: '1', name: "Plaza's", icon: 'storefront', selected: true },
    { id: '2', name: 'Gamma', icon: 'store', selected: false },
    { id: '3', name: 'Others', icon: 'local_mall', selected: false },
  ]

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
      {/* Top App Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MercadoLibreta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Configure New Cart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Configure New Cart</Text>
            <MaterialIcons name="shopping_cart" size={24} color={theme.colors.primary} />
          </View>

          <View style={styles.card}>
            {/* Supermarket Selection */}
            <View>
              <Text style={styles.budgetLabel}>Supermarket</Text>
              <View style={styles.supermarketGrid}>
                {supermarkets.map(supermarket => (
                  <Pressable
                    key={supermarket.id}
                    style={getSupermarketButtonStyle(supermarket.selected)}
                  >
                    <MaterialIcons
                      name={supermarket.icon as any}
                      size={24}
                      color={supermarket.selected ? theme.colors.primary : theme.colors.outline}
                    />
                    <Text style={getSupermarketLabelStyle(supermarket.selected)}>
                      {supermarket.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Budget Inputs */}
            <View style={styles.budgetGrid}>
              <View style={styles.budgetInputContainer}>
                <Text style={styles.budgetLabel}>Budget Bs.</Text>
                <TextInput
                  style={styles.budgetInput}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.outline}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.budgetInputContainer}>
                <Text style={styles.budgetLabel}>Budget USD</Text>
                <TextInput
                  style={styles.budgetInput}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.outline}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Start Button */}
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start List</Text>
              <MaterialIcons name="arrow_forward" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Section 2: Latest Carts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Carts</Text>
            <Pressable>
              <Text style={styles.sectionLink}>View all</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cartCardsContainer}
          >
            {latestCarts.map(cart => (
              <View key={cart.id} style={styles.cartCard}>
                <View style={styles.cartCardHeader}>
                  <View style={styles.cartIconContainer}>
                    <MaterialIcons name={cart.icon as any} size={24} color={cart.color} />
                  </View>
                  <Text style={styles.cartDate}>{cart.date}</Text>
                </View>
                <View>
                  <Text style={styles.cartTitle}>{cart.title}</Text>
                  <Text style={styles.cartSubtitle}>{cart.subtitle}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={getProgressFillStyle(cart.progress, cart.color)} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Section 3: Savings Tip */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <MaterialIcons name="lightbulb" size={24} color="#795500" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Savings Tip</Text>
              <Text style={styles.tipText}>
                Buying white-label brands at Plaza's can save you up to 15% on your final cart.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
