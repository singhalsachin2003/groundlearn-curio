// No-ads build: used anywhere without an ads.<platform>.ts (iOS uses ads.ios.ts, Kidoz; Android picks
// ads.android.ts (AdMob) instead; Metro prefers the platform file, so this one never
// ships there and the iOS bundle never imports react-native-google-mobile-ads.
//
// iOS is published in Apple's Kids Category, where only kids-certified ad networks are
// allowed (guideline 1.3). The planned network is SuperAwesome (AwesomeAds,
// https://www.superawesome.com/superawesome-ad-standards). Until its placement ids
// exist and a native module is added, iOS shows no ads at all and every ad request
// answers "not available", so the game hides ad offers instead of showing dead buttons.

/** Whether this build can show ads at all. The game hides ad offers when false. */
export const available = false;

export async function initAds() {}

/** Nothing to show: callers carry on as if the ad was skipped. */
export function showInterstitial(_onDone?: () => void): boolean { return false; }

/** No rewarded ads in this build: the child never gets a reward for an ad that cannot play. */
export function showRewarded(): Promise<boolean> { return Promise.resolve(false); }
