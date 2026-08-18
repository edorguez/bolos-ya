import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useIsPremium } from '../../store/authStore';
import { BANNER_AD_UNIT_ID } from '../../lib/ads';

export function AdBanner() {
  const { isPremium, isResolved } = useIsPremium();

  if (isPremium || !isResolved) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
});
