// Kidoz ads on iPhone and iPad (native code in ./ios). Missing in builds without the native
// module (Expo Go, Android, the web), where this is null and the app shows no ads.
import { requireOptionalNativeModule } from 'expo';

export interface KidozAdsModule {
  initialize(publisherId: string, securityToken: string): Promise<boolean>;
  loadInterstitial(): Promise<void>;
  showInterstitial(): Promise<boolean>;
  showRewarded(): Promise<boolean>;
}

export default requireOptionalNativeModule<KidozAdsModule>('KidozAds');
