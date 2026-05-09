import { View, Text, ScrollView, Pressable, TextInput, Animated, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createHomeStyles } from '../../styles/homeStyles';
import { SupermarketCarousel } from '../../components/home/SupermarketCarousel';
import { BudgetInput } from '../../components/home/BudgetInput';
import { CartCard } from '../../components/home/CartCard';
import { TipCard } from '../../components/home/TipCard';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { HorizontalScrollWithIndicators } from '../../components/shared/HorizontalScrollWithIndicators';
import { useCartStore } from '../../store/cartStore';
import { useAppTheme } from '../../styles/theme';
import { useAuth } from '../../store/authStore';
import { getAllSupermarkets } from '../../services/supermarketService';
import type { SupermarketOption } from '../../services/supermarketService';

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
  const [fetchError, setFetchError] = useState<string | null>(null);

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
    return () => { mounted = false; };
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

  const handleStartList = () => {
    const selectedSupermarket = supermarkets.find(s => s.selected);
    let supermarketName = selectedSupermarket?.name || "Plaza's";
    if (selectedSupermarket?.name === 'Otro' && customMarketName.trim()) {
      supermarketName = customMarketName.trim();
    }
    const cartName = `${supermarketName} - ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
    const cartId = Date.now().toString();

    const newCart = {
      id: cartId,
      name: cartName,
      supermarket: supermarketName,
      items: [],
      totalBs: 0,
      totalUsd: 0,
      budgetBs: parseFloat(budgetBs) || 0,
      budgetUsd: parseFloat(budgetUsd) || 0,
    };

    addCart(newCart);
    setActiveCart(cartId);
    router.push({ pathname: '/(cart)/[id]', params: { id: cartId } });
  };

  const handleBsBudgetChange = (text: string) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setBudgetBs(text);
    }
  };

  const handleUsdBudgetChange = (text: string) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setBudgetUsd(text);
    }
  };

  const handleViewAll = () => {
    router.push({ pathname: '/history' });
  };

  const latestCarts = [
    {
      id: '1',
      title: 'Semana de Víveres',
      subtitle: '85% completado',
      date: '12 OCT',
      progress: 85,
      color: theme.colors.emberOrange,
      icon: 'bakery-dining',
    },
    {
      id: '2',
      title: 'Limpieza Mensual',
      subtitle: '40% completado',
      date: '05 OCT',
      progress: 40,
      color: theme.colors.skyBlue,
      icon: 'cleaning-services',
    },
  ];

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg }}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text style={{ marginTop: theme.spacing.md, color: theme.colors.error, textAlign: 'center' }}>
            {fetchError}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                      style={styles.customMarketInput}
                      placeholder="Ej. Plan Suarez"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      value={customMarketName}
                      onChangeText={setCustomMarketName}
                    />
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
              />
              <BudgetInput
                label="Presupuesto USD"
                value={budgetUsd}
                onChangeText={handleUsdBudgetChange}
                keyboardType="numeric"
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed ? { opacity: 0.8 } : undefined]}
              onPress={handleStartList}
            >
              <View style={styles.primaryButtonOverlay} />
              <Text style={styles.primaryButtonText}>Comenzar Lista</Text>
              <MaterialIcons name="play-circle-outline" size={24} color="#FFFFFF" />
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
