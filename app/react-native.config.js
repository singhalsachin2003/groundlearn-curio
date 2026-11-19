// AdMob is Android-only: the iOS app is in Apple's Kids Category, where Google's ads SDK
// is not allowed. This keeps the native SDK (and its pods) out of the iOS build.
module.exports = {
  dependencies: {
    'react-native-google-mobile-ads': { platforms: { ios: null } },
  },
};
