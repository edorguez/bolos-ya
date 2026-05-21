import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/theme';
import { TopAppBar } from '../../components/shared/TopAppBar';

const BCV_RATE = 475.7;

const MY_PAYMENT_INFO = {
  phone: '0412-1234567',
  identification: 'V-12345678',
  bankName: 'Banco de Venezuela',
} as const;

const formatBs = (amount: number): string => {
  const [intPart, decPart] = amount.toFixed(2).split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedInt},${decPart}`;
};

export default function PagoMovilScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { billing, usdPrice, periodLabel } = useLocalSearchParams<{
    billing: string;
    usdPrice: string;
    periodLabel: string;
  }>();

  const usdValue = parseFloat(usdPrice || '0');
  const bsValue = usdValue * BCV_RATE;

  const [userCI, setUserCI] = useState('');
  const [userBank, setUserBank] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentAmountBs, setPaymentAmountBs] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleSubmit = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      paddingBottom: 180,
    },
    summaryCard: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryLeft: {
      gap: 2,
    },
    summaryPlan: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.midnight,
    },
    summaryRate: {
      fontSize: theme.typography.fontSize.xxs,
      fontWeight: theme.typography.fontWeight.regular,
      color: theme.colors.ash,
    },
    summaryRight: {
      alignItems: 'flex-end',
      gap: 2,
    },
    summaryUsd: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.midnight,
    },
    summaryBs: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.meadowGreen,
    },
    card: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: 24,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    sectionLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    infoTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.midnight,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.ash,
    },
    infoValue: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.midnight,
    },
    infoAmountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.stoneSurface,
    },
    infoAmountLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.midnight,
    },
    infoAmountValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.midnight,
    },
    inputGroup: {
      gap: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginLeft: theme.spacing.sm,
    },
    textInput: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    noteContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: 24,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      padding: theme.spacing.md,
    },
    noteText: {
      flex: 1,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.ash,
      lineHeight: 18,
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
      <TopAppBar title="Pago Móvil" onBackPress={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryPlan}>
              ${usdPrice}{periodLabel}
            </Text>
            <Text style={styles.summaryRate}>
              Tasa BCV: {formatBs(BCV_RATE)} Bs/USD
            </Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryUsd}>${usdPrice}</Text>
            <Text style={styles.summaryBs}>{formatBs(bsValue)} Bs</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Datos del pago</Text>

          <View style={styles.infoHeader}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.meadowGreen + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="bolt" size={20} color={theme.colors.meadowGreen} />
            </View>
            <Text style={styles.infoTitle}>Pago Móvil</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{MY_PAYMENT_INFO.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cédula</Text>
            <Text style={styles.infoValue}>{MY_PAYMENT_INFO.identification}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Banco</Text>
            <Text style={styles.infoValue}>{MY_PAYMENT_INFO.bankName}</Text>
          </View>

          <View style={styles.infoAmountRow}>
            <Text style={styles.infoAmountLabel}>Monto</Text>
            <Text style={styles.infoAmountValue}>
              {formatBs(bsValue)} Bs
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Completa tus datos</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cédula / RIF *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="V-12345678"
              placeholderTextColor={theme.colors.ash}
              value={userCI}
              onChangeText={setUserCI}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Banco de origen *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Mercantil, Provincial..."
              placeholderTextColor={theme.colors.ash}
              value={userBank}
              onChangeText={setUserBank}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha del pago *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={theme.colors.ash}
              value={paymentDate}
              onChangeText={setPaymentDate}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monto en Bs *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0,00"
              placeholderTextColor={theme.colors.ash}
              value={paymentAmountBs}
              onChangeText={setPaymentAmountBs}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nro. de referencia *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="000000"
              placeholderTextColor={theme.colors.ash}
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.noteContainer}>
          <MaterialIcons name="info-outline" size={18} color={theme.colors.ash} />
          <Text style={styles.noteText}>
            Recuerda realizar el pago a través de Pago Móvil antes de enviar el
            comprobante. El monto debe coincidir con el indicado arriba.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Enviar comprobante</Text>
        </Pressable>
      </View>
    </View>
  );
}
