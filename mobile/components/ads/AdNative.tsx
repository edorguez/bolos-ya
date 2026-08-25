import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from 'react-native-google-mobile-ads';
import { useAppTheme } from '../../styles/theme';
import { useIsPremium } from '../../store/authStore';
import { NATIVE_AD_UNIT_ID } from '../../lib/ads';

export function AdNative() {
  const theme = useAppTheme();
  const { isPremium, isResolved } = useIsPremium();
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    if (isPremium || !isResolved) {
      return;
    }

    let mounted = true;
    let ad: NativeAd | null = null;

    NativeAd.createForAdRequest(NATIVE_AD_UNIT_ID)
      .then(created => {
        if (!mounted) {
          created.destroy();
          return;
        }
        ad = created;
        setNativeAd(created);
      })
      .catch(() => {
        // No ad available — render nothing.
      });

    return () => {
      mounted = false;
      ad?.destroy();
    };
  }, [isPremium, isResolved]);

  if (isPremium || !isResolved || !nativeAd) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      borderCurve: 'continuous',
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
    },
    headline: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.charcoalPrimary,
    },
    cta: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
    },
    ctaText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onPrimary,
    },
    media: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.stoneSurface,
    },
    body: {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: 20,
      color: theme.colors.textSecondary,
    },
    advertiser: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.ash,
      textTransform: 'uppercase',
    },
  });

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.container}>
      <View style={styles.headerRow}>
        {nativeAd.icon ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
          </NativeAsset>
        ) : null}
        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <Text style={styles.headline} numberOfLines={1}>
            {nativeAd.headline}
          </Text>
        </NativeAsset>
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <View style={styles.cta}>
            <Text style={styles.ctaText} numberOfLines={1}>
              {nativeAd.callToAction}
            </Text>
          </View>
        </NativeAsset>
      </View>

      <NativeAsset assetType={NativeAssetType.BODY}>
        <Text style={styles.body} numberOfLines={3}>
          {nativeAd.body}
        </Text>
      </NativeAsset>

      <NativeMediaView style={styles.media} resizeMode="contain" />

      {nativeAd.advertiser ? (
        <NativeAsset assetType={NativeAssetType.ADVERTISER}>
          <Text style={styles.advertiser} numberOfLines={1}>
            {nativeAd.advertiser}
          </Text>
        </NativeAsset>
      ) : null}
    </NativeAdView>
  );
}
