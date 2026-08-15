import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const env = (key: string): string | undefined => process.env[key];

function resolveAdUnit(testId: string, real: { android: string; ios: string }): string {
  if (__DEV__) return testId;
  return Platform.select(real) ?? real.android;
}

export const BANNER_AD_UNIT_ID = resolveAdUnit(TestIds.BANNER, {
  android: env('EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID') ?? 'ca-app-pub-1019164072675452/8264572161',
  ios: env('EXPO_PUBLIC_ADMOB_BANNER_ID_IOS') ?? 'ca-app-pub-1019164072675452/7861247486',
});

export const INTERSTITIAL_AD_UNIT_ID = resolveAdUnit(TestIds.INTERSTITIAL, {
  android:
    env('EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_ANDROID') ?? 'ca-app-pub-1019164072675452/3283708227',
  ios: env('EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_IOS') ?? 'ca-app-pub-1019164072675452/8152891524',
});

export const NATIVE_AD_UNIT_ID = resolveAdUnit(TestIds.NATIVE, {
  android: env('EXPO_PUBLIC_ADMOB_NATIVE_ID_ANDROID') ?? 'ca-app-pub-1019164072675452/5422786408',
  ios: env('EXPO_PUBLIC_ADMOB_NATIVE_ID_IOS') ?? 'ca-app-pub-1019164072675452/5235084148',
});
