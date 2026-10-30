import type { ExpoConfig } from 'expo/config';

// Google's public sample AdMob app id is used until the real one is set in EAS.
const ADMOB_APP_ID = process.env.ADMOB_ANDROID_APP_ID || 'ca-app-pub-3940256099942544~3347511713';

const config: ExpoConfig = {
  name: 'Curio Island',
  slug: 'curio-island',
  owner: process.env.EXPO_OWNER,
  version: '0.1.0',
  orientation: 'default',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#141c35',
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
    ['react-native-google-mobile-ads', { androidAppId: ADMOB_APP_ID, iosAppId: 'ca-app-pub-3940256099942544~1458002511' }],
    'expo-build-properties',
  ],
  extra: { eas: { projectId: process.env.EAS_PROJECT_ID } },
};
export default config;
