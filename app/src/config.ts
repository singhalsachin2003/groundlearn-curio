// Store and billing settings. The RevenueCat SDK key is public (it ships inside every
// copy of the app), so it lives here. AdMob ad unit ids are Android-only: see adUnits.ts.
import { Platform } from 'react-native';

export const CONFIG = {
  // Each store has its own RevenueCat key (project Curio Island: "Curio Island (App Store)" and "(Play Store)").
  revenueCatKey: Platform.OS === 'ios' ? 'appl_etwMWxmcmrvKzllsmyJOWosqryZ' : 'goog_PEVLLGaTqOfSxQyoSfZOqeSQkoV',
  /** How the store and the buyer's account read in a sentence. */
  storeAccount: Platform.OS === 'ios' ? 'Apple Account' : 'Google account',
  storeName: Platform.OS === 'ios' ? 'Apple' : 'Google',
  /** iOS is the free version: the first 2 levels of every lab, a 7-day trial and a one-time
   * "whole island" unlock. Android keeps every level open, with ads and the Ad-free purchase. */
  locked: Platform.OS === 'ios',
  /** Store product id of the one-time purchase (a non-consumable): Ad-free on Play, the whole island on the App Store
   * (which also keeps the island ad-free, so the game treats both alike). */
  adFreeProductId: Platform.OS === 'ios' ? 'curio_full_island' : 'curio_ad_free',
  /** The same unlock at the sale price (₹99), on the same entitlement. Selling it is switched on in RevenueCat, not in
   * the app: make the "sale" offering (one Lifetime package with this product) the current offering, and switch back
   * to "default" (the regular product) when the sale ends. The app then shows the regular price struck through. */
  saleProductId: Platform.OS === 'ios' ? 'curio_full_island_sale' : 'curio_ad_free_sale',
  /** RevenueCat entitlement unlocked by that product. */
  adFreeEntitlement: Platform.OS === 'ios' ? 'full_island' : 'ad_free',
  /** What switches on once that purchase goes through, for messages. */
  unlockReady: Platform.OS === 'ios' ? 'The whole island will open' : 'Ad-free will switch on',
  /** iOS only: the free "7-day Trial", a free non-consumable (App Store guideline 3.1.1 allows time-based trials this way).
   * The store records when it was taken, so the trial cannot restart by reinstalling. Empty on Android. */
  trialProductId: Platform.OS === 'ios' ? 'curio_trial_7day' : '',
  trialDays: 7,
  /** iOS only: Kidoz, the kids-certified ad network (Apple Kids Category). Publisher 15962 is GroundLearn's
   * account at accounts.kidoz.net; the token is the SDK token from that account's page, and ships in the app
   * like Kidoz's own sample. Lighter ads than Android: full-screen only after a finished level, rewarded ads
   * only when a child chooses one, no banner. */
  kidoz: Platform.OS === 'ios' ? { publisherId: '15962', securityToken: 'ELBXRBIS0XTApV7MVI9RQsHl1dnsqwHV' } : null,
};
