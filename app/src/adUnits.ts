// AdMob ad unit ids (Android only). Imported only by ads.android.ts and Banner.android.tsx,
// so the iOS bundle never pulls in react-native-google-mobile-ads.
// Ad unit ids are public (they ship inside every copy of the app). Development and
// preview builds set EXPO_PUBLIC_TEST_ADS=1 (eas.json) and always get Google's test
// ads, so testing never shows real ads or risks invalid clicks on the AdMob account.
import { TestIds } from 'react-native-google-mobile-ads';

const testAds = process.env.EXPO_PUBLIC_TEST_ADS === '1' || __DEV__;
export const AD_UNITS = {
  interstitial: testAds ? TestIds.INTERSTITIAL : 'ca-app-pub-4560268294594538/4083397349',
  banner: testAds ? TestIds.BANNER : 'ca-app-pub-4560268294594538/5214523916',
  rewarded: testAds ? TestIds.REWARDED : 'ca-app-pub-4560268294594538/2770315674',
};
