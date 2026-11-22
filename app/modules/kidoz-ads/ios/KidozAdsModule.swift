// Curio Island on iPhone and iPad: kid-safe full-screen and rewarded ads through Kidoz.
// The game decides when an ad may appear (only after a finished level, and only when a
// child chooses "watch an ad"); this module just loads and shows what it is asked for.
// API taken from Kidoz's Swift sample app (Kidoz-SDK/kidoz-mobile-sdk, Direct/iOS, SDK 10.1.5).
import ExpoModulesCore
import KidozSDK
import UIKit

public class KidozAdsModule: Module {
  private let ads = KidozAdsBridge()

  public func definition() -> ModuleDefinition {
    Name("KidozAds")

    /// Start the Kidoz SDK. Resolves true once it is ready, false if it could not start.
    AsyncFunction("initialize") { (publisherId: String, securityToken: String, promise: Promise) in
      self.ads.initialize(publisherId: publisherId, securityToken: securityToken) { ok in promise.resolve(ok) }
    }.runOnQueue(.main)

    /// Load a full-screen ad in the background so it is ready at the next break.
    AsyncFunction("loadInterstitial") {
      self.ads.loadInterstitial()
    }.runOnQueue(.main)

    /// Show the loaded full-screen ad. Resolves true when it has been closed, false if none was ready.
    AsyncFunction("showInterstitial") { (promise: Promise) in
      self.ads.showInterstitial { shown in promise.resolve(shown) }
    }.runOnQueue(.main)

    /// Load and show a rewarded ad. Resolves true only if the child watched it to the reward.
    AsyncFunction("showRewarded") { (promise: Promise) in
      self.ads.showRewarded { earned in promise.resolve(earned) }
    }.runOnQueue(.main)
  }
}

/// Holds the Kidoz delegates (they must be NSObject) and the callbacks waiting on them.
public class KidozAdsBridge: NSObject, KidozInitDelegate, KidozInterstitialDelegate, KidozRewardedDelegate {
  private var onInit: ((Bool) -> Void)?
  private var interstitial: KidozInterstitialAd?
  private var interstitialLoading = false
  private var onInterstitialDone: ((Bool) -> Void)?
  private var rewarded: KidozRewardedAd?
  private var onRewardedDone: ((Bool) -> Void)?
  private var earned = false

  func initialize(publisherId: String, securityToken: String, done: @escaping (Bool) -> Void) {
    if Kidoz.instance.isSDKInitialized() { done(true); return }
    onInit = done
    Kidoz.instance.initialize(publisherID: publisherId, securityToken: securityToken, delegate: self)
  }

  public func onInitSuccess() { onInit?(true); onInit = nil; loadInterstitial() }
  public func onInitError(_ errorMessage: String) { onInit?(false); onInit = nil }

  // MARK: full-screen ads at a break

  func loadInterstitial() {
    guard Kidoz.instance.isSDKInitialized(), interstitial == nil, !interstitialLoading else { return }
    interstitialLoading = true
    KidozInterstitialAd.load(delegate: self)
  }

  func showInterstitial(done: @escaping (Bool) -> Void) {
    guard let ad = interstitial, ad.isLoaded(), let vc = Self.topViewController() else { done(false); loadInterstitial(); return }
    interstitial = nil
    onInterstitialDone = done
    ad.show(viewController: vc)
  }

  public func onInterstitialAdLoaded(kidozInterstitialAd ad: KidozInterstitialAd) { interstitialLoading = false; interstitial = ad }
  public func onInterstitialAdFailedToLoad(kidozError error: KidozError) {
    interstitialLoading = false
    DispatchQueue.main.asyncAfter(deadline: .now() + 60) { [weak self] in self?.loadInterstitial() }
  }
  public func onInterstitialAdShown(kidozInterstitialAd ad: KidozInterstitialAd) {}
  public func onInterstitialImpression(kidozInterstitialAd: KidozInterstitialAd) {}
  public func onInterstitialAdFailedToShow(kidozInterstitialAd: KidozInterstitialAd, kidozError: KidozError) {
    onInterstitialDone?(false); onInterstitialDone = nil; loadInterstitial()
  }
  public func onInterstitialAdClosed(kidozInterstitialAd ad: KidozInterstitialAd) {
    onInterstitialDone?(true); onInterstitialDone = nil; loadInterstitial()
  }

  // MARK: rewarded ads the child chose

  func showRewarded(done: @escaping (Bool) -> Void) {
    guard Kidoz.instance.isSDKInitialized(), onRewardedDone == nil else { done(false); return }
    onRewardedDone = done
    earned = false
    KidozRewardedAd.load(delegate: self)
    // No ad within 15 seconds: give the button back rather than keep the child waiting.
    DispatchQueue.main.asyncAfter(deadline: .now() + 15) { [weak self] in
      guard let self = self, self.onRewardedDone != nil, self.rewarded == nil else { return }
      self.finishRewarded(false)
    }
  }

  private func finishRewarded(_ ok: Bool) { onRewardedDone?(ok); onRewardedDone = nil; rewarded = nil }

  public func onRewardedAdLoaded(kidozRewardedAd ad: KidozRewardedAd) {
    guard onRewardedDone != nil else { return } // the game already gave up waiting
    guard let vc = Self.topViewController() else { finishRewarded(false); return }
    rewarded = ad
    ad.show(viewController: vc)
  }
  public func onRewardedAdFailedToLoad(kidozError error: KidozError) { finishRewarded(false) }
  public func onRewardedAdShown(kidozRewardedAd ad: KidozRewardedAd) {}
  public func onRewardedImpression(kidozRewardedAd: KidozRewardedAd) {}
  public func onRewardedAdFailedToShow(kidozRewardedAd: KidozRewardedAd, kidozError: KidozError) { finishRewarded(false) }
  public func onRewardReceived(kidozRewardedAd ad: KidozRewardedAd) { earned = true }
  public func onRewardedAdClosed(kidozRewardedAd ad: KidozRewardedAd) { finishRewarded(earned) }

  /// The screen on top right now, so the ad is presented over the game.
  static func topViewController() -> UIViewController? {
    let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
    let window = scenes.flatMap { $0.windows }.first { $0.isKeyWindow } ?? scenes.first?.windows.first
    var vc = window?.rootViewController
    while let next = vc?.presentedViewController { vc = next }
    return vc
  }
}
