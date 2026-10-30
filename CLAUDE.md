# Notes for Claude

- Two projects: `game/` (Vite + TypeScript + three.js 0.128, single-file build) and `app/` (Expo SDK 58, WebView shell). Build the game before running or exporting the app.
- Expo changes every SDK. Before touching an Expo or React Native API, read the versioned docs for the SDK in `app/package.json` (https://docs.expo.dev/versions/v58.0.0/) and https://docs.expo.dev/llms.txt. Install native packages with `npx expo install`.
- `react-native-webview`'s class typing collapses to `never`; App.tsx casts it to `GameView`.
- three.js is pinned to 0.128 because the worlds were written for it (lighting and colour defaults changed later).
- The worlds in `game/worlds/` are the original prototype pages. Keep edits there small and marked; shell features belong in `game/src/`.
- World → shell API (`window.curio` inside a world): `canAnswer()` before a challenge answer, `answer(correct, lab)` after it. Levels and discoveries are rewarded by diffing the world's save, so new labs need entries in `game/src/labs.ts`.
- Kids' app rules: child-directed, non-personalised, G-rated ads; no AD_ID permission; ads only at breaks and never in the first 3 minutes; rewarded ads only for hearts; coins never bought with money; parent gate before purchases, settings and links.
- Check: `npm run typecheck`, `npm run build:game`, then `python3 -I game/tests/smoke.py /tmp/shots`.
