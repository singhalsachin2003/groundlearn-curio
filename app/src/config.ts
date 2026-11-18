// IDs that differ between test and release builds. Real values come from EAS
// environment variables; without them the app uses Google's public test ad units,
// so a development build never shows (or earns from) real ads.
import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Ad unit ids and the RevenueCat SDK key are public (they ship inside every copy of
// the app), so they live here. Development and preview builds set
// EXPO_PUBLIC_TEST_ADS=1 (eas.json) and always get Google's test ads, so testing
// never shows real ads or risks invalid clicks on the AdMob account.
const testAds = process.env.EXPO_PUBLIC_TEST_ADS === '1' || __DEV__;
export const CONFIG = {
  interstitialId: testAds ? TestIds.INTERSTITIAL : 'ca-app-pub-4560268294594538/4083397349',
  bannerId: testAds ? TestIds.BANNER : 'ca-app-pub-4560268294594538/5214523916',
  rewardedId: testAds ? TestIds.REWARDED : 'ca-app-pub-4560268294594538/2770315674',
  // Each store has its own RevenueCat key. The iOS one (appl_…) comes from EAS env
  // until the App Store app exists in RevenueCat; without it iOS builds cannot sell.
  revenueCatKey: Platform.OS === 'ios' ? (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '') : 'goog_PEVLLGaTqOfSxQyoSfZOqeSQkoV',
  /** How the store and the buyer's account read in a sentence. */
  storeAccount: Platform.OS === 'ios' ? 'Apple Account' : 'Google account',
  storeName: Platform.OS === 'ios' ? 'Apple' : 'Google',
  /** Store product id of the one-time Ad-free purchase (a non-consumable; same id on Play and the App Store). */
  adFreeProductId: 'curio_ad_free',
  /** RevenueCat entitlement unlocked by that product. */
  adFreeEntitlement: 'ad_free',
};
