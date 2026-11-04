// Small banner shown under the island hub only. Child-directed, non-personalised, G-rated.
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { CONFIG } from './config';

export default function Banner() {
  if (!CONFIG.bannerId) return null;
  return (
    <View style={{ alignItems: 'center', backgroundColor: '#141c35' }}>
      <BannerAd unitId={CONFIG.bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
    </View>
  );
}
