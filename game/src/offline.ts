// Offline play for free players: Curio Island is free because of short ads, and ads need the
// internet. Without a connection a free player gets RULES.offlineGraceSec of play a day (counted
// only while the game is on screen); after that a friendly screen asks to reconnect and lifts
// by itself once the internet is back. Ad-free players, and builds without ads, are never limited.
//
// The connection check fetches a tiny file from groundlearn.com. Nothing about the player is
// sent: it is a plain request for a public file, the same as opening the website.
import { S, saveShell, RULES } from './state';
import { today } from './fun';
import { t } from './i18n';

const PING = 'https://groundlearn.com/ping.txt';
const TICK = 5;          // seconds between offline-time ticks
const CHECK_ONLINE = 60; // seconds between checks while online (the browser's offline event is quicker)
const CHECK_BLOCKED = 5; // seconds between checks while the reconnect screen is up

type Shellx = typeof S & { offDay?: string; offSec?: number };
const sx = S as Shellx;

let applies: () => boolean = () => false;
let notify: (msg: string) => void = () => {};
let online = navigator.onLine !== false;
let checking = false, lastCheck = 0, noticed = false, warned = false, unsaved = 0;
let screen: HTMLElement | null = null;

/** Seconds of offline play left today. */
export function offlineLeft(): number {
  if (sx.offDay !== today()) return RULES.offlineGraceSec;
  return Math.max(0, RULES.offlineGraceSec - (sx.offSec || 0));
}

async function check(): Promise<boolean> {
  if (navigator.onLine === false) return false;
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 6000);
  try { await fetch(`${PING}?t=${Date.now()}`, { mode: 'no-cors', cache: 'no-store', signal: ctl.signal }); return true; }
  catch { return false; }
  finally { clearTimeout(tm); }
}

async function recheck() {
  if (checking) return;
  checking = true; lastCheck = Date.now();
  const was = online; online = await check(); checking = false;
  if (online && !was) { noticed = false; warned = false; }
  render();
}

function render() {
  const block = applies() && !online && offlineLeft() <= 0;
  if (!block) { if (screen) { screen.remove(); screen = null; } return; }
  if (screen) return;
  screen = document.createElement('div');
  screen.className = 'offblock';
  screen.setAttribute('role', 'dialog');
  screen.setAttribute('aria-modal', 'true');
  screen.innerHTML = `<div class="offcard"><div class="officon" aria-hidden="true">🦁📶</div>
    <h2>${t('offTitle')}</h2><p>${t('offBody').replace('{n}', String(Math.round(RULES.offlineGraceSec / 60)))}</p>
    <p class="offsmall">${t('offAdFree')}</p>
    <button class="btn primary" id="offRetry">↻ ${t('offRetry')}</button></div>`;
  document.body.appendChild(screen);
  const b = screen.querySelector<HTMLButtonElement>('#offRetry')!;
  b.onclick = () => { b.disabled = true; b.textContent = t('offChecking'); recheck().finally(() => { if (b.isConnected) { b.disabled = false; b.textContent = '↻ ' + t('offRetry'); } }); };
  b.focus();
}

function tick() {
  if (document.hidden) return;
  const now = Date.now(), gap = screen ? CHECK_BLOCKED : online ? CHECK_ONLINE : TICK * 2;
  if (now - lastCheck > gap * 1000) recheck();
  if (!applies() || online) { render(); return; }
  if (sx.offDay !== today()) { sx.offDay = today(); sx.offSec = 0; }
  if ((sx.offSec || 0) < RULES.offlineGraceSec) {
    sx.offSec = (sx.offSec || 0) + TICK;
    unsaved += TICK; if (unsaved >= 30) { unsaved = 0; saveShell(); }
  }
  const left = offlineLeft();
  if (!noticed && left > 0) { noticed = true; notify(t('offStart').replace('{n}', String(Math.max(1, Math.ceil(left / 60))))); }
  if (!warned && left > 0 && left <= 60) { warned = true; notify(t('offLastMin')); }
  if (left <= 0) saveShell();
  render();
}

/** Start watching. `when` says whether the limit applies right now (free player, ads on). */
export function startOfflineGuard(when: () => boolean, toast: (msg: string) => void) {
  applies = when; notify = toast;
  window.addEventListener('offline', () => { online = false; tick(); });
  window.addEventListener('online', () => recheck());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) recheck(); });
  setInterval(tick, TICK * 1000);
  recheck();
}

/** Re-evaluate at once (e.g. after Ad-free is bought). */
export function refreshOfflineGuard() { render(); }
