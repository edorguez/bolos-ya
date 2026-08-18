import { useCallback, useEffect, useRef } from 'react';
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { useIsPremium } from '../../store/authStore';
import { INTERSTITIAL_AD_UNIT_ID } from '../../lib/ads';

export function useInterstitialAd() {
  const { isPremium, isResolved } = useIsPremium();
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const closeResolverRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isPremium || !isResolved) {
      return;
    }

    const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    const closed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      closeResolverRef.current?.();
      closeResolverRef.current = null;
      interstitial.load();
    });
    const error = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      closeResolverRef.current?.();
      closeResolverRef.current = null;
    });

    interstitial.load();
    interstitialRef.current = interstitial;

    return () => {
      closed();
      error();
      interstitialRef.current = null;
    };
  }, [isPremium, isResolved]);

  const show = useCallback((): Promise<void> => {
    if (isPremium) {
      return Promise.resolve();
    }
    const ad = interstitialRef.current;
    if (!ad || !ad.loaded) {
      return Promise.resolve();
    }
    return new Promise<void>(resolve => {
      closeResolverRef.current = resolve;
      ad.show();
    });
  }, [isPremium]);

  return { show };
}
