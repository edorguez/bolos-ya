import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  RefreshControl,
  type TextStyle,
} from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { createHomeStyles } from '../../styles/homeStyles';
import { BudgetFields } from '../../components/home/BudgetFields';
import { SupermarketSelector } from '../../components/home/SupermarketSelector';
import { TipCard } from '../../components/home/TipCard';
import { HistoryCard } from '../../components/history/HistoryCard';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { HorizontalScrollWithIndicators } from '../../components/shared/HorizontalScrollWithIndicators';
import { EmptyCartsState } from '../../components/shared/EmptyCartsState';
import { Toast } from '../../components/shared/Toast';
import { useCartStore } from '../../store/cartStore';
import { useAppTheme } from '../../styles/theme';
import { useAuth } from '../../store/authStore';
import { getAllSupermarkets } from '../../services/supermarketService';
import { createCart } from '../../services/cartService';
import { getCarts } from '../../services/historyService';
import { getCartIcon, getCartColorKey } from '../../utils/iconUtils';
import { formatDate } from '../../utils/dateUtils';
import { parseAmountInput } from '../../utils/amountUtils';
import { validateName, sanitizeName } from '../../utils/validation';
import { getExchangeRate } from '../../utils/currency';
import { savingsTips } from '../../utils/tips';
import type { SupermarketOption } from '../../services/supermarketService';
import type { ApiCartResponse } from '../../types';

export default function HomeTab() {
  const theme = useAppTheme();
  const styles = createHomeStyles(theme);
  const { user } = useAuth();

  const [supermarkets, setSupermarkets] = useState<SupermarketOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetBs, setBudgetBs] = useState('');
  const [budgetUsd, setBudgetUsd] = useState('');
  const [topCurrency, setTopCurrency] = useState<'BS' | 'USD'>('BS');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [customMarketName, setCustomMarketName] = useState('');
  const [showCustomMarket, setShowCustomMarket] = useState(false);
  const [renderCustomMarket, setRenderCustomMarket] = useState(false);
  const [recentCarts, setRecentCarts] = useState<ApiCartResponse[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const data = await getAllSupermarkets(user?.id);
        if (!mounted) return;
        if (data.length > 0) {
          data[0].selected = true;
        }
        setSupermarkets(data);
      } catch (err) {
        if (!mounted) return;
        setFetchError(err instanceof Error ? err.message : 'Error al cargar supermercados');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (showCustomMarket) {
      setRenderCustomMarket(true);
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
      ]).start();
    } else {
      setRenderCustomMarket(false);
    }
  }, [showCustomMarket]);

  const handleSupermarketSelect = (id: string) => {
    setSupermarkets(prev =>
      prev.map(s => ({
        ...s,
        selected: s.id === id,
      }))
    );
    if (id === 'other') {
      setShowCustomMarket(true);
    } else {
      setShowCustomMarket(false);
    }
  };

  useEffect(() => {
    getExchangeRate().then(setExchangeRate);
  }, []);

  const bsEditable = topCurrency === 'BS';

  useEffect(() => {
    if (bsEditable && budgetBs && exchangeRate > 0) {
      const bsValue = parseAmountInput(budgetBs);
      if (bsValue > 0) {
        setBudgetUsd(String(Math.round((bsValue / exchangeRate) * 100)));
      } else {
        setBudgetUsd('');
      }
    }
  }, [budgetBs, bsEditable, exchangeRate]);

  useEffect(() => {
    if (!bsEditable && budgetUsd && exchangeRate > 0) {
      const usdValue = parseAmountInput(budgetUsd);
      if (usdValue > 0) {
        setBudgetBs(String(Math.round(usdValue * exchangeRate * 100)));
      } else {
        setBudgetBs('');
      }
    }
  }, [budgetUsd, bsEditable, exchangeRate]);

  const router = useRouter();
  const { addCart, setActiveCart } = useCartStore();

  const handleToggleCurrency = () => {
    setTopCurrency(prev => (prev === 'BS' ? 'USD' : 'BS'));
  };

  const handleStartList = async () => {
    const errors: Record<string, string> = {};

    const selectedSupermarket = supermarkets.find(s => s.selected);
    if (!selectedSupermarket) {
      errors.supermarket = 'Selecciona un supermercado';
    }

    let finalName: string | undefined;
    let finalSupermarketId: string | undefined;
    if (selectedSupermarket?.id === 'other') {
      const nameErr = validateName(customMarketName);
      if (nameErr) {
        errors.customMarketName = nameErr;
      } else {
        finalName = sanitizeName(customMarketName);
      }
    } else if (selectedSupermarket) {
      finalSupermarketId = selectedSupermarket.id;
      finalName = selectedSupermarket.name;
    }

    const bsAmount = parseAmountInput(budgetBs);
    const usdAmount = parseAmountInput(budgetUsd);

    if (bsEditable) {
      if (bsAmount <= 0) {
        errors.budgetBs = 'Ingresa un presupuesto en Bolívares';
      }
    } else {
      if (usdAmount <= 0) {
        errors.budgetUsd = 'Ingresa un presupuesto en USD';
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    let finalBs = bsAmount;
    let finalUsd = usdAmount;

    if (bsEditable && finalBs > 0 && finalUsd <= 0) {
      finalUsd = finalBs / exchangeRate;
    } else if (!bsEditable && finalUsd > 0 && finalBs <= 0) {
      finalBs = finalUsd * exchangeRate;
    }

    setIsSubmitting(true);
    try {
      const result = await createCart(
        {
          supermarketId: finalSupermarketId,
          newSupermarket: finalSupermarketId ? undefined : { name: finalName || '' },
          budgetBs: finalBs,
          budgetUsd: finalUsd,
        },
        user?.id
      );

      const cartName = `${finalName || "Plaza's"} - ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;

      addCart({
        id: result.id,
        name: cartName,
        supermarket: finalName || "Plaza's",
        supermarketId: result.supermarketId,
        products: [],
        totalBs: 0,
        totalUsd: 0,
        budgetBs: result.budgetBs,
        budgetUsd: result.budgetUsd,
      });
      setActiveCart(result.id);
      setBudgetBs('');
      setBudgetUsd('');
      setCustomMarketName('');
      setShowCustomMarket(false);
      setFieldErrors({});
      router.push({ pathname: '/(cart)/[id]', params: { id: result.id } });

      const updatedMarkets = await getAllSupermarkets(user?.id);
      setSupermarkets(updatedMarkets);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error al crear el carrito');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBsBudgetChange = (text: string) => {
    setBudgetBs(text);
    setFieldErrors(prev => {
      if (!prev.budgetBs) return prev;
      const next = { ...prev };
      delete next.budgetBs;
      return next;
    });
  };

  const handleUsdBudgetChange = (text: string) => {
    setBudgetUsd(text);
    setFieldErrors(prev => {
      if (!prev.budgetUsd) return prev;
      const next = { ...prev };
      delete next.budgetUsd;
      return next;
    });
  };

  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    try {
      const data = await getCarts(user.id, 5);
      setRecentCarts(data);
    } catch {
      // silently fail
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      setCurrentTipIndex(Math.floor(Math.random() * savingsTips.length));

      const load = async () => {
        if (!user?.id) return;
        try {
          const data = await getCarts(user.id, 5);
          if (mounted) setRecentCarts(data);
        } catch {
          // silently fail — section won't render
        }
      };
      load();
      return () => {
        mounted = false;
      };
    }, [user?.id])
  );

  const handleViewAll = () => {
    router.push({ pathname: '/history' });
  };

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

  const latestCarts = recentCarts;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MercadoLibreta</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.midnight} />
        </View>
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MercadoLibreta</Text>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.lg,
          }}
        >
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text
            style={{ marginTop: theme.spacing.md, color: theme.colors.error, textAlign: 'center' }}
          >
            {fetchError}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast message={toast} onDismiss={dismissToast} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MercadoLibreta</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.section}>
          <View style={styles.card}>
            <SupermarketSelector
              supermarkets={supermarkets}
              customMarketName={customMarketName}
              fieldErrors={fieldErrors}
              renderCustomMarket={renderCustomMarket}
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
              onSupermarketSelect={handleSupermarketSelect}
              onCustomMarketChange={text => {
                setCustomMarketName(text);
                setFieldErrors(prev => {
                  if (!prev.customMarketName) return prev;
                  const next = { ...prev };
                  delete next.customMarketName;
                  return next;
                });
              }}
            />

            <BudgetFields
              topCurrency={topCurrency}
              budgetBs={budgetBs}
              budgetUsd={budgetUsd}
              fieldErrors={fieldErrors}
              onBsChange={handleBsBudgetChange}
              onUsdChange={handleUsdBudgetChange}
              onToggleCurrency={handleToggleCurrency}
            />

            {fieldErrors.budgetBs || fieldErrors.budgetUsd ? (
              <Text style={styles.errorText as TextStyle}>
                {fieldErrors.budgetBs || fieldErrors.budgetUsd}
              </Text>
            ) : null}

            {fieldErrors.supermarket ? (
              <Text style={styles.errorText as TextStyle}>{fieldErrors.supermarket}</Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed || isSubmitting ? { opacity: 0.8 } : undefined,
              ]}
              onPress={handleStartList}
              disabled={isSubmitting}
            >
              <View style={styles.primaryButtonOverlay} />
              {isSubmitting ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Comenzar Lista</Text>
                  <MaterialIcons name="play-circle-outline" size={24} color={theme.colors.white} />
                </>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Últimos Carritos"
            linkText="Ver todos"
            onLinkPress={handleViewAll}
          />

          {latestCarts.length > 0 ? (
            <HorizontalScrollWithIndicators contentContainerStyle={styles.cartCardsContainer}>
              {latestCarts.map(cart => {
                const { usage, exceeded } = calcBudgetUsage(cart);
                const colorKey = getCartColorKey(cart.id) as keyof typeof theme.colors;

                return (
                  <HistoryCard
                    key={cart.id}
                    storeName={cart.supermarketName}
                    date={formatDate(cart.createdAt)}
                    icon={getCartIcon(cart.id)}
                    iconColor={theme.colors[colorKey]}
                    status={cart.isActive ? 'Activo' : 'Completado'}
                    statusIconOnly
                    totalBs={cart.budgetBs.toLocaleString('es-VE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    totalUsd={`$ ${cart.budgetUsd.toLocaleString('es-VE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                    budgetUsage={usage}
                    exceeded={exceeded}
                    hideAmounts
                    style={{ width: 280 }}
                    onPress={() =>
                      router.push({ pathname: '/(cart)/[id]', params: { id: cart.id } })
                    }
                  />
                );
              })}
            </HorizontalScrollWithIndicators>
          ) : (
            <EmptyCartsState text="Aún no tienes carritos" compact />
          )}
        </View>

        <View style={styles.section}>
          <TipCard title="Tip de Ahorro" text={savingsTips[currentTipIndex]} />
        </View>
      </ScrollView>
    </View>
  );
}
