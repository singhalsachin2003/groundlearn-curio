// Messages between the game (this web page) and the Android app around it.
// In a plain browser there is no app, so ads and purchases are simulated for testing.

export type ToNative =
  | { t: 'ready' }
  | { t: 'save'; data: Record<string, string> }
  | { t: 'interstitial' }
  | { t: 'banner'; show: boolean }
  | { t: 'rewarded'; id: number }
  | { t: 'buyAdFree' }
  | { t: 'restore' }
  | { t: 'openUrl'; url: string }
  | { t: 'exit' };

export type FromNative =
  | { t: 'adFree'; value: boolean; price?: string }
  | { t: 'rewarded'; id: number; ok: boolean }
  | { t: 'purchase'; ok: boolean; message?: string }
  | { t: 'back' };

interface RNWebView { postMessage(s: string): void }
const rn = (window as unknown as { ReactNativeWebView?: RNWebView }).ReactNativeWebView;
export const inApp = !!rn;

const handlers: ((m: FromNative) => void)[] = [];
export function onNative(fn: (m: FromNative) => void) { handlers.push(fn); }
function deliver(m: FromNative) { handlers.forEach(h => h(m)); }

// The app calls window.curioNative.receive({...}) through injectJavaScript.
(window as unknown as { curioNative: { receive(m: FromNative): void } }).curioNative = { receive: deliver };

export function send(m: ToNative) {
  if (rn) { rn.postMessage(JSON.stringify(m)); return; }
  // Browser stand-ins so every flow can be tried without a phone.
  if (m.t === 'rewarded') setTimeout(() => deliver({ t: 'rewarded', id: m.id, ok: true }), 1200);
  if (m.t === 'buyAdFree' || m.t === 'restore') setTimeout(() => { deliver({ t: 'adFree', value: m.t === 'buyAdFree' }); deliver({ t: 'purchase', ok: m.t === 'buyAdFree' }); }, 600);
  if (m.t === 'openUrl') window.open(m.url, '_blank', 'noopener');
}
