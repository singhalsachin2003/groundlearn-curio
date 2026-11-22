// iPhone and iPad (Metro picks this over ads.ts): kid-safe ads through Kidoz, a network certified
// for children's apps that documents Apple Kids Category compliance (human-reviewed, contextual
// ads, no tracking). Lighter than Android: the game asks for a full-screen ad only after a
// finished level and never in the first minutes, a rewarded ad only when a child chooses one,
// and never a banner. Without the native module (Expo Go) the build simply has no ads.
import Kidoz from '../modules/kidoz-ads';
import { CONFIG } from './config';

/** Whether this build can show ads at all. The game hides ad offers when false. */
export const available = !!Kidoz && !!CONFIG.kidoz;

let ready = false;

export async function initAds() {
  if (!available || ready) return;
  ready = await Kidoz!.initialize(CONFIG.kidoz!.publisherId, CONFIG.kidoz!.securityToken);
}

/** Show the waiting full-screen ad if one is ready; `onDone` runs when it closes or if there was none. */
export function showInterstitial(onDone?: () => void): boolean {
  if (!ready) return false;
  Kidoz!.showInterstitial().then(() => onDone?.(), () => onDone?.());
  return true;
}

/** Load and show a rewarded ad. Resolves true only if the child watched it to the reward. */
export function showRewarded(): Promise<boolean> {
  if (!ready) return Promise.resolve(false);
  return Kidoz!.showRewarded().catch(() => false);
}
