import type { ExpoConfig } from 'expo/config';
import { withInfoPlist, type ConfigPlugin } from 'expo/config-plugins';

// Curio Island's AdMob app (singhalsachin2003@gmail.com).
const ADMOB_APP_ID = 'ca-app-pub-4560268294594538~5396479019';

/** Kidoz's SKAdNetwork id (kid-safe ads on iOS, app/modules/kidoz-ads): the only ad network id the iOS app lists. */
const KIDOZ_SKADNETWORK = 'v79kvwwj4g.skadnetwork';

/** Removes the Google Mobile Ads keys from the iOS Info.plist (AdMob is Android-only) and leaves
 * Kidoz's SKAdNetwork id as the only one (the AdMob plugin adds Google's long list).
 * Registered on the config itself, before the `plugins` list, so its mod runs after theirs. */
const withoutIosAdMob: ConfigPlugin = c => withInfoPlist(c, mod => {
  for (const k of ['GADApplicationIdentifier', 'GADDelayAppMeasurementInit', 'NSUserTrackingUsageDescription']) delete mod.modResults[k];
  mod.modResults.SKAdNetworkItems = [{ SKAdNetworkIdentifier: KIDOZ_SKADNETWORK }];
  return mod;
});

const config: ExpoConfig = {
  name: 'Curio Island',
  slug: 'curio-island',
  owner: 'singhalsachin2003s-team',
  version: '0.2.0',
  orientation: 'default',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#141c35',
  ios: {
    bundleIdentifier: 'com.groundlearn.curio',
    // iPad too: young children often play on a family iPad. The game is a full-screen
    // WebView that follows the window size, and orientation is 'default' (all four),
    // which iPad multitasking requires. Needs 13" iPad screenshots in App Store Connect.
    supportsTablet: true,
    config: { usesNonExemptEncryption: false },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyAccessedAPITypes: [
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace', NSPrivacyAccessedAPITypeReasons: ['E174.1'] },
      ],
    },
  },
  android: {
    package: 'com.groundlearn.curio',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#141c35',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    // A children's app must not collect the advertising id.
    blockedPermissions: ['com.google.android.gms.permission.AD_ID', 'android.permission.ACCESS_ADSERVICES_AD_ID', 'android.permission.ACCESS_ADSERVICES_ATTRIBUTION', 'android.permission.ACCESS_ADSERVICES_TOPICS'],
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    // AdMob is Android-only. The iOS app is in Apple's Kids Category, where only
    // kids-certified ad networks are allowed, so the SDK is not linked on iOS
    // (react-native.config.js), the JS never imports it there (src/ads.ts) and
    // withoutIosAdMob (applied at the bottom) removes the Info.plist keys the plugin adds.
    ['react-native-google-mobile-ads', { androidAppId: ADMOB_APP_ID }],
    // Expo SDK 58 turns on R8 code shrinking by default, and it strips the WorkManager
    // database the Google ads SDK opens at startup: the app crashed before showing anything.
    ['expo-build-properties', {
      android: {
        enableMinifyInReleaseBuilds: false,
        enableShrinkResourcesInReleaseBuilds: false,
        // Kept in case shrinking is turned back on: Room builds these classes by reflection.
        extraProguardRules: '-keep class * extends androidx.room.RoomDatabase { <init>(); }\n-keep class androidx.work.impl.** { *; }',
      },
    }],
  ],
  extra: { eas: { projectId: 'ea37f0fa-bfc2-4133-816f-5065afa09f01' } },
};
export default withoutIosAdMob(config);
