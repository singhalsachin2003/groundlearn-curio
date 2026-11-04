// Curio Island: a thin native shell around the game, which runs in a full-screen WebView.
// The shell keeps saves, shows ads, sells the Ad-free upgrade and handles the back button.
import { useCallback, useEffect, useRef, useState, type ComponentType, type Ref } from 'react';
import { BackHandler, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { WebView, type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import gameHtml from './src/game/gameHtml';
// Ads and billing are loaded lazily: if either native module fails, the game still opens.
type AdsMod = typeof import('./src/ads');
type PurchasesMod = typeof import('./src/purchases');
function load<T>(name: string, get: () => T): T | null { try { return get(); } catch (e) { reportError(e, name); return null; } }
let adsMod: AdsMod | null | undefined; let buyMod: PurchasesMod | null | undefined;
const ads = () => (adsMod === undefined ? (adsMod = load('Ads module', () => require('./src/ads') as AdsMod)) : adsMod);
type BannerMod = typeof import('./src/Banner');
let bannerMod: BannerMod | null | undefined;
const bannerView = () => (bannerMod === undefined ? (bannerMod = load('Banner module', () => require('./src/Banner') as BannerMod)) : bannerMod);
const billing = () => (buyMod === undefined ? (buyMod = load('Purchases module', () => require('./src/purchases') as PurchasesMod)) : buyMod);
import { onCrash, reportError, LAST_ERROR_KEY } from './src/crash';
import { Component, type ReactNode } from 'react';

// The library's class typing collapses to `never` under current TypeScript; describe what we use.
type WebViewHandle = { injectJavaScript(script: string): void; reload(): void };
const GameView = WebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

const SAVE_KEY = 'curio-save-v1';
const ADFREE_KEY = 'curio-adfree-v1';
const BASE_URL = 'https://curio.groundlearn.app/';
const OPEN_OK = /^https:\/\/(www\.)?groundlearn\.com\//; // only our own pages, and only from Parent Corner

type FromGame =
  | { t: 'ready' } | { t: 'save'; data: Record<string, string> } | { t: 'interstitial' } | { t: 'banner'; mode: 'off' | 'space' | 'ad' } | { t: 'rewarded'; id: number }
  | { t: 'buyAdFree' } | { t: 'restore' } | { t: 'openUrl'; url: string } | { t: 'exit' };

/** Shows what went wrong instead of closing, so a tester can send a screenshot. */
function CrashScreen({ msg }: { msg: string }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text style={{ color: '#ffb423', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Something went wrong</Text>
      <Text style={{ color: '#fbf8f1', fontSize: 15, marginBottom: 16 }}>Please take a screenshot of this screen and send it to GroundLearn.</Text>
      <Text selectable style={{ color: '#c9cde4', fontSize: 12, fontFamily: 'monospace' }}>{msg}</Text>
    </ScrollView>
  );
}
class Boundary extends Component<{ children: ReactNode }, { msg: string | null }> {
  state = { msg: null as string | null };
  static getDerivedStateFromError(e: unknown) { return { msg: String((e as Error)?.stack || e) }; }
  componentDidCatch(e: unknown) { reportError(e, 'Render'); }
  render() { return this.state.msg ? <CrashScreen msg={this.state.msg} /> : this.props.children; }
}

export default function Root() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => onCrash(setMsg), []);
  if (msg) return <CrashScreen msg={msg} />;
  return <Boundary><App /></Boundary>;
}

function App() {
  const web = useRef<WebViewHandle>(null);
  const [boot, setBoot] = useState<string | null>(null);
  const adFree = useRef(false);
  const [banner, setBanner] = useState<'off' | 'space' | 'ad'>('off');
  const [adCover, setAdCover] = useState(false); // one ad at a time: no banner while an interstitial is up
  const price = useRef<string | undefined>(undefined);

  const toGame = useCallback((m: object) => {
    web.current?.injectJavaScript(`window.curioNative && window.curioNative.receive(${JSON.stringify(m)}); true;`);
  }, []);

  // Load the saved game before the page starts, so it can read it synchronously.
  useEffect(() => {
    (async () => {
      const [save, af] = await Promise.all([AsyncStorage.getItem(SAVE_KEY), AsyncStorage.getItem(ADFREE_KEY)]);
      adFree.current = af === '1';
      setBoot(`window.__CURIO_SAVE = ${save || '{}'}; true;`);
    })();
    try { NavigationBar.setVisibilityAsync('hidden').catch(() => {}); } catch (e) { reportError(e, 'Navigation bar'); }
    // Ads start a moment after launch so a problem there can never stop the app opening.
    const t = setTimeout(() => { try { ads()?.initAds().catch(e => reportError(e, 'Ads')); } catch (e) { reportError(e, 'Ads'); } }, 1500);
    AsyncStorage.getItem(LAST_ERROR_KEY).then(v => { if (v) { console.warn('Last error:', v); AsyncStorage.removeItem(LAST_ERROR_KEY).catch(() => {}); } }).catch(() => {});
    return () => clearTimeout(t);
  }, []);

  const setAdFree = useCallback((v: boolean, p?: string) => {
    adFree.current = v; if (p) price.current = p; if (v) setBanner('off');
    AsyncStorage.setItem(ADFREE_KEY, v ? '1' : '0').catch(() => {});
    toGame({ t: 'adFree', value: v, price: price.current });
  }, [toGame]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { toGame({ t: 'back' }); return true; });
    return () => sub.remove();
  }, [toGame]);

  const onMessage = useCallback(async (e: WebViewMessageEvent) => {
    let m: FromGame; try { m = JSON.parse(e.nativeEvent.data); } catch { return; }
    switch (m.t) {
      case 'ready':
        toGame({ t: 'adFree', value: adFree.current, price: price.current });
        try { billing()?.initPurchases(setAdFree).catch(e => reportError(e, 'Purchases')); } catch (e) { reportError(e, 'Purchases'); }
        break;
      case 'save': AsyncStorage.setItem(SAVE_KEY, JSON.stringify(m.data)).catch(() => {}); break;
      case 'interstitial': if (!adFree.current) { setAdCover(true); if (!ads()?.showInterstitial(() => setAdCover(false))) setAdCover(false); } break;
      case 'banner': setBanner(adFree.current ? 'off' : m.mode); break;
      case 'rewarded': { const a = ads(); setAdCover(true); const ok = adFree.current || !a ? false : await a.showRewarded(); setAdCover(false); toGame({ t: 'rewarded', id: m.id, ok }); break; }
      case 'buyAdFree': { const b = billing(); const r = b ? await b.buyAdFree() : { ok: false, message: 'Purchases are not available right now.' }; if (r.ok) setAdFree(true); toGame({ t: 'purchase', ok: r.ok, message: r.message }); break; }
      case 'restore': { const b = billing(); const ok = b ? await b.restoreAdFree() : false; if (ok) setAdFree(true); toGame({ t: 'purchase', ok, message: ok ? undefined : 'No earlier purchase was found on this Google account.' }); break; }
      case 'openUrl': if (OPEN_OK.test(m.url)) Linking.openURL(m.url).catch(() => {}); break;
      case 'exit': BackHandler.exitApp(); break;
    }
  }, [toGame, setAdFree]);

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        {boot && (
          <GameView
            ref={web}
            style={styles.root}
            originWhitelist={['*']}
            source={{ html: gameHtml, baseUrl: BASE_URL }}
            injectedJavaScriptBeforeContentLoaded={boot}
            onMessage={onMessage}
            javaScriptEnabled
            domStorageEnabled
            mediaPlaybackRequiresUserAction={false}
            setSupportMultipleWindows={false}
            overScrollMode="never"
            textZoom={100}
            allowsBackForwardNavigationGestures={false}
            onShouldStartLoadWithRequest={r => r.url.startsWith(BASE_URL) || r.url.startsWith('about:')}
            onRenderProcessGone={() => web.current?.reload()}
          />
        )}
        {!boot && <View style={styles.root} />}
        {banner !== 'off' && (() => { const B = bannerView()?.default; return B ? <B adOn={banner === 'ad' && !adCover} /> : null; })()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#141c35' } });
