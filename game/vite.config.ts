import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { WEB_ADS } from './web-ads.config';

// App build (default): everything (three.js, fonts, worlds, voices) is inlined into one HTML
// file, because the Android and iOS apps load the game from a string with no file server.
//
// Web build (`vite build --mode web`, for groundlearn.com/play/curio-island/): normal split
// files, so the island loads first and each lab world and voice clip downloads when needed.
export default defineConfig(({ mode }) => {
  if (mode !== 'web') {
    return {
      base: './',
      plugins: [viteSingleFile()],
      build: { target: 'es2019', assetsInlineLimit: 100_000_000, cssCodeSplit: false, chunkSizeWarningLimit: 4000 },
    };
  }
  return {
    base: './',
    publicDir: 'public-web',
    plugins: [webVoices(), webHead()],
    build: {
      target: 'es2019',
      outDir: 'dist-web',
      emptyOutDir: true,
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1200,
      rollupOptions: { output: { manualChunks: id => (id.includes('node_modules/three/') ? 'three' : undefined) } },
    },
  };
});

/** On the web, modules that inline big files are swapped for ones that fetch them:
 * `./vo` → the map of small .mp3 files made by scripts/web-vo.mjs, `./fonts` → fonts as separate files. */
const WEB_SWAP: Record<string, string> = { './vo': 'vo.web.gen.ts', './fonts': 'fonts.web.ts' };
function webVoices(): Plugin {
  return {
    name: 'curio-web-voices',
    enforce: 'pre',
    resolveId(source, importer) {
      const swap = WEB_SWAP[source];
      if (swap && importer && /[\\/]src[\\/][^\\/]+\.ts$/.test(importer)) return importer.replace(/[^\\/]+\.ts$/, swap);
      return null;
    },
  };
}

/** Page title, description, icons, install manifest and the offline cache, for the web page only. */
function webHead(): Plugin {
  const url = 'https://groundlearn.com/play/curio-island/';
  const desc = 'Play Curio Island free in your browser: 57 hands-on science and maths labs for kids aged 4 to 12, in English and Hindi, with Sheru the lion. By GroundLearn.';
  return {
    name: 'curio-web-head',
    transformIndexHtml(html) {
      return html
        .replace('<title>Curio Island</title>', `<title>Play Curio Island free: science and maths labs for kids | GroundLearn</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#141c35">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GroundLearn">
<meta property="og:title" content="Play Curio Island free in your browser">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://curioisland.groundlearn.com/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<style>html,body{background:#141c35;margin:0}#app:empty::before{content:"Loading Curio Island…";display:grid;place-items:center;height:100vh;color:#f6ecd6;font:600 18px system-ui,sans-serif}</style>
<script>window.__CURIO_PLATFORM='web';window.__CURIO_ADS=${!!WEB_ADS.client};window.__CURIO_WEBADS=${JSON.stringify(WEB_ADS)};</script>`)
        .replace('<div id="app"></div>', `<div id="app"></div>
<noscript><p style="color:#fff;font:16px system-ui;padding:24px">Curio Island needs JavaScript turned on. <a style="color:#ffd166" href="https://curioisland.groundlearn.com/">About Curio Island</a></p></noscript>
<script>if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});</script>`);
    },
  };
}
