// IDs that differ between test and release builds. Real values come from EAS
// environment variables; without them the app uses Google's public test ad units,
// so a development build never shows (or earns from) real ads.
import { TestIds } from 'react-native-google-mobile-ads';

// Ad unit ids and the RevenueCat SDK key are public (they ship inside every copy of
// the app), so they live here. Development and preview builds set
// EXPO_PUBLIC_TEST_ADS=1 (eas.json) and always get Google's test ads, so testing
// never shows real ads or risks invalid clicks on the AdMob account.
const testAds = process.env.EXPO_PUBLIC_TEST_ADS === '1' || __DEV__;
export const CONFIG = {
  interstitialId: testAds ? TestIds.INTERSTITIAL : 'ca-app-pub-4560268294594538/4083397349',
  /** TODO: create a Banner ad unit in AdMob and replace the placeholder below. Until then release builds show no banner. */
  bannerId: testAds ? TestIds.BANNER : '',
  rewardedId: testAds ? TestIds.REWARDED : 'ca-app-pub-4560268294594538/2770315674',
  revenueCatKey: 'goog_PEVLLGaTqOfSxQyoSfZOqeSQkoV',
  /** Play product id of the one-time Ad-free purchase (a non-consumable in-app product). */
  adFreeProductId: 'curio_ad_free',
  /** RevenueCat entitlement unlocked by that product. */
  adFreeEntitlement: 'ad_free',
};
