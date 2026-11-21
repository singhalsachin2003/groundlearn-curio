// A world is one of the original prototype pages (Colour Studio, Inventor Lab). Each runs
// in its own iframe so their code and element ids never clash, but shares this page's
// three.js and fonts so the app works offline and stays small.
import * as THREE_NS from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { WorldId } from './labs';
import { installFonts } from './fonts';
import { makeTranslator } from './hi/translate';
import { VO } from './vo';
import { makeTinkererTranslator } from './hi/tinkerer';

// Each world page is loaded when first needed. In the app's single-file build these
// imports are inlined and resolve at once; on the web each world is its own small file.
const LOAD: Record<WorldId, () => Promise<{ default: string }>> = {
  colour: () => import('../worlds/colour.html?raw'),
  inventor: () => import('../worlds/inventor.html?raw'),
  tinkerer: () => import('../worlds/tinkerer.html?raw'),
  explorer: () => import('../worlds/explorer.html?raw'),
  inventor2: () => import('../worlds/inventor2.html?raw'),
};
const SRC: Partial<Record<WorldId, string>> = {};
const pending: Partial<Record<WorldId, Promise<string>>> = {};
/** Fetch a world's page (once). Retries on the next call if the network failed. */
export function loadWorld(id: WorldId): Promise<string> {
  if (SRC[id]) return Promise.resolve(SRC[id]!);
  return (pending[id] ||= LOAD[id]().then(m => (SRC[id] = m.default), e => { delete pending[id]; throw e; }));
}
/** Warm every world in the background (after the island is showing) so opening a lab is instant. */
export function preloadWorlds() {
  (Object.keys(LOAD) as WorldId[]).forEach((id, i) => setTimeout(() => { loadWorld(id).catch(() => { /* tried again on open */ }); }, 400 * i));
}

// The prototypes expect a global THREE with OrbitControls attached, as the CDN build had.
(window as unknown as Record<string, unknown>).curioTHREE = Object.assign({}, THREE_NS, { OrbitControls });
(window as unknown as Record<string, unknown>).curioInstallFonts = installFonts;
(window as unknown as Record<string, unknown>).curioVO = VO;
(window as unknown as Record<string, unknown>).curioMakeTR = makeTranslator;
(window as unknown as Record<string, unknown>).curioMakeTK = makeTinkererTranslator;
/** Language for the next world: Hindi turns on the Inventor Lab translator. */
export function setWorldLang(l: string) { (window as unknown as Record<string, unknown>).curioLang = l; }

/** Hide each world's own brand, game tabs, age, language and sound controls: the app shell owns those. */
const HIDE: Record<WorldId, string> = {
  inventor: '.top-row>*{display:none!important}.top-row{min-height:46px}',
  tinkerer: '.top-row>*{display:none!important}.top-row{min-height:46px}',
  explorer: '',
  inventor2: '',
  colour: '.hud-top .row>*{display:none!important}.hud-top .row{min-height:46px}',
};

/** A shared coat of paint for every world: warmer glow, twinkling stars, softer cards and pressable buttons. */
const POLISH = `html body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:radial-gradient(circle at 12% 16%,rgba(255,255,255,.7) 0 1.3px,transparent 2.4px),radial-gradient(circle at 78% 10%,rgba(255,255,255,.6) 0 1.1px,transparent 2.2px),radial-gradient(circle at 44% 30%,rgba(255,255,255,.45) 0 1px,transparent 2px),radial-gradient(circle at 90% 44%,rgba(255,255,255,.5) 0 1.2px,transparent 2.2px),radial-gradient(circle at 24% 62%,rgba(255,255,255,.4) 0 1px,transparent 2px),radial-gradient(circle at 64% 80%,rgba(255,255,255,.5) 0 1.2px,transparent 2.2px);animation:curio-tw 5s ease-in-out infinite alternate}
@keyframes curio-tw{from{opacity:.3}to{opacity:.95}}
html body .card,html body .modal{background:linear-gradient(#fffdf6,#f6ecd6)}
html body .btn{background:linear-gradient(#fffdf6,#f3e8cf);transition:transform .08s,box-shadow .08s}
html body .btn:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
html body .btn.primary,html body .btn.sel{background:linear-gradient(#ffcf5c,#ffb423)}
html body canvas{box-shadow:0 6px 18px rgba(0,0,0,.35)}
@keyframes curio-drift{from{transform:translateX(-100%)}to{transform:translateX(100vw)}}
@media (prefers-reduced-motion:reduce){html body::before{animation:none;opacity:.7}html body::after{display:none}}`;
const drift = (e: string, top: string) => `html body::after{content:"${e}        ${e}       ${e}";position:fixed;top:${top};left:0;white-space:pre;font-size:34px;opacity:.13;pointer-events:none;z-index:-1;animation:curio-drift 70s linear infinite}`;
// Child-sized controls for the lab worlds: 44px+ tap targets, a real hint button, bigger
// instruction text, a chunky slider thumb and a darker label colour that passes contrast.
const KIDUI = `html body .nav{display:inline-flex;flex:none;white-space:nowrap}
html body .nav button{width:44px;height:44px;border-radius:12px;font-size:22px;margin-left:6px}
html body #mHintBtn{min-height:44px;padding:0 16px;border:2px solid var(--ink);border-radius:999px;background:#fff1bf;box-shadow:0 2px 0 var(--ink);text-decoration:none;font-size:15px;font-weight:700;display:inline-flex;align-items:center;gap:6px}
html body #mHintBtn::before{content:"💡"}
html body #mShow{min-height:44px;padding:0 16px;border-radius:999px;background:#d9f2ff;font-size:15px;font-weight:700}
html body #mHintBtn.nudge{animation:kid-nudge 1.2s ease-in-out infinite}@keyframes kid-nudge{0%,60%,100%{transform:none}70%{transform:rotate(-6deg) scale(1.08)}85%{transform:rotate(6deg) scale(1.08)}}
html body .step{width:44px;height:44px;border-radius:12px;font-size:22px}
html body .btn{min-height:44px}
html body .mission p,html body #mText{font-size:17px;line-height:1.4}
html body .mission .meta,html body .card .meta{color:#a8361f;font-size:13px}
html body .slider{grid-template-columns:62px 44px minmax(0,1fr) 44px 76px}
html body input[type=range]{-webkit-appearance:none;appearance:none;height:44px;background:transparent}
html body input[type=range]::-webkit-slider-runnable-track{height:10px;border-radius:999px;background:#e6dcc4;border:2px solid var(--ink)}
html body input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;margin-top:-12px;border-radius:50%;background:var(--marigold);border:3px solid var(--ink);box-shadow:0 2px 0 var(--ink)}
html body input[type=range]::-moz-range-track{height:10px;border-radius:999px;background:#e6dcc4;border:2px solid var(--ink)}
html body input[type=range]::-moz-range-thumb{width:26px;height:26px;border-radius:50%;background:var(--marigold);border:3px solid var(--ink)}
html body input[type=range]:disabled{opacity:.45}
@media (max-width:560px){html body .slider{grid-template-columns:46px 44px minmax(0,1fr) 44px 66px;gap:6px}html body .mission p{font-size:16px}}`;
const KID_WORLDS: WorldId[] = ['inventor', 'tinkerer', 'inventor2'];

// Explorer world: a soft stage for the picture, rolling hills behind the buttons and a gentle bob, so the screen never feels empty.
const EXPLORER_LOOK = `html body #app::before{content:"";position:fixed;left:-10%;right:-10%;bottom:0;height:30vh;z-index:-1;pointer-events:none;
background:radial-gradient(58% 100% at 22% 100%,#2c8a63 0 62%,transparent 63%),radial-gradient(66% 84% at 78% 100%,#226f55 0 62%,transparent 63%),radial-gradient(90% 46% at 50% 100%,#1b5a49 0 62%,transparent 63%)}
html body #scene{background:radial-gradient(80% 70% at 50% 40%,rgba(255,255,255,.13),rgba(255,255,255,.04));border:3px solid rgba(255,255,255,.16);border-radius:30px;margin:12px 0;padding:12px 8px;box-sizing:border-box;box-shadow:inset 0 0 40px rgba(255,220,160,.07)}
html body .huge:not(.pop):not(.shake){animation:exbob 2.6s ease-in-out infinite}
@keyframes exbob{50%{transform:translateY(-8px)}}
html body .big{border-width:4px}
html body #dots{gap:5px}html body #dots i{width:13px;height:13px;border-width:2px}
@media (max-width:400px){html body #top{gap:6px}html body #dots{gap:4px}html body #dots i{width:11px;height:11px}html body #say{height:52px;min-width:52px;padding:0 12px;font-size:24px}html body #mute{width:52px;height:52px;font-size:24px}}
@media (prefers-reduced-motion:reduce){html body .huge{animation:none !important}}`;

// Warmer, lighter night skies per world, so the dark labs feel like dusk rather than a void.
const GLOW: Record<WorldId, string> = {
  colour: '',
  inventor: 'html body::before{animation:none;opacity:.6}html body{background:radial-gradient(90% 55% at 50% 0%,rgba(255,170,110,.22),rgba(255,170,110,0) 70%),radial-gradient(120% 90% at 50% 0%,#3a2f86 0%,#1b1d45 72%)}',
  tinkerer: drift('🫧', '20%') + 'html body{background:radial-gradient(90% 55% at 50% 0%,rgba(120,240,200,.22),rgba(120,240,200,0) 70%),radial-gradient(120% 90% at 50% 0%,#17576a 0%,#13284a 72%)}',
  explorer: drift('☁️', '19%') + EXPLORER_LOOK,
  inventor2: drift('✨', '21%') + 'html body #stage:not(:has(canvas)){background:radial-gradient(80% 70% at 50% 40%,rgba(255,255,255,.11),rgba(255,255,255,.03));border:2px solid rgba(255,255,255,.14);border-radius:22px;padding:10px;box-sizing:border-box}',
};

// Phones in landscape: the worlds were laid out for a tall screen, so on a short wide one the
// cards covered the scene. Put the cards in a column on the left and the scene beside them.
const SIDE_Q = '@media (orientation:landscape) and (max-height:520px)';
const BENCH_SIDE = `html body{--side:min(50vw,440px)}
html body #stage{left:var(--side)}
html body .hud{right:auto;width:var(--side);box-sizing:border-box}
html body .hud-top .mission{max-width:none;padding:8px 12px 10px}
html body .mission p,html body #mText{font-size:15px;line-height:1.35}
html body .hud-bottom{align-items:stretch}
html body .dock{width:100%;padding:8px 10px 10px;gap:7px}
html body .dock .btn{min-height:40px;padding-block:6px}
html body .hud-top .mission{max-height:calc(62vh - 62px);max-height:calc(62dvh - 62px);overflow-y:auto;overscroll-behavior:contain}
html body .dock{max-height:calc(100vh - var(--mtop,200px) - 22px);max-height:calc(100dvh - var(--mtop,200px) - 22px);overflow-y:auto;overscroll-behavior:contain}`;
const SIDE: Record<WorldId, string> = {
  inventor: BENCH_SIDE,
  tinkerer: BENCH_SIDE,
  colour: `html body{--side:min(44vw,400px)}
html body #stage{left:var(--side)}
html body .hud{right:auto;width:var(--side);box-sizing:border-box}
html body .hud-bottom{align-items:stretch}
html body .mixbar{max-width:none}
html body .actions{justify-content:flex-start}`,
  inventor2: `html body{--side:min(50vw,440px)}
html body #app{display:grid;grid-template-columns:var(--side) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);column-gap:14px;row-gap:8px;padding-top:calc(env(safe-area-inset-top,0px) + 62px)}
html body #mission{grid-column:1;grid-row:1;max-width:none}
html body #ctrl{grid-column:1;grid-row:2;max-width:none;overflow-y:auto;align-self:start;max-height:100%}
html body #stage{grid-column:2;grid-row:1 / span 2;max-width:none;height:100%;align-self:stretch}
html body #stage canvas{width:auto;height:auto;max-width:100%;max-height:100%}`,
  explorer: `html body #app{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);grid-template-rows:auto auto minmax(0,1fr);column-gap:16px;align-items:center;justify-items:center;padding-top:calc(env(safe-area-inset-top,0px) + 58px)}
html body #top{grid-column:1;grid-row:1;max-width:none;min-height:44px}
html body #goal{grid-column:1;grid-row:2;margin:4px 0 0;font-size:20px;padding:6px 14px}
html body #goal b{font-size:34px}
html body #tray{grid-column:1;grid-row:3;align-self:center;gap:10px}
html body #scene{grid-column:2;grid-row:1 / span 3;height:100%;margin:0}
html body .big{width:84px;height:84px;font-size:42px}
html body .big small{font-size:11px}`,
};

// On a tablet the world's iframe is laid out at 1/scale and scaled up (see scale.ts), so
// canvases are told the real pixel density and stay sharp instead of being stretched.
const BOOT = `(function(){var P=window.parent;try{var U=parseFloat(P.getComputedStyle(P.document.documentElement).getPropertyValue('--ui'))||1;if(U>1){var D=Math.min(3,(P.devicePixelRatio||1)*U);Object.defineProperty(window,'devicePixelRatio',{configurable:true,get:function(){return D}});}}catch(e){}window.THREE=P.curioTHREE;window.curio=P.curioWorld;
var ready=Promise.race([P.curioInstallFonts(document,FontFace),new Promise(function(r){setTimeout(r,2500)})]);
document.addEventListener('DOMContentLoaded',function(){ready.then(function(){if(P.curioLang==='hi'&&document.getElementById('mMeta')){var nt=document.getElementById('noTR');var mk=!nt?P.curioMakeTR:(nt.getAttribute('data-tk')?P.curioMakeTK:null);if(mk){window.curioTR=mk();window.curioTR.observe(document);}}var s=document.getElementById('curio-main');var n=document.createElement('script');n.textContent=s.textContent;document.body.appendChild(n);if(P.curioWorldReady)P.curioWorldReady();});});})();`;

export function worldDoc(id: WorldId): string {
  let src = SRC[id];
  if (src === undefined) throw new Error('world not loaded yet: ' + id);
  src = src
    .replace(/<link[^>]*fonts\.g[^>]*>\s*/g, '')
    .replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^"]*"><\/script>\s*/g, '');
  const at = src.indexOf('<script>');
  if (at < 0) throw new Error('world has no main script: ' + id);
  src = src.slice(0, at) + '<script type="text/curio" id="curio-main">' + src.slice(at + '<script>'.length);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><script>${BOOT}<\/script><style>${id === 'colour' ? '' : POLISH}${GLOW[id]}${KID_WORLDS.includes(id) ? KIDUI : ''}${HIDE[id]}${SIDE_Q}{${SIDE[id]}}</style></head><body>${src}</body></html>`;
}

export interface WorldWindow extends Window { __curioDispose?: () => void; __curio?: unknown }

export function mountWorld(host: HTMLElement, id: WorldId): HTMLIFrameElement {
  const f = document.createElement('iframe');
  f.className = 'world-frame';
  f.title = ({ colour: 'Colour Studio', tinkerer: 'Tinkerer Lab', explorer: 'Explorer Lab', inventor2: 'Inventor Lab 2', inventor: 'Inventor Lab' } as Record<string, string>)[id];
  f.setAttribute('allow', 'autoplay');
  f.srcdoc = worldDoc(id);
  host.appendChild(f);
  return f;
}

export function unmountWorld(f: HTMLIFrameElement | null) {
  if (!f) return;
  try { (f.contentWindow as WorldWindow | null)?.__curioDispose?.(); } catch { /* already gone */ }
  f.remove();
}

/** Is a card, journal or other dialog open inside the world? */
export function worldDialogOpen(f: HTMLIFrameElement): boolean {
  const d = f.contentDocument; if (!d) return false;
  return ['overlay', 'discOverlay', 'jOverlay'].some(id => { const el = d.getElementById(id); return !!el && !el.hidden; });
}
export function worldEscape(f: HTMLIFrameElement) {
  const w = f.contentWindow as (Window & typeof globalThis) | null; if (!w) return;
  w.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}
