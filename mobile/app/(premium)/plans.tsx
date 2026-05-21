import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/theme';
import { TopAppBar } from '../../components/shared/TopAppBar';

type BillingPeriod = 'monthly' | 'quarterly' | 'annual';

interface BillingOption {
  id: BillingPeriod;
  label: string;
  price: number;
  periodLabel: string;
  savingsPercent: number | null;
}

const BILLING_OPTIONS: BillingOption[] = [
  {
    id: 'monthly',
    label: 'Mensual',
    price: 3.99,
    periodLabel: '/mes',
    savingsPercent: null,
  },
  {
    id: 'quarterly',
    label: '3 Meses',
    price: 9.99,
    periodLabel: '/3 meses',
    savingsPercent: 17,
  },
  {
    id: 'annual',
    label: 'Anual',
    price: 29.99,
    periodLabel: '/año',
    savingsPercent: 37,
  },
];

const PREMIUM_FEATURES = [
  'OCR Scanner ilimitado',
  'Carritos ilimitados',
  'Soporte prioritario',
];

export default function PlansScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const selected = BILLING_OPTIONS.find(b => b.id === billingPeriod)!;

  const getPerUnit = (option: BillingOption) => {
    if (option.id === 'monthly') return null;
    const perMonth = option.id === 'quarterly'
      ? (option.price / 3)
      : (option.price / 12);
    return `$${perMonth.toFixed(2)}/mes`;
  };

  const handleSubmit = () => {
    router.push({
      pathname: '/(premium)/pago-movil',
      params: {
        billing: billingPeriod,
        usdPrice: selected.price.toFixed(2),
        periodLabel: selected.periodLabel,
      },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.lg,
      gap: theme.spacing.xl,
      paddingBottom: 180,
    },
    headerSection: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.lg,
    },
    starIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.sunburstYellow + '30',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.midnight,
      letterSpacing: theme.typography.letterSpacing.xl,
    },
    headerSubtitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.regular,
      color: theme.colors.ash,
    },
    pillsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.stoneSurface,
      borderRadius: theme.borderRadius.full,
      padding: 4,
    },
    pill: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.full,
      gap: 2,
    },
    pillSelected: {
      backgroundColor: theme.colors.midnight,
    },
    pillLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.midnight,
    },
    pillLabelSelected: {
      color: '#FFFFFF',
    },
    pillSavings: {
      fontSize: 10,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.meadowGreen,
    },
    pillSavingsSelected: {
      color: theme.colors.meadowGreen,
    },
    card: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: 24,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    priceRow: {
      alignItems: 'center',
      gap: 2,
    },
    priceAmount: {
      fontSize: 36,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.midnight,
      letterSpacing: -1,
    },
    pricePeriod: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.regular,
      color: theme.colors.ash,
    },
    perUnitText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.meadowGreen,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.stoneSurface,
    },
    featuresSection: {
      gap: theme.spacing.md,
    },
    featuresTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.midnight,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    featureText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderTopWidth: 1,
      borderTopColor: theme.colors.stoneSurface,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    submitButton: {
      backgroundColor: theme.colors.midnight,
      borderRadius: theme.borderRadius.button,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    submitButtonPressed: {
      opacity: 0.8,
    },
    submitText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <TopAppBar title="Premium" onBackPress={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <View style={styles.starIconContainer}>
            <MaterialIcons name="stars" size={24} color={theme.colors.sunburstYellow} />
          </View>
          <Text style={styles.headerTitle}>Hazte Premium</Text>
          <Text style={styles.headerSubtitle}>Elige tu plan de pago</Text>
        </View>

        <View style={styles.pillsContainer}>
          {BILLING_OPTIONS.map(option => {
            const isSelected = billingPeriod === option.id;
            return (
              <Pressable
                key={option.id}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => setBillingPeriod(option.id)}
              >
                <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                  {option.label}
                </Text>
                {option.savingsPercent ? (
                  <Text style={[styles.pillSavings, isSelected && styles.pillSavingsSelected]}>
                    -{option.savingsPercent}%
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>${selected.price.toFixed(2)}</Text>
            <Text style={styles.pricePeriod}>{selected.periodLabel}</Text>
          </View>

          {getPerUnit(selected) ? (
            <Text style={styles.perUnitText}>{getPerUnit(selected)}</Text>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Incluye:</Text>
            {PREMIUM_FEATURES.map((feature, i) => (
              <View key={i} style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={theme.colors.meadowGreen} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            Suscribir por ${selected.price.toFixed(2)}{selected.periodLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
