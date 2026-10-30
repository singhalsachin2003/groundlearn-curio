# Curio Island

GroundLearn's 3D science and maths game for kids aged 4–13. The plan doc has the design, the content plan by age band and the rounds.

## How it is built

```
game/   The game itself: TypeScript + three.js (r128), built by Vite into ONE html file.
  src/        The app shell: players, island hub, coins and hearts, Journal, parent gate, Parent Corner.
  worlds/     The playable prototypes, unchanged except for small hooks:
              colour.html (Colour Studio) and inventor.html (the 12 Inventor labs).
  tests/      Smoke test in headless Chromium (Playwright).
app/    The Android app (Expo). A full-screen WebView runs the game; the native side keeps
        saves, shows AdMob ads, sells the Ad-free upgrade (RevenueCat) and handles Back.
```

Each world runs in its own iframe and borrows the shell's three.js and fonts, so the game works offline. When a world saves, the shell copies the save into the current player's slot and pays coins for new levels, stars and discoveries. Rules (coins, hearts, refill times, ad spacing) live in `game/src/state.ts` → `RULES`.

## Run it

```bash
npm run setup          # install both projects
npm run build:game     # builds game/dist/index.html and app/src/game/gameHtml.ts
npx --prefix game vite game          # play in a browser (ads and purchases are simulated)
python3 -I game/tests/smoke.py /tmp/shots   # smoke test (needs Playwright + Chromium)
```

The app needs a development build (ads and billing do not run in Expo Go):

```bash
cd app
npx eas-cli build --profile development --platform android   # install the APK on a phone
npx expo start --dev-client
```

EAS runs `npm run build:game` itself before every build (`eas-build-post-install`).

## Before the first Play Store release

| Step | Where | Notes |
|---|---|---|
| Create the AdMob app and two ad units (interstitial, rewarded) | AdMob | Mark the app as directed to children. |
| Set `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID`, `EXPO_PUBLIC_ADMOB_REWARDED_ID` | EAS environment variables | Without them the build uses Google's test ads. |
| Create the in-app product `curio_ad_free` (one-time, ₹99) | Play Console | Non-consumable. |
| Add it to RevenueCat with entitlement `ad_free`; set `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat, EAS | Same RevenueCat account as OTC Learn and Cornerstone. |
| Publish the privacy policy at `https://groundlearn.com/curio/privacy` | groundlearn.com | Linked from Parent Corner. |
| Target audience and content: ages 5 and under, 6–8, 9–12; Families Policy; Data safety form | Play Console | No accounts, no personal data; AdMob collects device data for ads. |
| Replace the placeholder icon and splash | `app/assets` | |
