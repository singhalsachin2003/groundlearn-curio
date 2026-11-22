// Web build only, after `vite build --mode web`: the lab library and one page per lab, at
// groundlearn.com/play/curio-island/labs/ and …/labs/<id>/. Plain HTML (fast, readable by search
// engines), styled like curioisland.groundlearn.com. Each page has a Play button that opens the
// game straight into that lab (?lab=<id>), and a small script that shows this browser's progress.
// Run with Node 22.6+ (it reads the game's TypeScript data directly): node --experimental-strip-types
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LABS, type Lab, type Band } from '../src/labs.ts';
import { EXAMPLES } from '../src/examples.ts';
import { LAB_PAGES } from '../web/lab-pages.ts';

const here = dirname(fileURLToPath(import.meta.url));
const game = resolve(here, '..');
const dist = resolve(game, 'dist-web');
const out = resolve(dist, 'labs');
const BASE = 'https://groundlearn.com/play/curio-island/';
const TODAY = new Date().toISOString().slice(0, 10);

const BANDS: Record<Band, { name: string; hi: string; ages: string; min: number; max: number }> = {
  explorer: { name: 'Explorer', hi: 'खोजी', ages: 'ages 4–7', min: 4, max: 7 },
  tinkerer: { name: 'Tinkerer', hi: 'जुगाड़ू', ages: 'ages 7–10', min: 7, max: 10 },
  inventor: { name: 'Inventor', hi: 'आविष्कारक', ages: 'ages 10+', min: 10, max: 14 },
};
const SUBJECTS: Record<Lab['subject'], { name: string; hi: string; color: string; place: string }> = {
  colour: { name: 'Colour', hi: 'रंग', color: '#ff5fa2', place: 'Kesar\'s Colour Studio' },
  chem: { name: 'Chemistry', hi: 'रसायन', color: '#f39a00', place: 'Amma Jaya\'s Kitchen' },
  phy: { name: 'Physics', hi: 'भौतिकी', color: '#1b9fe0', place: 'Raju\'s Workshop Yard' },
  math: { name: 'Maths', hi: 'गणित', color: '#2fa865', place: 'Gauri\'s Garden' },
  bio: { name: 'Biology', hi: 'जीव विज्ञान', color: '#6c4fd6', place: 'Bittu\'s Pond' },
};
const SUBJECT_ORDER: Lab['subject'][] = ['colour', 'chem', 'phy', 'math', 'bio'];

/** Which band a lab is played in: the Explorer and Tinkerer labs are for one band; the rest are Inventor labs, and Colour Studio is for everyone. */
const bandOf = (l: Lab): Band | 'all' => (l.id === 'colour' ? 'all' : l.only || 'inventor');
const agesOf = (l: Lab) => { const b = bandOf(l); return b === 'all' ? 'All ages' : `${BANDS[b].name} · ${BANDS[b].ages}`; };
const countOf = (l: Lab) => `${l.progress.total} ${l.progress.kind === 'levels' ? 'levels' : 'discoveries'}`;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shot = (id: string) => existsSync(resolve(game, 'web/shots', id + '.webp'));

// Every lab needs page text; fail the build if one is missing or extra.
const missing = LABS.filter(l => !LAB_PAGES[l.id]).map(l => l.id);
const extra = Object.keys(LAB_PAGES).filter(id => !LABS.some(l => l.id === id));
if (missing.length || extra.length) throw new Error(`web/lab-pages.ts: missing ${missing.join(', ') || '-'}; unknown ${extra.join(', ') || '-'}`);

const FONTS = `@font-face{font-family:"Bricolage";src:url(fonts/display.woff2) format("woff2");font-weight:200 800;font-display:swap}
@font-face{font-family:"Lexend";src:url(fonts/body.woff2) format("woff2");font-weight:100 900;font-display:swap}`;

const CSS = `${FONTS}
:root{--sky:#1b9fe0;--sky-2:#6fdcff;--deep:#16234a;--sun:#ffb423;--pink:#ff5fa2;--leaf:#3cc47c;--grape:#6c4fd6;
--paper:#fffaf0;--ink:#16234a;--body:#3a4566;--muted:#66708f;--line:#e7e0cf;--card:#fff;--tint:#fff3d6;
--display:"Bricolage",system-ui,sans-serif;--sans:"Lexend",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
@media (prefers-color-scheme:dark){:root{--paper:#0e1733;--ink:#f4f1ea;--body:#c9cfe2;--muted:#98a1c0;--line:#26335e;--card:#16234a;--tint:#1d2b57}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--body);font:400 17px/1.6 var(--sans);overflow-x:hidden}
img{max-width:100%;height:auto;display:block}a{color:inherit}
a:focus-visible,button:focus-visible{outline:3px solid var(--sun);outline-offset:3px;border-radius:6px}
.wrap{max-width:1100px;margin:0 auto;padding:0 20px}
h1,h2,h3{font-family:var(--display);color:var(--ink);font-weight:800;letter-spacing:-.02em;line-height:1.08;margin:0}
.k{font:700 12px/1.2 var(--sans);letter-spacing:.16em;text-transform:uppercase;margin:0 0 10px;color:var(--grape)}
@media (prefers-color-scheme:dark){.k{color:var(--sun)}}
.bar{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--paper) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.bar .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:60px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font:800 20px/1 var(--display)}
.brand img{width:32px;height:32px;border-radius:8px}
.nav{display:flex;gap:18px;align-items:center}.nav a{text-decoration:none;font:600 15px/1 var(--sans)}
.nav a:hover{color:var(--sky)}@media (max-width:600px){.nav a:not(.keep){display:none}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:700 17px/1 var(--sans);text-decoration:none;padding:16px 26px;border-radius:999px;border:2px solid transparent;cursor:pointer}
.btn-sun{background:var(--sun);color:#3a2600;box-shadow:0 5px 0 #c98400}.btn-sun:hover{transform:translateY(1px);box-shadow:0 4px 0 #c98400}
.btn-line{border-color:var(--line);background:var(--card);color:var(--ink)}
.btn-small{padding:10px 16px;font-size:14px}
.crumbs{font:500 14px/1.4 var(--sans);color:var(--muted);margin:22px 0 0}.crumbs a{color:var(--muted)}
.hero{padding:26px 0 40px}
.hero .wrap{display:grid;grid-template-columns:1.25fr .75fr;gap:44px;align-items:center}
.icon{font-size:56px;line-height:1;margin:0 0 12px}
.hero h1{font-size:clamp(38px,6vw,64px)}
.hi{font:600 18px/1.3 var(--sans);color:var(--muted);margin:8px 0 0}
.lede{font-size:clamp(18px,2.1vw,20px);margin:16px 0 20px;max-width:34em}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 24px;padding:0;list-style:none}
.chips li{font:600 14px/1 var(--sans);padding:9px 13px;border-radius:99px;background:var(--card);border:1px solid var(--line);color:var(--ink)}
.chips .subj{color:#fff;border-color:transparent}
.btns{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.mine{font:600 15px/1.4 var(--sans);color:var(--ink);margin:16px 0 0;min-height:1.4em}
.phone{justify-self:center;width:min(270px,70vw);aspect-ratio:9/16;border-radius:38px;background:var(--deep);padding:10px;box-shadow:0 26px 50px rgba(10,30,70,.28);transform:rotate(3deg)}
.phone img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:30px}
@media (max-width:820px){.hero .wrap{grid-template-columns:1fr}.phone{width:min(230px,62vw);transform:rotate(2deg)}}
@media (max-width:600px){.btns .btn{width:100%}}
section.blk{padding:44px 0;border-top:1px solid var(--line)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:28px}@media (max-width:820px){.grid2{grid-template-columns:1fr}}
.card{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:24px}
.card h2{font-size:26px;margin:0 0 12px}
.steps{margin:0;padding-left:1.3em}.steps li{margin:0 0 10px}
.why{background:var(--tint);border-color:transparent}
.why p:not(.k){font-size:18px;margin:0}
.learn{margin:0;padding:0;list-style:none}.learn li{padding:0 0 10px 30px;position:relative}
.learn li::before{content:"✓";position:absolute;left:0;top:0;width:22px;height:22px;border-radius:50%;background:var(--leaf);color:#fff;font:700 13px/22px var(--sans);text-align:center}
.note{font-size:15px;color:var(--muted)}
.more h2{font-size:28px;margin:0 0 18px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.lab{display:flex;flex-direction:column;gap:6px;text-decoration:none;background:var(--card);border:1px solid var(--line);border-top:5px solid var(--c,var(--sky));border-radius:18px;padding:16px 16px 14px;transition:transform .12s}
.lab:hover{transform:translateY(-2px)}
.lab .ti{display:flex;align-items:center;gap:10px}.lab .ic{font-size:30px;line-height:1}
.lab h3{font-size:19px}.lab .hn{font:500 13px/1.2 var(--sans);color:var(--muted)}
.lab p{margin:0;font-size:15px}.lab .meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto;padding-top:6px}
.lab .meta span{font:600 12px/1 var(--sans);padding:6px 9px;border-radius:99px;background:var(--paper);border:1px solid var(--line)}
.lab .prog:empty{display:none}.lab .prog{background:var(--leaf)!important;color:#fff;border-color:transparent!important}
.lab .prog.part{background:var(--sun)!important;color:#3a2600}
.lib h1{font-size:clamp(38px,6vw,62px);max-width:15em}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 0}
.filters button{font:600 15px/1 var(--sans);padding:11px 16px;border-radius:99px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}
.filters button[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.subject{padding:36px 0 8px}.subject h2{font-size:30px;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:0 0 6px}
.subject h2 small{font:600 15px/1 var(--sans);color:var(--muted)}
.subject .place{margin:0 0 16px;color:var(--muted);font-size:15px}
[hidden]{display:none!important}
footer{border-top:1px solid var(--line);padding:30px 0 44px;margin-top:40px;font-size:14px;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:space-between}footer a{color:var(--muted)}
`;

// Progress from this browser's saves (same site as the game). Reads only; nothing is sent anywhere.
const JS = `(function(){
function read(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}}
var sh=read('gl:shell');if(!sh||!sh.profiles||!sh.profiles.length)return;
var p=sh.profiles.filter(function(x){return x.id===sh.active})[0]||sh.profiles[0];
function prog(el){var s=read('gl:p:'+p.id+':'+el.dataset.world);if(!s)return 0;var v=s[el.dataset.field];
if(Array.isArray(v))return v.length;if(v&&typeof v==='object')return Object.keys(v).length;return 0}
document.querySelectorAll('[data-field]').forEach(function(el){var n=prog(el),t=+el.dataset.total,o=el.querySelector('.prog')||el;
if(!n)return;var done=n>=t;o.textContent=done?'✓ Finished':n+' / '+t;if(o.classList)o.classList.toggle('part',!done)});
document.querySelectorAll('[data-who]').forEach(function(el){var t=el.dataset.who.replace('{who}',(p.avatar||'')+' '+(p.name||'your player'));el.textContent=t;el.hidden=false});
})();`;

const FILTER_JS = `(function(){
var bs=document.querySelectorAll('.filters button');bs.forEach(function(b){b.onclick=function(){
bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});var f=b.dataset.band;
document.querySelectorAll('.lab[data-bands]').forEach(function(c){c.hidden=f!=='all'&&c.dataset.bands.indexOf(f)<0});
document.querySelectorAll('.subject').forEach(function(s){s.hidden=!s.querySelector('.lab:not([hidden])')});
try{history.replaceState(null,'',f==='all'?location.pathname:'#'+f)}catch(e){}}});
var h=location.hash.slice(1);bs.forEach(function(b){if(b.dataset.band===h)b.click()});
})();`;

function head(o: { title: string; desc: string; url: string; img: string; depth: number; ld: object[] }) {
  const up = '../'.repeat(o.depth);
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${o.url}">
<meta name="theme-color" content="#1b9fe0">
<meta property="og:type" content="website"><meta property="og:site_name" content="GroundLearn">
<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${o.url}"><meta property="og:image" content="${o.img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="${up}icon-192.png"><link rel="apple-touch-icon" href="${up}icon-180.png">
<link rel="preload" href="${up}labs/fonts/display.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${up}labs/labs.css">
${o.ld.map(x => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head><body>`;
}

function bar(depth: number) {
  const up = '../'.repeat(depth);
  return `<header class="bar"><div class="wrap">
<a class="brand" href="${up}labs/"><img src="${up}icon-192.png" alt="" width="32" height="32">Curio Island</a>
<nav class="nav" aria-label="Main"><a href="${up}labs/">All labs</a><a href="https://curioisland.groundlearn.com/">About</a><a class="keep" href="${up}">▶ Play free</a></nav>
</div></header>`;
}

const footer = (depth: number) => `<footer><div class="wrap"><span>Curio Island by <a href="https://groundlearn.com/">GroundLearn</a>. Free in your browser, no sign-up. Progress stays on this device.</span>
<span><a href="https://groundlearn.com/curio/privacy/">Privacy</a> · <a href="https://curioisland.groundlearn.com/">About Curio Island</a> · <a href="${'../'.repeat(depth)}labs/">All labs</a></span></div></footer>
<script src="${'../'.repeat(depth)}labs/labs.js" defer></script></body></html>`;

const publisher = { '@type': 'Organization', name: 'GroundLearn', url: 'https://groundlearn.com/' };

function card(l: Lab, depth: number) {
  const s = SUBJECTS[l.subject], b = bandOf(l);
  const bands = b === 'all' ? 'explorer tinkerer inventor' : b;
  return `<a class="lab" href="${'../'.repeat(depth)}labs/${l.id}/" style="--c:${s.color}" data-bands="${bands}" data-world="${l.world}" data-field="${l.progress.field}" data-total="${l.progress.total}">
<span class="ti"><span class="ic" aria-hidden="true">${l.icon}</span><span><h3>${esc(l.name.en)}</h3><span class="hn" lang="hi">${esc(l.name.hi)}</span></span></span>
<p>${esc(l.blurb.en)}</p>
<span class="meta"><span>${esc(agesOf(l))}</span><span>${esc(countOf(l))}</span><span class="prog"></span></span></a>`;
}

function labPage(l: Lab) {
  const pg = LAB_PAGES[l.id], ex = EXAMPLES[l.id], s = SUBJECTS[l.subject], b = bandOf(l);
  const url = `${BASE}labs/${l.id}/`, img = shot(l.id) ? `${BASE}labs/img/${l.id}.webp` : 'https://curioisland.groundlearn.com/img/og.jpg';
  const title = `${l.name.en}: ${l.blurb.en} – free ${s.name.toLowerCase()} lab for kids | Curio Island`;
  const desc = `${pg.about} Free to play in your browser, ${b === 'all' ? 'for all ages' : BANDS[b].ages}, in English and Hindi.`;
  const related = LABS.filter(x => x.id !== l.id && x.subject === l.subject).sort((x, y) => Number(bandOf(y) === b) - Number(bandOf(x) === b)).slice(0, 4);
  const age = b === 'all' ? { min: 4, max: 14 } : BANDS[b];
  const ld = [
    { '@context': 'https://schema.org', '@type': 'LearningResource', name: `${l.name.en} (Curio Island)`, description: pg.about, url, image: img,
      learningResourceType: 'Interactive game', educationalLevel: agesOf(l), inLanguage: ['en', 'hi'], isAccessibleForFree: true,
      teaches: pg.learn, about: s.name, typicalAgeRange: `${age.min}-${age.max}`,
      audience: { '@type': 'EducationalAudience', educationalRole: 'student' }, publisher, provider: publisher },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GroundLearn', item: 'https://groundlearn.com/' },
      { '@type': 'ListItem', position: 2, name: 'Curio Island labs', item: `${BASE}labs/` },
      { '@type': 'ListItem', position: 3, name: l.name.en, item: url } ] },
  ];
  return head({ title, desc, url, img, depth: 2, ld }) + bar(2) + `
<main>
<div class="wrap"><p class="crumbs"><a href="../">All labs</a> › ${esc(s.name)} › ${esc(l.name.en)}</p></div>
<section class="hero"><div class="wrap">
<div>
<p class="icon" aria-hidden="true">${l.icon}</p>
<p class="k">${esc(s.name)} lab · ${esc(s.place)}</p>
<h1>${esc(l.name.en)}</h1>
<p class="hi" lang="hi">${esc(l.name.hi)} · ${esc(l.blurb.hi)}</p>
<p class="lede">${esc(pg.about)}</p>
<ul class="chips"><li class="subj" style="background:${s.color}">${esc(s.name)}</li><li>${esc(agesOf(l))}</li><li>${esc(countOf(l))}</li><li>English · हिंदी</li><li>Free, no sign-up</li></ul>
<div class="btns"><a class="btn btn-sun" href="../../?lab=${l.id}">▶ Play ${esc(l.name.en)}</a><a class="btn btn-line" href="../">See all labs</a></div>
<p class="mine" data-world="${l.world}" data-field="${l.progress.field}" data-total="${l.progress.total}"><span data-who="Playing as {who} in this browser" hidden></span> <span class="prog"></span></p>
</div>
${shot(l.id) ? `<div class="phone"><img src="../img/${l.id}.webp" width="540" height="960" alt="A screen from the ${esc(l.name.en)} lab in Curio Island"></div>` : ''}
</div></section>

<section class="blk"><div class="wrap grid2">
<div class="card"><p class="k">How it works</p><h2>${esc(ex?.title || 'Try it')}</h2>
<ol class="steps">${(ex?.steps || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol>
${b === 'explorer' ? '<p class="note">Explorer labs read instructions aloud, and a wrong try never costs anything.</p>' : '<p class="note">Stuck? Every level has a hint, and a "Show me" walk-through.</p>'}</div>
<div class="card why"><p class="k">Why it works</p><h2>The big idea</h2><p>${esc(pg.why)}</p></div>
</div></section>

<section class="blk"><div class="wrap grid2">
<div><p class="k">What children learn</p><h2 style="font-size:30px;margin:0 0 16px">Skills in this lab</h2>
<ul class="learn">${pg.learn.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
<div class="card"><p class="k">For parents and teachers</p>
<p style="margin:0 0 10px">${b === 'all' ? 'Colour Studio is open to every player, whatever their age band.' : `This lab is in the <strong>${BANDS[b].name}</strong> band (${BANDS[b].ages}). Each player picks a band, and sees only the labs made for it.`}</p>
<p style="margin:0 0 10px">Curio Island is free in the browser with no sign-up. Progress is saved on this device only. Ads are child-safe and non-personalised, and never appear inside a lab.</p>
<p class="note" style="margin:0">Part of ${esc(s.place)} on the island. ${esc(countOf(l))} to finish.</p></div>
</div></section>

${related.length ? `<section class="blk more"><div class="wrap"><h2>More ${esc(s.name.toLowerCase())} labs</h2><div class="cards">${related.map(r => card(r, 2)).join('')}</div></div></section>` : ''}
</main>` + footer(2);
}

function libraryPage() {
  const url = `${BASE}labs/`;
  const title = `${LABS.length} free science and maths labs for kids aged 4 to 12 | Curio Island`;
  const desc = `Every hands-on lab on Curio Island: colour, chemistry, physics, maths and biology for ages 4 to 12, in English and Hindi. Free in your browser, no sign-up.`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Curio Island labs', numberOfItems: LABS.length,
    itemListElement: LABS.map((l, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}labs/${l.id}/`, name: l.name.en })) }];
  const groups = SUBJECT_ORDER.map(sj => {
    const labs = LABS.filter(l => l.subject === sj), s = SUBJECTS[sj];
    return `<section class="subject" id="${sj}"><div class="wrap">
<h2><span style="color:${s.color}">●</span> ${esc(s.name)} <small>${labs.length} labs · <span lang="hi">${esc(s.hi)}</span></small></h2>
<p class="place">${esc(s.place)}</p>
<div class="cards">${labs.map(l => card(l, 1)).join('')}</div></div></section>`;
  }).join('');
  return head({ title, desc, url, img: 'https://curioisland.groundlearn.com/img/og.jpg', depth: 1, ld }) + bar(1) + `
<main class="lib">
<section class="hero" style="padding-bottom:10px"><div class="wrap" style="display:block">
<p class="k">Curio Island · by GroundLearn</p>
<h1>${LABS.length} hands-on science and maths labs</h1>
<p class="lede">Mix colours, snap atoms, bend light, share ladoos and grow pea plants. Each lab is a short game with levels, a worked example and hints. Pick an age band to see the labs made for it.</p>
<div class="btns"><a class="btn btn-sun" href="../">▶ Play free in your browser</a></div>
<p class="mine"><span data-who="Showing progress for {who} in this browser" hidden></span></p>
<div class="filters" role="group" aria-label="Age band">
<button data-band="all" aria-pressed="true">All ages</button>
<button data-band="explorer" aria-pressed="false">Explorer · 4–7</button>
<button data-band="tinkerer" aria-pressed="false">Tinkerer · 7–10</button>
<button data-band="inventor" aria-pressed="false">Inventor · 10+</button>
</div></div></section>
${groups}
</main><script>${FILTER_JS}</script>` + footer(1);
}

// ---- write ----
if (!existsSync(resolve(dist, 'index.html'))) throw new Error('no web build: run vite build --mode web first');
mkdirSync(resolve(out, 'fonts'), { recursive: true });
mkdirSync(resolve(out, 'img'), { recursive: true });
const nm = resolve(game, 'node_modules/@fontsource-variable');
cpSync(resolve(nm, 'lexend/files/lexend-latin-wght-normal.woff2'), resolve(out, 'fonts/body.woff2'));
cpSync(resolve(nm, 'bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2'), resolve(out, 'fonts/display.woff2'));
if (existsSync(resolve(game, 'web/shots'))) for (const f of readdirSync(resolve(game, 'web/shots'))) if (f.endsWith('.webp')) cpSync(resolve(game, 'web/shots', f), resolve(out, 'img', f));
writeFileSync(resolve(out, 'labs.css'), CSS);
writeFileSync(resolve(out, 'labs.js'), JS);
writeFileSync(resolve(out, 'index.html'), libraryPage());
for (const l of LABS) { mkdirSync(resolve(out, l.id), { recursive: true }); writeFileSync(resolve(out, l.id, 'index.html'), labPage(l)); }
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}</loc><lastmod>${TODAY}</lastmod></url>
  <url><loc>${BASE}labs/</loc><lastmod>${TODAY}</lastmod></url>
${LABS.map(l => `  <url><loc>${BASE}labs/${l.id}/</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`);
const shots = LABS.filter(l => shot(l.id)).length;
console.log(`lab pages: ${LABS.length} labs + library → dist-web/labs/ (${shots} with screenshots), sitemap.xml`);
