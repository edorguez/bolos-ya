import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, ActivityIndicator, type TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BudgetFields } from './BudgetFields';
import { SupermarketSelector } from './SupermarketSelector';
import { createHomeStyles } from '../../styles/homeStyles';
import { useAppTheme } from '../../styles/theme';
import { useCartStore } from '../../store/cartStore';
import { getAllSupermarkets } from '../../services/supermarketService';
import { createCart } from '../../services/cartService';

import { validateName, sanitizeName } from '../../utils/validation';
import { getExchangeRate } from '../../utils/currency';
import type { SupermarketOption } from '../../services/supermarketService';

interface CreateCartSectionProps {
  userId?: string;
  onCartCreated: (cartId: string) => void;
}

export function CreateCartSection({ userId, onCartCreated }: CreateCartSectionProps) {
  const theme = useAppTheme();
  const styles = createHomeStyles(theme);

  const [supermarkets, setSupermarkets] = useState<SupermarketOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetBs, setBudgetBs] = useState(0);
  const [budgetUsd, setBudgetUsd] = useState(0);
  const [topCurrency, setTopCurrency] = useState<'BS' | 'USD'>('BS');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [customMarketName, setCustomMarketName] = useState('');
  const [showCustomMarket, setShowCustomMarket] = useState(false);
  const [renderCustomMarket, setRenderCustomMarket] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSupermarkets(userId);
        if (!mounted) return;
        if (data.length > 0) {
          data[0].selected = true;
        }
        setSupermarkets(data);
      } catch {
        const localData = await getAllSupermarkets(userId);
        if (!mounted) return;
        if (localData.length > 0) {
          localData[0].selected = true;
        }
        setSupermarkets(localData);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    getExchangeRate().then(setExchangeRate);
  }, []);

  const bsEditable = topCurrency === 'BS';

  useEffect(() => {
    if (bsEditable && exchangeRate > 0) {
      setBudgetUsd(budgetBs / exchangeRate);
    }
  }, [budgetBs, bsEditable, exchangeRate]);

  useEffect(() => {
    if (!bsEditable && exchangeRate > 0) {
      setBudgetBs(budgetUsd * exchangeRate);
    }
  }, [budgetUsd, bsEditable, exchangeRate]);

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
  }, [showCustomMarket, fadeAnim, slideAnim]);

  const { addCart, setActiveCart } = useCartStore();

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

  const handleToggleCurrency = () => {
    setTopCurrency(prev => (prev === 'BS' ? 'USD' : 'BS'));
  };

  const handleBsBudgetChange = (value: number | null) => {
    setBudgetBs(value ?? 0);
    setFieldErrors(prev => {
      if (!prev.budgetBs) return prev;
      const next = { ...prev };
      delete next.budgetBs;
      return next;
    });
  };

  const handleUsdBudgetChange = (value: number | null) => {
    setBudgetUsd(value ?? 0);
    setFieldErrors(prev => {
      if (!prev.budgetUsd) return prev;
      const next = { ...prev };
      delete next.budgetUsd;
      return next;
    });
  };

  const handleCustomMarketChange = (text: string) => {
    setCustomMarketName(text);
    setFieldErrors(prev => {
      if (!prev.customMarketName) return prev;
      const next = { ...prev };
      delete next.customMarketName;
      return next;
    });
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

    const bsAmount = budgetBs;
    const usdAmount = budgetUsd;

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
        userId
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
      setBudgetBs(0);
      setBudgetUsd(0);
      setCustomMarketName('');
      setShowCustomMarket(false);
      setFieldErrors({});
      onCartCreated(result.id);

      const updatedMarkets = await getAllSupermarkets(userId);
      setSupermarkets(updatedMarkets);
    } catch {
      const result = await createCart(
        {
          supermarketId: finalSupermarketId,
          newSupermarket: finalSupermarketId ? undefined : { name: finalName || '' },
          budgetBs: finalBs,
          budgetUsd: finalUsd,
        },
        userId
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
      setBudgetBs(0);
      setBudgetUsd(0);
      setCustomMarketName('');
      setShowCustomMarket(false);
      setFieldErrors({});
      onCartCreated(result.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={[styles.card, { alignItems: 'center', paddingVertical: theme.spacing.xl }]}>
          <ActivityIndicator size="small" color={theme.colors.ash} />
        </View>
      </View>
    );
  }

  return (
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
          onCustomMarketChange={handleCustomMarketChange}
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
  );
}
