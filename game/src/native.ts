// Messages between the game (this web page) and the Android app around it.
// In a plain browser there is no app, so ads and purchases are simulated for testing.

export type ToNative =
  | { t: 'ready' }
  | { t: 'save'; data: Record<string, string> }
  | { t: 'interstitial' }
  | { t: 'banner'; mode: 'off' | 'space' | 'ad' }
  | { t: 'rewarded'; id: number }
  | { t: 'buyAdFree' }
  | { t: 'restore' }
  | { t: 'openUrl'; url: string }
  | { t: 'share'; text: string; png?: string }
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
  if (m.t === 'share') {
    // In a browser: the system share sheet if there is one, otherwise save the picture or copy the text.
    const nav = navigator as Navigator & { share?: (d: { text?: string; files?: File[] }) => Promise<void>; canShare?: (d: { files?: File[] }) => boolean };
    const file = m.png ? new File([Uint8Array.from(atob(m.png), c => c.charCodeAt(0))], 'curio-island-certificate.png', { type: 'image/png' }) : null;
    if (file && nav.canShare?.({ files: [file] })) void nav.share!({ text: m.text, files: [file] }).catch(() => {});
    else if (file) { const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    else if (nav.share) void nav.share({ text: m.text }).catch(() => {});
    else void navigator.clipboard?.writeText(m.text).catch(() => {});
  }
}
