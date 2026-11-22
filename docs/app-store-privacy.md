# Curio Island on iPhone and iPad: privacy policy and App Privacy answers

The policy lives at https://groundlearn.com/curio/privacy/ (not in this repo). Today it is written for Android
only (Google Play, AdMob, the Android advertising ID, Android settings). Make the edits below on that page before
submitting to the App Store, and bump "Last updated".

## 1. Edits to existing sections

**The short version**, replace the Android-only bullets with:

- Purchases go through Google Play on Android and the App Store on iPhone and iPad. GroundLearn never sees payment details.
- On Android, ads come from Google AdMob, marked as child-directed, non-personalised and G-rated, and the Android advertising ID is not collected.
- On iPhone and iPad there is no Google AdMob. The app does not use Apple's advertising identifier (IDFA) and never shows Apple's tracking prompt.

**Advertising (Google AdMob)**: rename to "Advertising on Android (Google AdMob)". Text unchanged.

**The Ad-free upgrade (Google Play and RevenueCat)**: rename to "Purchases on Android (Google Play and RevenueCat)". Text unchanged.

**Children's privacy**: change the first sentence to: "Curio Island is designed for children. It follows Google Play's Families policy, Apple's rules for the Kids Category, COPPA, and the children's provisions of the GDPR and UK GDPR."

**Deleting your Curio Island data**: label the existing "clear storage in Android Settings" step "On Android", and add:

- On iPhone and iPad: delete the app. That removes everything Curio Island kept on the device.
- Purchase record on iPhone and iPad: email support@groundlearn.com with the subject "Curio Island data deletion" and the Order ID from Apple's receipt email. We delete the RevenueCat record within 30 days and confirm by email. This does not cancel the purchase, and it can be restored later from Parent Corner.

## 2. New section: "On iPhone and iPad"

> **On iPhone and iPad**
>
> The iPhone and iPad app works like the Android app: no accounts or sign-in, every player's progress stays on the device, and purchases, settings and links sit behind a grown-up check in Parent Corner. It is listed in Apple's Kids Category.
>
> **No tracking.** The app contains no Google AdMob and no analytics or tracking software. It does not use Apple's advertising identifier (IDFA) and never asks to track.
>
> **Free version, free trial and the whole-island unlock.** The first two levels of every lab are free. A grown-up can start a free 7-day trial and can unlock the whole island with a one-time purchase. Both go through Apple, which processes any payment. RevenueCat, our purchase-validation service, receives a random identifier created by the app and the purchase record (product, date and price), including the date the free trial was taken, which the app uses only to work out when the trial ends. RevenueCat receives no name, email or payment details. (Link to RevenueCat's privacy policy, as in the Android section.)
>
> **Parent email (optional).** As on Android, after the unlock purchase a grown-up may choose to share an email address for news about Curio Island and GroundLearn. It is never asked of a child and is never used for advertising, sold or shared.

Add this paragraph once a build with Kidoz ads (app/modules/kidoz-ads) is live on the App Store (until then the iOS app shows no ads):

> **Advertising on iPhone and iPad.** The free version may show a few ads from Kidoz, an ad network certified for children's apps (COPPA Safe Harbor through PRIVO) that follows Apple's Kids Category rules: its ads are contextual, chosen from the app's content and not from information about your child, and reviewed by people before they run. A full-screen ad appears only after a finished level, never in the first minutes. A child sees a reward ad only when they choose "Watch an ad" for a heart. There are no banner ads on iPhone and iPad. Unlocking the whole island removes ads. Kidoz receives only the technical information it needs to deliver an ad to the device; the app does not use Apple's advertising identifier and never asks to track. [Kidoz privacy policy](https://www.kidoz.net/privacy-policies)

## 3. App Store Connect > App Privacy

Answers for the build without ads. Before submitting a build with Kidoz ads, add the data types Kidoz lists on the "iOS Data Safety" page in its publisher dashboard (accounts.kidoz.net), with the purpose "Third-Party Advertising", not used for tracking.

| Question | Answer |
| --- | --- |
| Do you or your third-party partners collect data from this app? | Yes |
| Contact Info > Email Address | Collected. Purpose: Developer's Advertising or Marketing (news emails to the grown-up). Linked to the user: Yes. Used for tracking: No. |
| Purchases > Purchase History | Collected (RevenueCat). Purpose: App Functionality. Linked to the user: No (random app-created ID only). Used for tracking: No. |
| Identifiers, Location, Health, Financial Info, Contacts, User Content, Browsing/Search History, Usage Data, Diagnostics, Sensitive Info, Other | Not collected |
| Tracking (App Tracking Transparency) | No tracking; no ATT prompt |
| Privacy Policy URL | https://groundlearn.com/curio/privacy/ |

Notes:
- The short error note the app keeps for crash recovery never leaves the device, so Diagnostics is "Not collected".
- Player names, buddies, coins, hearts and progress stay on the device and are not collected.
- The privacy manifest (`app.config.ts`, `ios.privacyManifests`) already declares no tracking and lists the required-reason APIs.
