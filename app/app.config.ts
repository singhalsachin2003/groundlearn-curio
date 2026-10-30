import type { ExpoConfig } from 'expo/config';

// Curio Island's AdMob app (singhalsachin2003@gmail.com).
const ADMOB_APP_ID = 'ca-app-pub-4560268294594538~5396479019';

const config: ExpoConfig = {
  name: 'Curio Island',
  slug: 'curio-island',
  owner: 'singhalsachin2003s-team',
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
  extra: { eas: { projectId: 'ea37f0fa-bfc2-4133-816f-5065afa09f01' } },
};
export default config;
