// Curio Island: a thin native shell around the game, which runs in a full-screen WebView.
// The shell keeps saves, shows ads, sells the Ad-free upgrade and handles the back button.
import { useCallback, useEffect, useRef, useState, type ComponentType, type Ref } from 'react';
import { BackHandler, Linking, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { WebView, type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import gameHtml from './src/game/gameHtml';
import { initAds, showInterstitial, showRewarded } from './src/ads';
import { initPurchases, buyAdFree, restoreAdFree } from './src/purchases';

// The library's class typing collapses to `never` under current TypeScript; describe what we use.
type WebViewHandle = { injectJavaScript(script: string): void; reload(): void };
const GameView = WebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

const SAVE_KEY = 'curio-save-v1';
const ADFREE_KEY = 'curio-adfree-v1';
const BASE_URL = 'https://curio.groundlearn.app/';
const OPEN_OK = /^https:\/\/(www\.)?groundlearn\.com\//; // only our own pages, and only from Parent Corner

type FromGame =
  | { t: 'ready' } | { t: 'save'; data: Record<string, string> } | { t: 'interstitial' } | { t: 'rewarded'; id: number }
  | { t: 'buyAdFree' } | { t: 'restore' } | { t: 'openUrl'; url: string } | { t: 'exit' };

export default function App() {
  const web = useRef<WebViewHandle>(null);
  const [boot, setBoot] = useState<string | null>(null);
  const adFree = useRef(false);
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
    NavigationBar.setVisibilityAsync('hidden').catch(() => {});
    initAds().catch(() => {});
  }, []);

  const setAdFree = useCallback((v: boolean, p?: string) => {
    adFree.current = v; if (p) price.current = p;
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
        initPurchases(setAdFree).catch(() => {});
        break;
      case 'save': AsyncStorage.setItem(SAVE_KEY, JSON.stringify(m.data)).catch(() => {}); break;
      case 'interstitial': if (!adFree.current) showInterstitial(); break;
      case 'rewarded': toGame({ t: 'rewarded', id: m.id, ok: adFree.current ? false : await showRewarded() }); break;
      case 'buyAdFree': { const r = await buyAdFree(); if (r.ok) setAdFree(true); toGame({ t: 'purchase', ok: r.ok, message: r.message }); break; }
      case 'restore': { const ok = await restoreAdFree(); if (ok) setAdFree(true); toGame({ t: 'purchase', ok, message: ok ? undefined : 'No earlier purchase was found on this Google account.' }); break; }
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#141c35' } });
