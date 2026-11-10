# Curio Island

GroundLearn's 3D science and maths game for kids aged 4–13+. The plan doc has the design, the content plan by age band and the rounds.

## How it is built

```
game/   The game itself: TypeScript + three.js (r128), built by Vite into ONE html file.
  src/        The app shell: players, island hub, coins and hearts, Journal, parent gate, Parent Corner.
  worlds/     The playable worlds, one set of labs per age band (Explorer 4-7, Tinkerer 7-10, Inventor 10+).
              Each band sees Colour Studio (which adapts to the band) plus its own labs only:
              explorer.html     15 no-reading labs (a voice reads each task; wrong answers cost nothing), e.g. Fizz Kitchen,
                                See-saw Animals, Clock Time, Colour Mixing, Float or Sink, Count Them, Animal Homes
              tinkerer.html     6 labs: Atom Snap, Kitchen Reactions, Mirror Maze, Coordinate Pictures, Pea Crosses, Food Chains
              inventor.html     12 labs (molecules to ecosystems)
              inventor2.html    18 data-driven labs for the Tinkerer and Inventor bands (States of Matter … Acids and Bases,
                                Coloured Light, Angle Maker, Magnet Hunt, Life Cycles). A new lab here is a LABS entry plus a MOUNT function.
              colour.html       Colour Studio (all bands)
              Which lab belongs to which band: `only` and `labsFor()` in game/src/labs.ts and daily.ts.
              Hindi: inventor.html through game/src/hi/translate.ts, tinkerer.html through game/src/hi/tinkerer.ts,
              explorer.html and inventor2.html carry their own English/Hindi pairs; worked examples are in examples.ts / examples_hi.ts.
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

## Accounts and ids (set up 30 Oct 2026)

| Service | What exists |
|---|---|
| Play Console (GroundLearn, singhalsachin2003@gmail.com) | App **Curio Island**, package `com.groundlearn.curio`, free, game |
| AdMob (same Google account) | App `ca-app-pub-4560268294594538~5396479019`; interstitial `…/4083397349`; rewarded (reward: 1 Heart) `…/2770315674` |
| RevenueCat | Project **Curio Island**; Play Store app; entitlement `ad_free` ← product `curio_ad_free` (non-consumable) |
| Expo | Project `@singhalsachin2003s-team/curio-island` (`ea37f0fa-bfc2-4133-816f-5065afa09f01`) |

The ad ids and RevenueCat's public SDK key are in `app/src/config.ts`. Development and preview builds always use Google's test ads.

## Build the app

1. Once: create an Expo access token (expo.dev → Account settings → Access tokens) and add it to this repo as the Actions secret `EXPO_TOKEN`.
2. GitHub → Actions → **EAS build** → Run workflow → `preview` for an APK to install on a phone, or `production` for the Play .aab.
3. The build appears on expo.dev under the curio-island project; download it from there.

## Before the first Play Store release

| Step | Where | Notes |
|---|---|---|
| Link the AdMob app to the Play listing once it is live | AdMob → App settings | Ads serve fully only after AdMob's app review. |
| Create the in-app product `curio_ad_free` (one-time, ₹99) after the first .aab is uploaded | Play Console → Monetise → In-app products | Play needs a build with billing before products can be made. |
| Upload the Play service-account JSON in RevenueCat (Curio Island → Apps → Play Store) | RevenueCat | The same JSON used for OTC Learn and Cornerstone works. |
| Keep the privacy policy live at `https://groundlearn.com/curio/privacy` | groundlearn.com | Linked from Parent Corner and the Play listing. |
| Target audience and content: ages 5 and under, 6–8, 9–12; Families Policy; Data safety form | Play Console | No accounts, no personal data; AdMob collects device data for ads. |

## Parent email (optional)

When a grown-up buys Ad-free (behind the parent gate) the app asks, optionally, for an email address (`game/src/subscribe.ts`). It is never kept on the device; it is posted to the Supabase table `public.curio_parents` (insert-only for the app, see `supabase/curio_parents.sql`). The table exists in the OTCLearn Supabase project (created 4 Nov 2026). The Play Data safety form and the privacy page must say that an optional email address is collected; ready-to-paste wording is in `supabase/privacy-and-data-safety-wording.md`.
