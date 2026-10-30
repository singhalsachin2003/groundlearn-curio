// IDs that differ between test and release builds. Real values come from EAS
// environment variables; without them the app uses Google's public test ad units,
// so a development build never shows (or earns from) real ads.
import { TestIds } from 'react-native-google-mobile-ads';

const env = process.env;
export const CONFIG = {
  interstitialId: env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || TestIds.INTERSTITIAL,
  rewardedId: env.EXPO_PUBLIC_ADMOB_REWARDED_ID || TestIds.REWARDED,
  revenueCatKey: env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
  /** Play product id of the one-time Ad-free purchase (a non-consumable in-app product). */
  adFreeProductId: 'curio_ad_free',
  /** RevenueCat entitlement unlocked by that product. */
  adFreeEntitlement: 'ad_free',
};
