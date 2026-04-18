import { View, Text, ScrollView, Pressable } from 'react-native'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

import { createHistoryStyles } from '../../styles/historyStyles'
import { HeroSection } from '../../components/history/HeroSection'
import { SearchBar } from '../../components/history/SearchBar'
import { HistoryCard } from '../../components/history/HistoryCard'
import { useAppTheme } from '../../styles/theme'

export default function HistoryTab() {
  const theme = useAppTheme()
  const styles = createHistoryStyles(theme)

  const historyItems = [
    {
      id: '1',
      storeName: "Plaza's",
      date: '12 Oct 2023',
      icon: 'storefront',
      iconColor: theme.colors.secondary,
      status: 'Completado',
      totalBs: '1,450.00',
      totalUsd: '$ 41.20',
      budgetUsage: 82,
      exceeded: false,
    },
    {
      id: '2',
      storeName: 'Gamma',
      date: '05 Oct 2023',
      icon: 'shopping-cart',
      iconColor: theme.colors.tertiary,
      status: 'Excedido',
      totalBs: '2,890.50',
      totalUsd: '$ 82.58',
      budgetUsage: 115,
      exceeded: true,
    },
    {
      id: '3',
      storeName: 'Central Madeirense',
      date: '28 Sep 2023',
      icon: 'storefront',
      iconColor: theme.colors.primary,
      status: 'Completado',
      totalBs: '980.00',
      totalUsd: '$ 28.00',
      budgetUsage: 45,
      exceeded: false,
    },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MercadoLibreta</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HeroSection
          title="Historial de Compras"
          subtitle="Revisa tus gastos pasados y optimiza tu presupuesto familiar."
        />

        <SearchBar />

        <View style={styles.historyList}>
          {historyItems.map(item => (
            <HistoryCard
              key={item.id}
              storeName={item.storeName}
              date={item.date}
              icon={item.icon}
              iconColor={item.iconColor}
              status={item.status}
              totalBs={item.totalBs}
              totalUsd={item.totalUsd}
              budgetUsage={item.budgetUsage}
              exceeded={item.exceeded}
            />
          ))}
        </View>

        <View style={styles.emptyState}>
          <View style={{ width: 96, height: 96, marginBottom: theme.spacing.md }}>
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
              <MaterialIcons name="folder" size={48} color={theme.colors.outline} />
            </View>
          </View>
          <Text style={styles.emptyStateText}>Fin del historial actual</Text>
        </View>
      </ScrollView>
    </View>
  )
}
