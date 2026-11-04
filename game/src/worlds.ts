// A world is one of the original prototype pages (Colour Studio, Inventor Lab). Each runs
// in its own iframe so their code and element ids never clash, but shares this page's
// three.js and fonts so the app works offline and stays small.
import * as THREE_NS from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import colourSrc from '../worlds/colour.html?raw';
import inventorSrc from '../worlds/inventor.html?raw';
import tinkererSrc from '../worlds/tinkerer.html?raw';
import explorerSrc from '../worlds/explorer.html?raw';
import inventor2Src from '../worlds/inventor2.html?raw';
import type { WorldId } from './labs';
import { installFonts } from './fonts';
import { makeTranslator } from './hi/translate';
import { makeTinkererTranslator } from './hi/tinkerer';

const SRC: Record<WorldId, string> = { colour: colourSrc, inventor: inventorSrc, tinkerer: tinkererSrc, explorer: explorerSrc, inventor2: inventor2Src };

// The prototypes expect a global THREE with OrbitControls attached, as the CDN build had.
(window as unknown as Record<string, unknown>).curioTHREE = Object.assign({}, THREE_NS, { OrbitControls });
(window as unknown as Record<string, unknown>).curioInstallFonts = installFonts;
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

const BOOT = `(function(){var P=window.parent;window.THREE=P.curioTHREE;window.curio=P.curioWorld;
var ready=Promise.race([P.curioInstallFonts(document,FontFace),new Promise(function(r){setTimeout(r,2500)})]);
document.addEventListener('DOMContentLoaded',function(){ready.then(function(){if(P.curioLang==='hi'&&document.getElementById('mMeta')){var nt=document.getElementById('noTR');var mk=!nt?P.curioMakeTR:(nt.getAttribute('data-tk')?P.curioMakeTK:null);if(mk){window.curioTR=mk();window.curioTR.observe(document);}}var s=document.getElementById('curio-main');var n=document.createElement('script');n.textContent=s.textContent;document.body.appendChild(n);if(P.curioWorldReady)P.curioWorldReady();});});})();`;

export function worldDoc(id: WorldId): string {
  let src = SRC[id]
    .replace(/<link[^>]*fonts\.g[^>]*>\s*/g, '')
    .replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^"]*"><\/script>\s*/g, '');
  const at = src.indexOf('<script>');
  if (at < 0) throw new Error('world has no main script: ' + id);
  src = src.slice(0, at) + '<script type="text/curio" id="curio-main">' + src.slice(at + '<script>'.length);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><script>${BOOT}<\/script><style>${HIDE[id]}</style></head><body>${src}</body></html>`;
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
