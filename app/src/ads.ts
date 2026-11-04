// Child-directed AdMob ads: non-personalised, G-rated, never at launch.
// Interstitials only when the game asks (at a natural break); rewarded ads only when
// the child taps "watch an ad for a heart".
import mobileAds, { AdEventType, AgeRestrictedTreatment, InterstitialAd, MaxAdContentRating, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { CONFIG } from './config';

const REQUEST = { requestNonPersonalizedAdsOnly: true };
let ready = false;
let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;

export async function initAds() {
  if (ready) return;
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.G,
    ageRestrictedTreatment: AgeRestrictedTreatment.CHILD,
  });
  await mobileAds().initialize();
  ready = true;
  loadInterstitial();
}

function loadInterstitial() {
  interstitial = InterstitialAd.createForAdRequest(CONFIG.interstitialId, REQUEST);
  interstitialLoaded = false;
  interstitial.addAdEventListener(AdEventType.LOADED, () => { interstitialLoaded = true; });
  interstitial.addAdEventListener(AdEventType.CLOSED, () => loadInterstitial());
  interstitial.addAdEventListener(AdEventType.ERROR, () => { interstitialLoaded = false; setTimeout(loadInterstitial, 60_000); });
  interstitial.load();
}

/** Show the waiting interstitial if one is ready; otherwise skip quietly. */
export function showInterstitial(onDone?: () => void): boolean {
  if (!ready || !interstitial || !interstitialLoaded) return false;
  interstitialLoaded = false;
  const ad = interstitial, off = ad.addAdEventListener(AdEventType.CLOSED, () => { off(); onDone?.(); });
  ad.show().catch(() => { off(); onDone?.(); loadInterstitial(); });
  return true;
}

/** Load and show a rewarded ad. Resolves true only if the child watched it to the reward. */
export function showRewarded(): Promise<boolean> {
  return new Promise(resolve => {
    if (!ready) { resolve(false); return; }
    const ad = RewardedAd.createForAdRequest(CONFIG.rewardedId, REQUEST);
    let earned = false, done = false;
    const finish = (ok: boolean) => { if (done) return; done = true; clearTimeout(timer); unsub.forEach(u => u()); resolve(ok); };
    const timer = setTimeout(() => finish(false), 15_000); // no fill: give up rather than keep the child waiting
    const unsub = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => { clearTimeout(timer); ad.show().catch(() => finish(false)); }),
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { earned = true; }),
      ad.addAdEventListener(AdEventType.CLOSED, () => finish(earned)),
      ad.addAdEventListener(AdEventType.ERROR, () => finish(false)),
    ];
    ad.load();
  });
}
