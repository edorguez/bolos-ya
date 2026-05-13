import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  ActivityIndicator,
  type TextStyle,
} from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createHomeStyles } from '../../styles/homeStyles';
import { SupermarketCarousel } from '../../components/home/SupermarketCarousel';
import { BudgetInput } from '../../components/home/BudgetInput';
import { TipCard } from '../../components/home/TipCard';
import { HistoryCard } from '../../components/history/HistoryCard';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { HorizontalScrollWithIndicators } from '../../components/shared/HorizontalScrollWithIndicators';
import { Toast } from '../../components/shared/Toast';
import { useCartStore } from '../../store/cartStore';
import { useAppTheme } from '../../styles/theme';
import { useAuth } from '../../store/authStore';
import { getAllSupermarkets } from '../../services/supermarketService';
import { createCart } from '../../services/cartService';
import { getCarts } from '../../services/historyService';
import { getIconByIndex, CARD_COLORS } from '../../utils/iconUtils';
import { validateAmount, validateName, sanitizeName } from '../../utils/validation';
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
  const [customMarketName, setCustomMarketName] = useState('');
  const [showCustomMarket, setShowCustomMarket] = useState(false);
  const [renderCustomMarket, setRenderCustomMarket] = useState(false);
  const [recentCarts, setRecentCarts] = useState<ApiCartResponse[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const router = useRouter();
  const { addCart, setActiveCart } = useCartStore();

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

    const { amount: bsAmount, error: bsError } = validateAmount(budgetBs);
    const { amount: usdAmount, error: usdError } = validateAmount(budgetUsd);
    if (bsError) errors.budgetBs = bsError;
    if (usdError) errors.budgetUsd = usdError;
    if (bsAmount === 0 && usdAmount === 0) {
      errors.budgetBs = errors.budgetBs || 'Debes ingresar Presupuesto BS o USD';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await createCart(
        {
          supermarketId: finalSupermarketId,
          newSupermarket: finalSupermarketId ? undefined : { name: finalName || '' },
          budgetBs: bsAmount,
          budgetUsd: usdAmount,
        },
        user?.id,
      );

      const cartName = `${finalName || "Plaza's"} - ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;

      addCart({
        id: result.id,
        name: cartName,
        supermarket: finalName || "Plaza's",
        items: [],
        totalBs: 0,
        totalUsd: 0,
        budgetBs: result.budgetBs,
        budgetUsd: result.budgetUsd,
      });
      setActiveCart(result.id);
      router.push({ pathname: '/(cart)/[id]', params: { id: result.id } });
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error al crear el carrito');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBsBudgetChange = (text: string) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setBudgetBs(text);
      setFieldErrors(prev => {
        if (!prev.budgetBs) return prev;
        const next = { ...prev };
        delete next.budgetBs;
        return next;
      });
    }
  };

  const handleUsdBudgetChange = (text: string) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setBudgetUsd(text);
      setFieldErrors(prev => {
        if (!prev.budgetUsd) return prev;
        const next = { ...prev };
        delete next.budgetUsd;
        return next;
      });
    }
  };

  useEffect(() => {
    let mounted = true;
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
    return () => { mounted = false; };
  }, [user?.id]);

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.card}>
            <View>
              <Text style={styles.supermarketLabel}>Supermercado</Text>
              <SupermarketCarousel supermarkets={supermarkets} onSelect={handleSupermarketSelect} />

              {renderCustomMarket ? (
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
                      style={[
                        styles.customMarketInput,
                        fieldErrors.customMarketName && styles.errorBorder,
                      ]}
                      placeholder="Ej. Plan Suarez"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      value={customMarketName}
                      onChangeText={(text) => {
                        setCustomMarketName(text);
                        setFieldErrors(prev => {
                          if (!prev.customMarketName) return prev;
                          const next = { ...prev };
                          delete next.customMarketName;
                          return next;
                        });
                      }}
                    />
                    {fieldErrors.customMarketName ? (
                      <Text style={styles.errorText as TextStyle}>{fieldErrors.customMarketName}</Text>
                    ) : null}
                  </View>
                </Animated.View>
              ) : null}
            </View>

            <View style={styles.budgetGrid}>
              <BudgetInput
                label="Presupuesto Bs"
                value={budgetBs}
                onChangeText={handleBsBudgetChange}
                keyboardType="numeric"
                hasError={!!fieldErrors.budgetBs || !!fieldErrors.budgetUsd}
              />
              <BudgetInput
                label="Presupuesto USD"
                value={budgetUsd}
                onChangeText={handleUsdBudgetChange}
                keyboardType="numeric"
                hasError={!!fieldErrors.budgetBs || !!fieldErrors.budgetUsd}
              />
            </View>
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
                (pressed || isSubmitting) ? { opacity: 0.8 } : undefined,
              ]}
              onPress={handleStartList}
              disabled={isSubmitting}
            >
              <View style={styles.primaryButtonOverlay} />
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Comenzar Lista</Text>
                  <MaterialIcons name="play-circle-outline" size={24} color="#FFFFFF" />
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

          <HorizontalScrollWithIndicators contentContainerStyle={styles.cartCardsContainer}>
            {latestCarts.map((cart, index) => {
              const { usage, exceeded } = calcBudgetUsage(cart);
              const colorKey = CARD_COLORS[index % CARD_COLORS.length] as keyof typeof theme.colors;

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
                  status={cart.isActive ? 'Activo' : 'Completado'}
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
                  onPress={() => router.push({ pathname: '/(cart)/[id]', params: { id: cart.id } })}
                />
              );
            })}
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
  );
}
