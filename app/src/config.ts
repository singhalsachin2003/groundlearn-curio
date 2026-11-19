// Store and billing settings. The RevenueCat SDK key is public (it ships inside every
// copy of the app), so it lives here. AdMob ad unit ids are Android-only: see adUnits.ts.
import { Platform } from 'react-native';

export const CONFIG = {
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
