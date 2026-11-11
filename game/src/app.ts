// The app shell: choose a player, the island hub, coins and hearts, the Journal,
// the parent gate and Parent Corner, and entering or leaving a world.
import { t, setLang, getLang, type Key } from './i18n';
import { LABS, COMING, NEW_LABS, WORLD_SAVE_KEY, LEVEL_FIELDS, FOUND_FIELDS, labProgress, type Band, type Lab, type WorldId } from './labs';
import { S, RULES, active, addProfile, removeProfile, resetProgress, saveShell, readSlot, loadWorldSave, storeWorldSave, regen, msToNextHeart, loseHeart, gainHeart, buyHeart, adHeartsLeft, countAdHeart, addCoins, snapshot, onSave, type Profile } from './state';
import { send, onNative, inApp } from './native';
import { mountWorld, unmountWorld, worldDialogOpen, worldEscape, setWorldLang } from './worlds';
import { createIsland, ZONE_OF, type Island, type ZoneId, type ZoneState } from './island';
import { EXAMPLES } from './examples';
import { EXAMPLES_HI } from './examples_hi';
import { saveParentEmail, validEmail } from './subscribe';
import { LICENSES } from './licenses';
import { HERO, FACTS, factOfDay } from './home';
import { hintUse, hintCounts, markPlayed, streakOf, badgeFor, raiseBadge, badgesOf, BADGE_ICON, BADGE_COINS, STICKERS, STICKER_COST, stickersOf, addSticker, confetti, music } from './fun';
import { dailyFor, dailyProgress, dailyText, labsFor } from './daily';

export const PRIVACY_URL = 'https://groundlearn.com/curio/privacy';
const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🦉', '🐬', '🐘', '🦋'];
const NEXT: Partial<Record<Band, Band>> = { explorer: 'tinkerer', tinkerer: 'inventor' };
const BANDS: { id: Band; name: Key; ages: Key; icon: string }[] = [
  { id: 'explorer', name: 'explorer', ages: 'ages46', icon: '🎈' },
  { id: 'tinkerer', name: 'tinkerer', ages: 'ages79', icon: '🔧' },
  { id: 'inventor', name: 'inventor', ages: 'ages1013', icon: '🔬' },
];

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
const mmss = (ms: number) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const nm = (o: { en: string; hi: string }) => o[getLang()] || o.en;

let root: HTMLElement;
let frame: HTMLIFrameElement | null = null;
let current: { lab: Lab; world: WorldId; pid: string } | null = null;
const sessionStart = Date.now();
let lastOut = 0, lastAd = 0, adsShown = 0, levelThisVisit = false, bannerMode = 'off', bannerTimer = 0;
let price = '₹99';
let island: Island | null = null;
const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =================================================================== boot */
export function start(el: HTMLElement) {
  root = el; setLang(S.lang);
  root.innerHTML = `
    <div id="islandHost" class="island-host" hidden></div>
    <main id="screen" class="screen"></main>
    <div id="world" class="world" hidden>
      <div id="worldHost" class="world-host"></div>
      <div class="worldbar">
        <button class="pill back" id="wBack" aria-label="${t('back')}">‹ <span id="wBackTxt">${t('island')}</span></button>
        <span class="wlab" id="wLab"></span>
        <span class="grow"></span>
        <button class="pill" id="wHelp" aria-label="${t('example')}">?<span class="long"> ${t('example')}</span></button>
        <button class="pill coins" id="wCoins"></button>
        <button class="pill hearts" id="wHearts"></button>
      </div>
    </div>
    <div id="toasts" class="toasts" aria-live="polite"></div>
    <div id="sheet" class="sheet-wrap" hidden><div class="sheet" role="dialog" aria-modal="true"></div></div>`;
  $('#wBack').onclick = () => leaveWorld();
  $('#wHelp').onclick = () => { if (current) example(current.lab); };
  $('#wCoins').onclick = () => coinsInfo();
  $('#wHearts').onclick = () => heartsInfo();

  // Keep the native app's copy of saves up to date.
  let saveTimer = 0;
  onSave(() => { clearTimeout(saveTimer); saveTimer = window.setTimeout(() => send({ t: 'save', data: snapshot() }), 600); });

  // A world writes its save to localStorage; mirror it into the player's slot and pay rewards.
  window.addEventListener('storage', e => {
    if (!current || e.key !== WORLD_SAVE_KEY[current.world]) return;
    storeWorldSave(current.pid, current.world, e.newValue);
    rewardDiff(current.world, e.oldValue, e.newValue);
  });

  onNative(m => {
    if (m.t === 'adFree') { S.adFree = m.value; syncBanner(!$('#islandHost').hidden); if (m.price) price = m.price; saveShell(); refreshPills(); if (!$('#sheet').hidden && $('#sheet').dataset.kind === 'parent') parentCorner(); }
    if (m.t === 'purchase' && !m.ok && m.message) toast(m.message);
    if (m.t === 'back') onBack();
  });

  (window as unknown as Record<string, unknown>).curioSetVoice = (v: boolean) => { if ((S.voice !== false) !== v) { S.voice = v; saveShell(); } };
  (window as unknown as Record<string, unknown>).curioWorld = {
    canAnswer(): boolean {
      const p = active(); if (!p) return true; regen(p);
      if (p.hearts > 0 || p.band === 'explorer') return true;
      // Don't nag: the out-of-hearts sheet shows at most once a minute; otherwise a quiet toast.
      if (Date.now() - lastOut > 60_000) { lastOut = Date.now(); outOfHearts(); } else toast(`${t('outTitle')} 💔`, 'bad');
      return false;
    },
    /** A world asks before showing a hint. Free hints first; then an optional ad; hints never become unavailable. */
    hint(open: () => void) {
      const p = active();
      if (!p || S.adFree || p.band === 'explorer' || !S.adsForHearts) { open(); return; }
      const c = hintCounts(p);
      if (c.free < RULES.freeHintsPerDay) { hintUse(p, 'free'); saveShell(); open(); if (c.free + 1 === RULES.freeHintsPerDay) toast(t('hintLastFree')); return; }
      if (c.ads >= RULES.adHintsPerDay) { open(); return; }
      hintAsk(p, open);
    },
    answer(correct: boolean) {
      const p = active(); if (!p) return;
      if (correct) { addCoins(p, RULES.coins.correct); toast(`+${RULES.coins.correct} ${t('plusCoins')} · ${t('correct')}`); }
      else if (p.band !== 'explorer') { loseHeart(p); toast(`−1 ❤️ ${t('lostHeart')}`, 'bad'); }
      refreshPills();
    },
  };

  (window as unknown as Record<string, unknown>).__shell = { S, active }; // test hook
  setInterval(refreshPills, 1000);
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !frame) onBack(); });
  if (active()) hub(); else players();
  if (!S.seenRules) setTimeout(onboard, 400);
  send({ t: 'ready' });
}

/* =================================================================== rewards */
function rewardDiff(world: WorldId, oldRaw: string | null, newRaw: string | null) {
  const p = active(); if (!p || !newRaw) return;
  let a: Record<string, unknown> = {}, b: Record<string, unknown> = {};
  try { a = oldRaw ? JSON.parse(oldRaw) : {}; b = JSON.parse(newRaw); } catch { return; }
  let gained = 0; const notes: string[] = []; const moved = new Set<string>();
  if (world !== 'colour') {
    for (const [field, lab] of Object.entries(LEVEL_FIELDS)) {
      const nv = (b[field] || {}) as Record<string, unknown>;
      for (const [lvl, val] of Object.entries(nv)) {
        const key = `${lab}:${lvl}`, stars = typeof val === 'number' ? val : 0, had = p.levels[key];
        if (had === undefined) { gained += RULES.coins.level + stars * RULES.coins.star; p.levels[key] = stars; notes.push(t('levelDone')); moved.add(lab); levelThisVisit = true; }
        else if (stars > had) { gained += (stars - had) * RULES.coins.star; p.levels[key] = stars; moved.add(lab); notes.push(`★ ${stars - had} ${stars - had === 1 ? t('star') : t('stars')}`); }
      }
    }
  }
  for (const [field, lab] of Object.entries(FOUND_FIELDS[world])) {
    const was = new Set(Array.isArray(a[field]) ? (a[field] as string[]) : []);
    for (const item of (Array.isArray(b[field]) ? (b[field] as string[]) : [])) {
      const key = `${lab}:${item}`;
      if (!was.has(item) && !p.disc.includes(key)) { p.disc.push(key); gained += RULES.coins.discovery; notes.push(t('newDiscovery')); moved.add(lab); }
    }
  }
  if (gained > 0) { addCoins(p, gained); toast(`+${gained} ${t('plusCoins')} · ${notes[0]}`); played(p); }
  if (notes.includes(t('levelDone'))) confetti(reduceMotion, true); // side bursts: keep the quiz in the middle clear
  if (dailyProgress(p, moved)) setTimeout(() => toast(`+${RULES.coins.daily} ${t('plusCoins')} · ${t('curioDay')} ✓`), 700);
  refreshPills();
}


/** A day counts toward the streak once the player earns something. */
function played(p: Profile) {
  const n = markPlayed(p); saveShell();
  if (n > 1) setTimeout(() => toast(`🔥 ${n} ${t('streakDays')}`), 900);
}
/** Bronze, silver and gold per island zone, for a quarter, 60% and all of it. */
function checkBadges() {
  const p = active(); if (!p) return;
  let delay = 1200;
  zoneStates(p).forEach(z => {
    if (z.locked) return;
    const up = raiseBadge(p, z.id, badgeFor(z.progress)); if (!up) return;
    addCoins(p, BADGE_COINS[up]); saveShell();
    setTimeout(() => { toast(`${BADGE_ICON[up]} ${z.label} · +${BADGE_COINS[up]} ${t('plusCoins')}`); confetti(reduceMotion); refreshPills(); }, delay); delay += 1600;
  });
}

/* =================================================================== screens */
function players() {
  closeSheet(); showIsland(false);
  const list = S.profiles.map(p => `<button class="player" data-pid="${p.id}"><span class="av">${p.avatar}</span><b>${esc(p.name || '—')}</b><small>${t(p.band)}</small></button>`).join('');
  $('#screen').innerHTML = `
    <div class="floaters" aria-hidden="true">${['⚛️', '🧪', '🔭', '🧲', '🌱', '🎨', '📐', '💡'].map((e, i) => `<i style="--i:${i}">${e}</i>`).join('')}</div>
    <section class="center home">
      <div class="hero">${HERO}</div>
      <div class="logo"><b>Curio Island</b><small class="by">${t('byGl')}</small></div>
      <p class="tagline">${t('homeTag')}</p>
      <div class="subjects">${(['colour', 'chem', 'phy', 'math', 'bio'] as const).map(s => `<span class="subj s-${s}">${({ colour: '🎨', chem: '⚗️', phy: '⚡', math: '🔢', bio: '🌱' })[s]} ${t(('subj_' + s) as Key)}</span>`).join('')}</div>
      <h1>${t('whoPlaying')}</h1>
      <div class="players">${list}<button class="player add" id="pAdd"><span class="av">＋</span><b>${t('addPlayer')}</b></button></div>
      <div class="fact card"><small>💡 ${t('didYouKnow')}</small><p id="factTx"></p><button class="link" id="factNext">${t('anotherFact')} →</button></div>
      <p class="stats">${t('homeStats')}</p>
      <div class="homefoot"><button class="link" id="pRules">ℹ️ ${t('rulesBtn')}</button><button class="link" id="pLang">${getLang() === 'en' ? 'हिंदी' : 'English'}</button></div>
      <small class="copy">© 2026 GroundLearn</small>
    </section>`;
  let fi = factOfDay();
  const showFact = () => { $('#factTx').textContent = FACTS[fi][getLang()] || FACTS[fi].en; };
  showFact(); $('#factNext').onclick = () => { fi = (fi + 1) % FACTS.length; showFact(); };
  document.querySelectorAll<HTMLElement>('[data-pid]').forEach(b => b.onclick = () => { S.active = b.dataset.pid!; saveShell(); hub(); });
  $('#pAdd').onclick = () => newPlayer();
  $('#pRules').onclick = () => rules();
  $('#pLang').onclick = () => { S.lang = getLang() === 'en' ? 'hi' : 'en'; setLang(S.lang); saveShell(); players(); };
}

function newPlayer() {
  showIsland(false);
  let avatar = AVATARS[S.profiles.length % AVATARS.length], band: Band | null = null;
  $('#screen').innerHTML = `
    <section class="center form">
      <h1>${t('newPlayer')}</h1>
      <label class="lbl" for="npName">${t('name')}</label>
      <input id="npName" class="input" maxlength="20" autocomplete="off" placeholder="${t('namePh')}">
      <div class="lbl">${t('pickAvatar')}</div>
      <div class="avatars">${AVATARS.map(a => `<button class="avbtn" data-av="${a}" aria-pressed="${a === avatar}">${a}</button>`).join('')}</div>
      <div class="lbl">${t('pickBand')}</div>
      <div class="bands">${BANDS.map(b => `<button class="band" data-band="${b.id}" aria-pressed="false"><span>${b.icon}</span><b>${t(b.ages)}</b><small>${t(b.name)}</small></button>`).join('')}</div>
      <div class="row-btns">${S.profiles.length ? `<button class="btn" id="npCancel">${t('cancel')}</button>` : ''}<button class="btn primary" id="npGo" disabled>${t('start')}</button></div>
    </section>`;
  const sync = () => { ($('#npGo') as HTMLButtonElement).disabled = !band; };
  document.querySelectorAll<HTMLElement>('[data-av]').forEach(b => b.onclick = () => { avatar = b.dataset.av!; document.querySelectorAll('[data-av]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
  document.querySelectorAll<HTMLElement>('[data-band]').forEach(b => b.onclick = () => { band = b.dataset.band as Band; document.querySelectorAll('[data-band]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); sync(); });
  const c = document.getElementById('npCancel'); if (c) c.onclick = () => players();
  $('#npGo').onclick = () => { if (!band) return; addProfile(($('#npName') as HTMLInputElement).value, avatar, band); hub(); };
}

function labCard(lab: Lab, p: Profile) {
  const save = readSlot(p.id, lab.world), n = labProgress(lab, save), tot = lab.progress.total;
  const tag = n >= tot ? `<span class="tag done" aria-label="${t('labDone')}">⭐</span>` : !n && NEW_LABS.has(lab.id) ? `<span class="tag new">${t('labNew')}</span>` : '';
  return `<button class="lab s-${lab.subject}${n >= tot ? ' complete' : ''}" data-lab="${lab.id}">${tag}
    <span class="ic">${lab.icon}</span><b>${esc(nm(lab.name))}</b><small>${esc(nm(lab.blurb))}</small>
    <span class="bar"><i style="width:${Math.round(100 * n / tot)}%"></i></span><span class="cnt">${n}/${tot} ${lab.progress.kind === 'found' ? t('found') : t('levelsDone')}</span></button>`;
}
function soonCard(c: { icon: string; en: string; hi: string; subject: string }) {
  return `<div class="lab soon s-${c.subject}" aria-disabled="true"><span class="ic">${c.icon}</span><b>${esc(nm(c))}</b><small>${t('comingSoon')}</small></div>`;
}

function hub() {
  const p = active(); if (!p) return players();
  closeSheet();
  const dl = dailyFor(p), dt = dl ? dailyText(dl, getLang()) : null;
  const daily = !dt ? `<div class="daily card"><span class="dic">🏆</span><div class="dtx"><small>${t('curioDay')}</small><p>${t('dailyAllDone')}</p></div></div>`
    : `<div class="daily card ${dl!.done ? 'done' : ''}"><span class="dic">${dt.icon}</span><div class="dtx"><small>${t('curioDay')} · ${esc(dt.who)}</small><p>${dl!.done ? t('dailyDone') : esc(dt.ask)}</p></div>
       ${dl!.done ? '<span class="tick">✓</span>' : `<button class="btn primary" data-lab="${dt.lab.id}">${dt.lab.icon} ${t('go')}</button>`}</div>`;
  $('#screen').innerHTML = `
    <div class="hub3d">
      <header class="topbar">
        <button class="pill who" id="hWho" aria-label="${t('switchPlayer')}"><span class="av">${p.avatar}</span><span class="nm">${esc(p.name || t(p.band))}</span>${streakOf(p) ? `<span class="streak" aria-label="${streakOf(p)} ${t(streakOf(p) === 1 ? 'streakDay' : 'streakDays')}">🔥${streakOf(p)}</span>` : ''}</button>
        <span class="grow"></span>
        <button class="pill coins" id="hCoins"></button>
        <button class="pill hearts" id="hHearts"></button>
        <button class="pill" id="hJournal" aria-label="${t('journal')}">📖<span class="long"> ${t('journal')}</span></button>
        <button class="pill" id="hParent" aria-label="${t('grownUps')}">👪<span class="long"> ${t('grownUps')}</span></button>
      </header>
      <div class="hubfoot" id="hubFoot">
        ${daily}
        <button class="btn" id="hAll">🗺️ ${t('allWorkshops')}</button>
        <div class="hubrow"><button class="link hrules" id="hRules">ℹ️ ${t('rulesBtn')}</button>
          <button class="pill hmusic" id="hMusic" aria-pressed="${S.sound && S.music !== false}" aria-label="${t('musicLbl')}">${S.sound && S.music !== false ? '🎵' : '🔇'} ${t(S.sound && S.music !== false ? 'musicOn' : 'musicOff')}</button></div>
      </div>
    </div>`;
  $('#screen').classList.add('over-island');
  $('#hWho').onclick = () => players();
  $('#hCoins').onclick = () => coinsInfo();
  $('#hHearts').onclick = () => heartsInfo();
  $('#hJournal').onclick = () => journal();
  $('#hParent').onclick = () => gate(parentCorner);
  $('#hAll').onclick = () => allWorkshops();
  $('#hRules').onclick = () => rules();
  $('#hMusic').onclick = () => {
    // Turning music on also turns sound back on, since music cannot play with all sound off.
    const on = !(S.sound && S.music !== false); S.music = on; if (on) S.sound = true; saveShell();
    music(on && !$('#islandHost').hidden);
    const b = $('#hMusic'); b.setAttribute('aria-pressed', String(on)); b.textContent = `${on ? '🎵' : '🔇'} ${t(on ? 'musicOn' : 'musicOff')}`;
  };
  document.querySelectorAll<HTMLElement>('#hubFoot [data-lab]').forEach(b => b.onclick = () => enterWorld(LABS.find(l => l.id === b.dataset.lab)!));
  showIsland(true);
  island!.setZones(zoneStates(p));
  requestAnimationFrame(fitIsland);
  refreshPills();
}

const ZONE_SUBJECT: Record<ZoneId, Lab['subject']> = { studio: 'colour', kitchen: 'chem', yard: 'phy', garden: 'math', pond: 'bio' };
function zoneLabs(p: Profile, z: ZoneId) { return labsFor(p.band).filter(l => ZONE_OF[l.subject] === z); }
function zoneStates(p: Profile): ZoneState[] {
  return (Object.keys(ZONE_SUBJECT) as ZoneId[]).map(z => {
    const labs = zoneLabs(p, z);
    const done = labs.reduce((s, l) => s + labProgress(l, readSlot(p.id, l.world)), 0), tot = labs.reduce((s, l) => s + l.progress.total, 0);
    return { id: z, label: t(z), progress: tot ? done / tot : 0, locked: !labs.length, badge: !labs.length ? t('soonBadge') : labs.some(l => NEW_LABS.has(l.id) && !labProgress(l, readSlot(p.id, l.world))) ? t('labNew') : undefined };
  });
}
function zoneSheet(z: ZoneId) {
  const p = active(); if (!p) return;
  const labs = zoneLabs(p, z), soon = COMING[p.band].filter(c => ZONE_OF[c.subject] === z);
  sheet('zone', `<h2>${t(z)}</h2><div class="labs in-sheet">${labs.map(l => labCard(l, p)).join('')}${soon.map(soonCard).join('')}</div>
    <div class="row-btns"><button class="btn primary" data-close>${t('close')}</button></div>`);
  $('.sheet').querySelectorAll<HTMLElement>('[data-lab]').forEach(b => b.onclick = () => { closeSheet(); enterWorld(LABS.find(l => l.id === b.dataset.lab)!); });
}
const SUBJ_ORDER: Lab['subject'][] = ['colour', 'chem', 'phy', 'math', 'bio'];
const SUBJ_ICON: Record<string, string> = { colour: '🎨', chem: '⚗️', phy: '⚡', math: '🔢', bio: '🌱' };
function allWorkshops() {
  const p = active(); if (!p) return;
  const mine = labsFor(p.band);
  const body = SUBJ_ORDER.map(sj => {
    const labs = mine.filter(l => l.subject === sj), soon = COMING[p.band].filter(c => c.subject === sj); if (!labs.length && !soon.length) return '';
    const fin = labs.filter(l => labProgress(l, readSlot(p.id, l.world)) >= l.progress.total).length;
    return `<h3 class="subjhead s-${sj}"><span>${SUBJ_ICON[sj]} ${t(('subj_' + sj) as Key)}</span><small>${fin}/${labs.length} ⭐</small></h3>
      <div class="labs in-sheet">${labs.map(l => labCard(l, p)).join('')}${soon.map(soonCard).join('')}</div>`;
  }).join('');
  sheet('all', `<h2>${t('allWorkshops')}</h2>${body}<div class="row-btns"><button class="btn primary" data-close>${t('close')}</button></div>`);
  $('.sheet').querySelectorAll<HTMLElement>('[data-lab]').forEach(b => b.onclick = () => { closeSheet(); enterWorld(LABS.find(l => l.id === b.dataset.lab)!); });
}
function showIsland(on: boolean) {
  const host = $('#islandHost');
  if (on && !island) island = createIsland(host, z => zoneSheet(z), reduceMotion);
  host.hidden = !on; island?.pause(!on); syncBanner(on); music(on && S.sound && S.music !== false);
  if (!on) $('#screen').classList.remove('over-island');
}
function fitIsland() {
  if (!island || $('#islandHost').hidden) return;
  const w = innerWidth, h = innerHeight, top = $('.topbar').getBoundingClientRect().bottom + 8, foot = $('#hubFoot').getBoundingClientRect().top - 8;
  island.fit(w, h, top, h - foot);
}
window.addEventListener('resize', () => requestAnimationFrame(fitIsland));

/* =================================================================== worlds */
function enterWorld(lab: Lab) {
  const p = active(); if (!p) return;
  const patch: Record<string, unknown> = lab.world !== 'colour'
    ? { tab: lab.id, sound: S.sound, voice: S.voice !== false }
    : { mode: p.band, lang: S.lang, sound: S.sound };
  loadWorldSave(p.id, lab.world, patch);
  current = { lab, world: lab.world, pid: p.id };
  $('#wLab').textContent = `${lab.icon} ${nm(lab.name)}`;
  $('#wBackTxt').textContent = t('island');
  $('#world').hidden = false; $('#screen').hidden = true; showIsland(false);
  setWorldLang(S.lang);
  frame = mountWorld($('#worldHost'), lab.world);
  refreshPills();
  if (!(p.ex || []).includes(lab.id) && EXAMPLES[lab.id]) { (p.ex = p.ex || []).push(lab.id); saveShell(); setTimeout(() => current && example(current.lab), 700); }
}

/** A worked example for the lab, shown the first time a player opens it and from the "?" button. */
function example(lab: Lab) {
  const ex = (S.lang === 'hi' && EXAMPLES_HI[lab.id]) || EXAMPLES[lab.id]; if (!ex) return;
  sheet('example', `<div class="big-ic">${lab.icon}</div><h2>${t('example')}: ${esc(ex.title)}</h2>
    <ol class="exsteps">${ex.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>${ex.tip ? `<p class="muted">💡 ${esc(ex.tip)}</p>` : ''}
    <div class="row-btns"><button class="btn primary" data-close>${t('gotIt')}</button></div>`);
}

function leaveWorld() {
  if (!current) return;
  try { const raw = localStorage.getItem(WORLD_SAVE_KEY[current.world]); storeWorldSave(current.pid, current.world, raw); } catch { /* ignore */ }
  unmountWorld(frame); frame = null; current = null;
  $('#world').hidden = true; $('#screen').hidden = false;
  hub(); checkBadges();
  const finished = levelThisVisit; levelThisVisit = false;
  maybeInterstitial(finished);
}

/** Ads only at natural breaks: leaving a lab (sooner after a finished level). None in the first minutes, spaced out, capped per session. */
function maybeInterstitial(afterLevel = false) {
  if (S.adFree || !inApp) return;
  const now = Date.now();
  if (now - sessionStart < RULES.ads.quietStartSec * 1000) return;
  if (adsShown >= RULES.ads.maxPerSession) return;
  const gap = (afterLevel ? RULES.ads.levelGapSec : RULES.ads.gapSec) * 1000;
  if (lastAd && now - lastAd < gap) return;
  lastAd = now; adsShown++; send({ t: 'interstitial' });
}

/** A small banner under the island hub and Parent Corner only: never in a lab, never in the first minutes, never with Ad-free.
 * Its space is kept from the moment the hub shows, so nothing moves under a child's finger when the ad arrives. */
function syncBanner(hubShown: boolean) {
  clearTimeout(bannerTimer);
  const parentOpen = !$('#sheet').hidden && $('#sheet').dataset.kind === 'parent';
  const want = (hubShown || parentOpen) && !S.adFree && inApp;
  const wait = RULES.ads.quietStartSec * 1000 - (Date.now() - sessionStart);
  const mode: 'off' | 'space' | 'ad' = !want ? 'off' : wait > 0 ? 'space' : 'ad';
  if (want && wait > 0) bannerTimer = window.setTimeout(() => syncBanner(!$('#islandHost').hidden), wait + 500);
  if (mode === bannerMode) return;
  bannerMode = mode; send({ t: 'banner', mode });
}

function onBack() {
  if (!$('#sheet').hidden) { closeSheet(); return; }
  if (frame) { if (worldDialogOpen(frame)) worldEscape(frame); else leaveWorld(); return; }
  if (active() && $('#screen').querySelector('.hub3d')) { players(); return; }
  if ($('#screen').querySelector('.form') && S.profiles.length) { players(); return; }
  send({ t: 'exit' });
}

/* =================================================================== coins and hearts */
function refreshPills() {
  const p = active(); if (!p) return;
  regen(p);
  const c = `<i class="coin" aria-hidden="true"></i>${p.coins}`;
  const h = `❤️ ${p.hearts}${p.hearts < RULES.maxHearts ? `<small>${mmss(msToNextHeart(p))}</small>` : ''}`;
  document.querySelectorAll('#hCoins,#wCoins').forEach(e => { e.innerHTML = c; e.setAttribute('aria-label', `${t('coins')}: ${p.coins}`); });
  document.querySelectorAll('#hHearts,#wHearts').forEach(e => { e.innerHTML = h; e.setAttribute('aria-label', `${t('hearts')}: ${p.hearts}`); });
  const live = document.getElementById('ohTimer'); if (live) live.textContent = p.hearts > 0 ? '' : mmss(msToNextHeart(p));
  if (p.hearts > 0) lastOut = 0; // got a heart back: the next time they run out, show the sheet again
  if (p.hearts > 0 && $('#sheet').dataset.kind === 'out') closeSheet();
}

function coinsInfo() {
  const p = active(); if (!p) return;
  sheet('coins', `<div class="big-ic"><i class="coin big" aria-hidden="true"></i></div><h2>${t('coinsTitle')}: ${p.coins}</h2><p>${t('coinsBody')}</p>
    <ul class="rules"><li>+${RULES.coins.level} · ${t('levelDone')}</li><li>+${RULES.coins.star} · ${t('star')}</li><li>+${RULES.coins.discovery} · ${t('newDiscovery')}</li><li>+${RULES.coins.correct} · ${t('correct')}</li></ul>
    <div class="row-btns"><button class="btn primary" data-close>${t('ok')}</button></div>`);
}

function heartsInfo() {
  const p = active(); if (!p) return; regen(p);
  if (p.hearts === 0) return outOfHearts();
  sheet('hearts', `<div class="big-ic">${'❤️'.repeat(p.hearts)}<span class="empty">${'♥'.repeat(RULES.maxHearts - p.hearts)}</span></div><h2>${t('heartsTitle')}</h2><p>${t('heartsBody')}</p>
    ${p.hearts < RULES.maxHearts ? `<p class="muted">${t('nextHeart')} <b>${mmss(msToNextHeart(p))}</b></p>` : `<p class="muted">${t('full')}</p>`}
    <div class="row-btns"><button class="btn primary" data-close>${t('ok')}</button></div>`);
}

let adId = 0;
function outOfHearts() {
  const p = active(); if (!p) return; regen(p);
  const left = adHeartsLeft(p), canAd = S.adsForHearts && !S.adFree && left > 0;
  sheet('out', `<div class="big-ic">💔</div><h2>${t('outTitle')}</h2><p>${t('outBody')}</p>
    <p class="muted">${t('waitIn')} <b id="ohTimer">${mmss(msToNextHeart(p))}</b></p>
    <div class="col-btns">
      <button class="btn" id="ohBuy" ${p.coins < RULES.heartCost ? 'disabled' : ''}><i class="coin" aria-hidden="true"></i>${(p.coins < RULES.heartCost ? t('needCoins') : t('buyHeart')).replace('{cost}', String(RULES.heartCost))}</button>
      ${S.adsForHearts && !S.adFree ? `<button class="btn" id="ohAd" ${canAd ? '' : 'disabled'}>▶ ${left > 0 ? `${t('watchAd')} (${left} ${t('adsLeft')})` : t('noAdsLeft')}</button>` : ''}
      <button class="btn primary" data-close>${t('keepExploring')}</button>
    </div>`);
  $('#ohBuy').onclick = () => { if (buyHeart(p)) { toast(`+1 ❤️ ${t('gotHeart')}`); refreshPills(); closeSheet(); } };
  const ad = document.getElementById('ohAd');
  if (ad) ad.onclick = () => {
    const id = ++adId; (ad as HTMLButtonElement).disabled = true; ad.textContent = t('adLoading');
    const off = (m: { t: string; id?: number; ok?: boolean }) => {
      if (m.t !== 'rewarded' || m.id !== id) return;
      if (m.ok) { countAdHeart(p); gainHeart(p); toast(`+1 ❤️ ${t('thanksAd')}`); refreshPills(); closeSheet(); }
      else { toast(t('adFailed'), 'bad'); outOfHearts(); }
    };
    onNative(off as never); send({ t: 'rewarded', id });
  };
}

/** Out of free hints today: offer a short ad, or keep trying. Opt-in only; closing the sheet changes nothing. */
function hintAsk(p: Profile, open: () => void) {
  sheet('hint', `<div class="big-ic">💡</div><h2>${t('hintTitle')}</h2><p>${t('hintBody').replace('{n}', String(RULES.freeHintsPerDay))}</p>
    <div class="row-btns"><button class="btn" data-close>${t('hintNo')}</button><button class="btn primary" id="hiAd">▶ ${t('hintAd')}</button></div>`);
  const b = $('#hiAd') as HTMLButtonElement;
  b.onclick = () => {
    const id = ++adId; b.disabled = true; b.textContent = t('adLoading');
    const off = (m: { t: string; id?: number; ok?: boolean }) => {
      if (m.t !== 'rewarded' || m.id !== id) return;
      closeSheet();
      if (m.ok) { hintUse(p, 'ad'); saveShell(); open(); toast(`💡 ${t('thanksAd')}`); } else toast(t('adFailed'), 'bad');
    };
    onNative(off as never); send({ t: 'rewarded', id });
  };
}

/* =================================================================== journal */
function journal() {
  const p = active(); if (!p) return;
  const labs = labsFor(p.band);
  const rows = labs.map(l => { const n = labProgress(l, readSlot(p.id, l.world)), tot = l.progress.total;
    return `<div class="jrow s-${l.subject}"><span class="ic">${l.icon}</span><span class="jt"><b>${esc(nm(l.name))}</b><span class="bar"><i style="width:${Math.round(100 * n / tot)}%"></i></span></span><span class="cnt">${n}/${tot}</span></div>`; }).join('');
  const bg = badgesOf(p), zs = zoneStates(p).filter(z => !z.locked);
  const badges = `<div class="badges">${zs.map(z => `<span class="bdg ${bg[z.id] ? '' : 'off'}"><b>${bg[z.id] ? BADGE_ICON[bg[z.id]] : '🏅'}</b><small>${esc(z.label)}</small></span>`).join('')}</div>`;
  const own = stickersOf(p);
  const book = `<div class="stickers">${STICKERS.map(st => own.includes(st) ? `<span class="stk got">${st}</span>` : `<button class="stk" data-stk="${st}" aria-label="${t('stickerBuy')}"><b>${st}</b><small><i class="coin" aria-hidden="true"></i>${STICKER_COST}</small></button>`).join('')}</div>`;
  const streak = streakOf(p);
  sheet('journal', `<h2>${t('journalTitle')}</h2>${streak ? `<p class="streakline">🔥 ${streak} ${t(streak === 1 ? 'streakDay' : 'streakDays')}</p>` : ''}<h3>${t('badgesTitle')}</h3>${badges}<h3>${t('stickersTitle')} · ${own.length}/${STICKERS.length}</h3><p class="muted">${t('stickersNote').replace('{cost}', String(STICKER_COST))}</p>${book}<h3>${t('labsTitle')}</h3><div class="jlist">${rows}</div><div class="row-btns"><button class="btn" id="jRules">ℹ️ ${t('rulesBtn')}</button><button class="btn" id="jReset">↺ ${t('resetBtn')}</button><button class="btn primary" data-close>${t('close')}</button></div>`);
  $('#jRules').onclick = () => rules();
  document.querySelectorAll<HTMLElement>('[data-stk]').forEach(b => b.onclick = () => {
    if (p.coins < STICKER_COST) { toast(t('stickerNeed').replace('{cost}', String(STICKER_COST)), 'bad'); return; }
    addCoins(p, -STICKER_COST); addSticker(p, b.dataset.stk!); saveShell(); refreshPills(); confetti(reduceMotion); journal();
  });
  $('#jReset').onclick = () => gate(() => resetAsk(p));
}

function resetAsk(p: Profile) {
  sheet('reset', `<div class="big-ic">↺</div><h2>${t('resetTitle')}</h2><p>${t('resetBody').replace('{name}', esc(p.name || t(p.band)))}</p>
    <div class="row-btns"><button class="btn" data-close>${t('cancel')}</button><button class="btn danger" id="rsGo">${t('resetDo')}</button></div>`);
  $('#rsGo').onclick = () => { resetProgress(p); closeSheet(); hub(); toast(t('resetDone')); };
}

/** Before the Ad-free purchase, a grown-up may leave an email (optional) for receipts and news. */
function emailAsk() {
  if (S.parentEmail) { send({ t: 'buyAdFree' }); return; }
  sheet('email', `<div class="big-ic">✉️</div><h2>${t('emailTitle')}</h2><p>${t('emailBody')}</p>
    <input id="emIn" class="input" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="parent@example.com" aria-label="${t('emailTitle')}">
    <p class="err" id="emErr" hidden>${t('emailBad')}</p><p class="muted">${t('emailConsent')}</p>
    <div class="row-btns"><button class="btn" id="emSkip">${t('emailSkip')}</button><button class="btn primary" id="emGo">${t('emailGo')}</button></div>`);
  $('#emSkip').onclick = () => { S.parentEmail = 'skipped'; saveShell(); parentCorner(); send({ t: 'buyAdFree' }); };
  $('#emGo').onclick = () => {
    const v = ($('#emIn') as HTMLInputElement).value.trim();
    if (!validEmail(v)) { $('#emErr').hidden = false; return; }
    S.parentEmail = 'given'; saveShell(); void saveParentEmail(v, getLang()); parentCorner(); send({ t: 'buyAdFree' });
  };
}

/** First launch: three picture cards instead of a page of rules. "How to play" still opens the full rules. */
const OB: { ic: string; tk: Key; bk: Key; bg: string }[] = [
  { ic: '🏝️', tk: 'ob1T', bk: 'ob1B', bg: 'linear-gradient(160deg,#bfe9ff,#7fd0c9)' },
  { ic: '🪙', tk: 'ob2T', bk: 'ob2B', bg: 'linear-gradient(160deg,#fff1bf,#ffcf5c)' },
  { ic: '❤️', tk: 'ob3T', bk: 'ob3B', bg: 'linear-gradient(160deg,#ffd9e2,#ff9fb4)' },
];
function onboard(i = 0) {
  const c = OB[i], last = i === OB.length - 1;
  const dots = OB.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('');
  sheet('rules', `<div class="ob-art" style="background:${c.bg}" aria-hidden="true"><span>${c.ic}</span></div>
    <p class="ob-step">${t('obStep').replace('{n}', String(i + 1))}</p><h2>${t(c.tk)}</h2><p class="ob-body">${t(c.bk)}</p>
    <div class="ob-dots" aria-hidden="true">${dots}</div>
    <div class="row-btns ob-btns">${last ? '' : `<button class="btn" id="obSkip">${t('obSkip')}</button>`}<button class="btn primary" id="${last ? 'ruOk' : 'obNext'}">${t(last ? 'obGo' : 'obNext')}</button></div>`);
  const done = () => { S.seenRules = true; saveShell(); closeSheet(); };
  if (last) $('#ruOk').onclick = done;
  else { $('#obNext').onclick = () => onboard(i + 1); $('#obSkip').onclick = done; }
}

/** The "how it works" page: shown once on first launch, and from the player screen and Journal. */
function rules(first = false) {
  const f = (k: Key) => t(k).replace('{level}', String(RULES.coins.level)).replace('{star}', String(RULES.coins.star)).replace('{disc}', String(RULES.coins.discovery))
    .replace('{ok}', String(RULES.coins.correct)).replace('{daily}', String(RULES.coins.daily)).replace('{max}', String(RULES.maxHearts)).replace('{min}', String(RULES.refillMin))
    .replace('{cost}', String(RULES.heartCost)).replace('{ads}', String(RULES.adHeartsPerDay));
  sheet('rules', `<h2>${t('rulesTitle')}</h2>
    <div class="rulelist"><p><i class="coin" aria-hidden="true"></i> ${f('rulesCoins')}</p><p>❤️ ${f('rulesHearts')}</p><p>💔 ${f('rulesBuy')}</p><p class="muted">👪 ${f('rulesGrown')}</p></div>
    <div class="row-btns"><button class="btn primary" id="ruOk">${t('gotIt')}</button></div>`);
  $('#ruOk').onclick = () => { if (first || !S.seenRules) { S.seenRules = true; saveShell(); } closeSheet(); };
  if (first) { S.seenRules = true; saveShell(); }
}

/* =================================================================== parents */
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
/** Hindi number words 0–88 (the gate never goes higher). */
const HI_NUM = 'शून्य एक दो तीन चार पाँच छह सात आठ नौ दस ग्यारह बारह तेरह चौदह पंद्रह सोलह सत्रह अठारह उन्नीस बीस इक्कीस बाईस तेईस चौबीस पच्चीस छब्बीस सत्ताईस अट्ठाईस उनतीस तीस इकतीस बत्तीस तैंतीस चौंतीस पैंतीस छत्तीस सैंतीस अड़तीस उनतालीस चालीस इकतालीस बयालीस तैंतालीस चवालीस पैंतालीस छियालीस सैंतालीस अड़तालीस उनचास पचास इक्यावन बावन तिरपन चौवन पचपन छप्पन सत्तावन अट्ठावन उनसठ साठ इकसठ बासठ तिरसठ चौंसठ पैंसठ छियासठ सड़सठ अड़सठ उनहत्तर सत्तर इकहत्तर बहत्तर तिहत्तर चौहत्तर पचहत्तर छिहत्तर सतहत्तर अठहत्तर उनासी अस्सी इक्यासी बयासी तिरासी चौरासी पचासी छियासी सत्तासी अट्ठासी'.split(' ');
function gate(then: () => void) {
  const a = 21 + Math.floor(Math.random() * 68), b = 3 + Math.floor(Math.random() * 7);
  const hi = getLang() === 'hi';
  const aw = hi ? HI_NUM[a] : a % 10 ? `${TENS[Math.floor(a / 10)]}-${WORDS[a % 10]}` : TENS[a / 10];
  sheet('gate', `<h2>${t('gateTitle')}</h2><p>${t('gateBody')}</p><p class="gate-q">${aw} × ${hi ? HI_NUM[b] : WORDS[b]} = ?</p>
    <input id="gIn" class="input num" inputmode="numeric" autocomplete="off" maxlength="4" aria-label="Answer">
    <p class="err" id="gErr" hidden>${t('gateWrong')}</p>
    <div class="row-btns"><button class="btn" data-close>${t('cancel')}</button><button class="btn primary" id="gOk">${t('ok')}</button></div>`);
  const go = () => { if (Number(($('#gIn') as HTMLInputElement).value) === a * b) { closeSheet(); then(); } else { $('#gErr').hidden = false; ($('#gIn') as HTMLInputElement).value = ''; } };
  $('#gOk').onclick = go; ($('#gIn') as HTMLInputElement).onkeydown = e => { if (e.key === 'Enter') go(); };
  setTimeout(() => ($('#gIn') as HTMLInputElement)?.focus(), 50);
}

function parentCorner() {
  const toggle = (id: string, on: boolean) => `<button class="tog" id="${id}" role="switch" aria-checked="${on}">${on ? t('on') : t('off')}</button>`;
  const plist = S.profiles.map(p => {
    const found = LABS.reduce((s, l) => s + (l.progress.kind === 'found' ? labProgress(l, readSlot(p.id, l.world)) : 0), 0);
    const lv = Object.keys(p.levels).length;
    const nxt = NEXT[p.band], mine = labsFor(p.band), done = mine.filter(l => labProgress(l, readSlot(p.id, l.world)) >= l.progress.total).length;
    const up = nxt && mine.length && done / mine.length >= 0.75 ? `<div class="moveup">🎉 ${t('moveUp')} <button class="btn small" data-up="${p.id}">${t('moveUpGo')}</button></div>` : '';
    return `${up ? '' : ''}<div class="prow"><span class="av">${p.avatar}</span><span class="pt"><b>${esc(p.name || t(p.band))}</b><small>${t('discovered')}: ${found} · ${lv} ${t('levelsDone')} · ${p.coins} ${t('plusCoins')}</small></span>
      <select data-band-of="${p.id}" aria-label="${t('ageBand')}">${BANDS.map(b => `<option value="${b.id}" ${b.id === p.band ? 'selected' : ''}>${t(b.ages)}</option>`).join('')}</select>
      <button class="btn small" data-reset="${p.id}">↺ ${t('resetBtn')}</button>
      <button class="btn small" data-rm="${p.id}">${t('remove')}</button></div>${up}`;
  }).join('');
  sheet('parent', `<h2>${t('parentCorner')}</h2>
    <div class="pc">
      <section><h3>${t('adFree')}</h3>${S.adFree ? `<p>${t('adFreeOwned')}</p>` : `<p class="muted">${t('adFreeNote')}</p><div class="row-btns left"><button class="btn primary" id="pcBuy">${t('adFreeBuy')} · ${esc(price)}</button></div>`}
        <button class="link" id="pcRestore">${t('restore')}</button></section>
      <section class="kv"><span><b>${t('adHearts')}</b><small>${t('adHeartsNote')}</small></span>${toggle('pcAdH', S.adsForHearts)}</section>
      <section class="kv"><span><b>${t('sound')}</b></span>${toggle('pcSound', S.sound)}</section>
      <section class="kv"><span><b>${t('voice')}</b></span>${toggle('pcVoice', S.voice !== false)}</section>
      <section class="kv"><span><b>${t('musicLbl')}</b></span>${toggle('pcMusic', S.music !== false)}</section>
      <section class="kv"><span><b>${t('language')}</b></span><span class="seg"><button data-lang="en" aria-pressed="${S.lang === 'en'}">English</button><button data-lang="hi" aria-pressed="${S.lang === 'hi'}">हिंदी</button></span></section>
      <section><h3>${t('players')}</h3>${plist}</section>
      <button class="link" id="pcRules">ℹ️ ${t('rulesBtn')}</button>
      <button class="link" id="pcPrivacy">${t('privacy')}</button>
      <section class="about"><h3>${t('aboutTitle')}</h3><p class="muted">${t('aboutBody')}</p><p class="muted">${t('aboutCredits')}</p><p class="muted">${t('aboutNote')}</p><p><b>${t('byGl')}</b> · © 2026</p><button class="link" id="pcLic">${t('licences')}</button></section>
    </div>
    <div class="row-btns"><button class="btn primary" data-close>${t('close')}</button></div>`);
  document.getElementById('pcBuy')?.addEventListener('click', () => emailAsk());
  $('#pcRestore').onclick = () => send({ t: 'restore' });
  $('#pcAdH').onclick = () => { S.adsForHearts = !S.adsForHearts; saveShell(); parentCorner(); };
  $('#pcSound').onclick = () => { S.sound = !S.sound; saveShell(); music(!$('#islandHost').hidden && S.sound && S.music !== false); parentCorner(); };
  $('#pcVoice').onclick = () => { S.voice = S.voice === false; saveShell(); parentCorner(); };
  $('#pcMusic').onclick = () => { S.music = S.music === false; saveShell(); music(!$('#islandHost').hidden && S.sound && S.music !== false); parentCorner(); };
  document.querySelectorAll<HTMLElement>('[data-lang]').forEach(b => b.onclick = () => { S.lang = b.dataset.lang as 'en' | 'hi'; setLang(S.lang); saveShell(); hub(); parentCorner(); });
  document.querySelectorAll<HTMLSelectElement>('[data-band-of]').forEach(s => s.onchange = () => { const p = S.profiles.find(x => x.id === s.dataset.bandOf); if (p) { p.band = s.value as Band; saveShell(); hub(); parentCorner(); } });
  document.querySelectorAll<HTMLElement>('[data-up]').forEach(b => b.onclick = () => { const p = S.profiles.find(x => x.id === b.dataset.up); if (p && NEXT[p.band]) { p.band = NEXT[p.band]!; saveShell(); hub(); parentCorner(); } });
  document.querySelectorAll<HTMLElement>('[data-rm]').forEach(b => b.onclick = () => { if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = t('removeConfirm'); b.classList.add('danger'); return; } removeProfile(b.dataset.rm!); if (active()) { hub(); parentCorner(); } else players(); });
  $('#pcRules').onclick = () => rules();
  document.querySelectorAll<HTMLElement>('[data-reset]').forEach(b => b.onclick = () => { const p = S.profiles.find(x => x.id === b.dataset.reset); if (p) resetAsk(p); });
  $('#pcPrivacy').onclick = () => send({ t: 'openUrl', url: PRIVACY_URL });
  $('#pcLic').onclick = () => sheet('licences', `<h2>${t('licences')}</h2>${LICENSES.map(l => `<h3>${esc(l.name)}</h3><pre class="lic">${esc(l.text)}</pre>`).join('')}<div class="row-btns"><button class="btn primary" data-close>${t('close')}</button></div>`);
}

/* =================================================================== sheets and toasts */
function sheet(kind: string, html: string) {
  const w = $('#sheet'), s = $('.sheet', w);
  w.dataset.kind = kind; s.innerHTML = html; w.hidden = false; syncBanner(!$('#islandHost').hidden);
  s.querySelectorAll<HTMLElement>('[data-close]').forEach(b => b.onclick = () => closeSheet());
  // A tap that opened this sheet also sends a click to whatever is now under the finger. Ignore it.
  const opened = Date.now();
  w.onclick = e => { if (e.target === w && Date.now() - opened > 500) closeSheet(); };
}
function closeSheet() { const w = $('#sheet'); if (!w) return; w.hidden = true; w.dataset.kind = ''; syncBanner(!$('#islandHost').hidden); }

export function toast(msg: string, kind: '' | 'bad' = '') {
  const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg;
  const box = $('#toasts'); box.classList.toggle('inworld', !!current); box.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2200); setTimeout(() => el.remove(), 2700);
}
