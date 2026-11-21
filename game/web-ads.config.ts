// Ads on the web version (groundlearn.com/play/curio-island/), through Google's Ad Placement
// API (H5 Games Ads) and one AdSense banner unit. Leave `client` empty to turn web ads off.
//
// Before turning them on for real:
//  1. AdSense must be approved for groundlearn.com, and H5 Games Ads approved for the account.
//  2. Turn OFF Auto ads for groundlearn.com in AdSense, so Google never places ads inside the game.
//  3. Set `test` to false. While it is true, Google shows test ads only (nothing is earned).
export const WEB_ADS = {
  /** AdSense publisher id, e.g. 'ca-pub-4560268294594538'. Empty = no ads on the web. */
  client: '',
  /** AdSense display unit id (numbers only) for the small banner under the island. Empty = no banner. */
  banner: '',
  /** Google test ads (data-adbreak-test="on"). */
  test: true,
};
