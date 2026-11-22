# Curio Island: kid-safe ads on iPhone and iPad through Kidoz (https://kidoz.net/sdk-guide).
# Kidoz is certified for children's apps and documents Apple Kids Category compliance.
Pod::Spec.new do |s|
  s.name           = 'KidozAds'
  s.version        = '1.0.0'
  s.summary        = 'Kidoz interstitial and rewarded ads for Curio Island'
  s.description    = 'A small Expo module around the Kidoz iOS SDK, used by Curio Island on iPhone and iPad.'
  s.author         = 'GroundLearn'
  s.homepage       = 'https://groundlearn.com/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'KidozSDK', '10.1.5'

  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
