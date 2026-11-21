// Ads in the web version, through Google's Ad Placement API (H5 Games Ads) and one AdSense
// banner unit. The game asks for ads exactly as it does in the app (native.ts `send`), and the
// same rules apply: never in the first minutes, only at breaks, rewarded ads only when the child
// chooses one. Every request is tagged for child treatment (no personalised ads).
// Settings: game/web-ads.config.ts, placed on the page by the web build as window.__CURIO_WEBADS.

export interface WebAdsConfig { client: string; banner?: string; test?: boolean }

type AdBreakParams = Record<string, unknown>;
type W = Window & { adsbygoogle?: unknown[]; __CURIO_WEBADS?: WebAdsConfig };
const win = window as W;
const push = (o: AdBreakParams) => { (win.adsbygoogle = win.adsbygoogle || []).push(o); };

let cfg: WebAdsConfig | null = null;
let busy = false; // one full-screen ad at a time

/** Load Google's ad script once. Called only when the page has an ad client set. */
export function initWebAds(c: WebAdsConfig) {
  if (cfg || !c.client) return;
  cfg = c;
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(c.client);
  s.setAttribute('data-tag-for-age-treatment', '1'); // child treatment: no interest-based or remarketing ads
  s.setAttribute('data-ad-frequency-hint', '180s');
  if (c.test) s.setAttribute('data-adbreak-test', 'on');
  document.head.appendChild(s);
  push({ preloadAdBreaks: 'on', sound: 'on' }); // adConfig
}

/** A full-screen ad between levels. Google may skip it (frequency, no ad ready); the game carries on either way. */
export function webInterstitial() {
  if (!cfg || busy) return;
  busy = true;
  push({ type: 'next', name: 'level-done', adBreakDone: () => { busy = false; } });
}

/** A rewarded ad the child chose. `done(true)` only if the ad was watched to the end. */
export function webRewarded(done: (ok: boolean) => void) {
  if (!cfg || busy) { done(false); return; }
  busy = true;
  let ok = false, finished = false, showing = false;
  const finish = () => { if (finished) return; finished = true; busy = false; done(ok); };
  push({
    type: 'reward',
    name: 'curio-reward',
    beforeReward: (showAdFn: () => void) => { showing = true; showAdFn(); }, // the child already said yes in the game
    adViewed: () => { ok = true; },
    adDismissed: () => { ok = false; },
    adBreakDone: finish,
  });
  // No answer at all (ad blocker, slow network): give the button back instead of spinning forever.
  setTimeout(() => { if (!showing) finish(); }, 6000);
}

/** The small banner under the island (and Parent Corner): 'space' keeps its room, 'ad' fills it, 'off' removes it. */
let bar: HTMLElement | null = null, filled = false;
export function webBanner(mode: 'off' | 'space' | 'ad') {
  if (!cfg?.banner) return;
  const root = document.documentElement;
  if (mode === 'off') {
    if (bar) bar.hidden = true;
    root.style.removeProperty('--webBanner');
  } else {
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'web-banner';
      bar.setAttribute('aria-label', 'Advertisement');
      const wide = innerWidth >= 760;
      bar.innerHTML = `<ins class="adsbygoogle" style="display:inline-block;width:${wide ? 728 : 320}px;height:${wide ? 90 : 50}px"
        data-ad-client="${cfg.client}" data-ad-slot="${cfg.banner}" data-tag-for-age-treatment="1"${cfg.test ? ' data-adtest="on"' : ''}></ins>`;
      bar.style.setProperty('--h', (wide ? 90 : 50) + 'px');
      document.body.appendChild(bar);
    }
    bar.hidden = false;
    root.style.setProperty('--webBanner', `calc(${bar.style.getPropertyValue('--h')} + 10px + env(safe-area-inset-bottom, 0px))`);
    if (mode === 'ad' && !filled) { filled = true; try { push({}); } catch { /* blocked */ } }
  }
  window.dispatchEvent(new Event('resize')); // the island re-fits above the banner
}
