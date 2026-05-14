import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { createHistoryStyles } from '../../styles/historyStyles';
import { HeroSection } from '../../components/history/HeroSection';
import { HistoryCard } from '../../components/history/HistoryCard';
import { useAppTheme } from '../../styles/theme';
import { useAuth } from '../../store/authStore';
import { getCarts } from '../../services/historyService';
import { getIconByIndex, CARD_COLORS } from '../../utils/iconUtils';
import type { ApiCartResponse } from '../../types';
import { MaterialIcons } from '@expo/vector-icons';

function calcBudgetUsage(cart: ApiCartResponse): { usage: number; exceeded: boolean } {
  if (cart.budgetBs > 0 && cart.totalEstimatedBs !== null) {
    const usage = Math.round((cart.totalEstimatedBs / cart.budgetBs) * 100);
    return { usage, exceeded: usage > 100 };
  }
  if (cart.budgetUsd > 0 && cart.totalEstimatedUsd !== null) {
    const usage = Math.round((cart.totalEstimatedUsd / cart.budgetUsd) * 100);
    return { usage, exceeded: usage > 100 };
  }
  return { usage: 0, exceeded: false };
}

function getStatus(isActive: boolean): string {
  return isActive ? 'Activo' : 'Completado';
}

export default function HistoryTab() {
  const theme = useAppTheme();
  const styles = createHistoryStyles(theme);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [carts, setCarts] = useState<ApiCartResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarts = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await getCarts(user.id);
      setCarts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthLoading) return;
    fetchCarts();
  }, [isAuthLoading, fetchCarts]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthLoading) return;
      fetchCarts();
    }, [isAuthLoading, fetchCarts])
  );

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await fetchCarts();
  }, [fetchCarts]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MercadoLibreta</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
      >
        <HeroSection
          title="Historial de Compras"
          subtitle="Revisa tus gastos pasados y optimiza tu presupuesto."
        />

        {error ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="error-outline" size={48} color={theme.colors.coralRed} />
            <Text
              style={[
                styles.emptyStateText,
                { color: theme.colors.coralRed, marginTop: theme.spacing.md },
              ]}
            >
              {error}
            </Text>
          </View>
        ) : isLoading && carts.length === 0 ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={theme.colors.midnight} />
          </View>
        ) : (
          <>
            <View style={styles.historyList}>
              {carts.map((cart, index) => {
                const { usage, exceeded } = calcBudgetUsage(cart);
                const colorKey = CARD_COLORS[
                  index % CARD_COLORS.length
                ] as keyof typeof theme.colors;
                const totalBs = cart.budgetBs.toLocaleString('es-VE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const totalUsd = `$ ${cart.budgetUsd.toLocaleString('es-VE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;

                return (
                  <HistoryCard
                    key={cart.id}
                    storeName={cart.supermarketName}
                    date={new Date(cart.createdAt).toLocaleDateString('es-VE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    icon={getIconByIndex(index)}
                    iconColor={theme.colors[colorKey]}
                    status={getStatus(cart.isActive)}
                    totalBs={totalBs}
                    totalUsd={totalUsd}
                    budgetUsage={usage}
                    exceeded={exceeded}
                    onPress={() =>
                      router.push({ pathname: '/(cart)/[id]', params: { id: cart.id } })
                    }
                  />
                );
              })}
            </View>

            {carts.length > 0 && (
              <View style={styles.emptyState}>
                <View style={{ width: 96, height: 96, marginBottom: theme.spacing.md }}>
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
                    <MaterialIcons name="folder" size={48} color={theme.colors.outline} />
                  </View>
                </View>
                <Text style={styles.emptyStateText}>Fin del historial actual</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
