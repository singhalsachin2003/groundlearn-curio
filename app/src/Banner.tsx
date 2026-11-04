// Small banner shown under the island hub only. Child-directed, non-personalised, G-rated.
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { CONFIG } from './config';

/** `adOn` false keeps the space empty, so the game above never jumps when the ad appears. */
export default function Banner({ adOn }: { adOn: boolean }) {
  if (!CONFIG.bannerId) return null;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#141c35', height: 60 }}>
      {adOn && <BannerAd unitId={CONFIG.bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />}
    </View>
  );
}
