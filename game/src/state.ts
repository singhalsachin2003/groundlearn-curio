// Shell state: players, coins and hearts, settings, and the per-player copies of each
// world's save. Everything the app must keep lives under keys that start with "gl:",
// which the native app mirrors to its own storage.
import type { Band, WorldId } from './labs';
import { WORLD_SAVE_KEY } from './labs';
import type { Lang } from './i18n';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  band: Band;
  coins: number;
  hearts: number;
  /** When the hearts count was last brought up to date. */
  heartTs: number;
  adDay: string;
  adCount: number;
  /** Best stars per "lab:level" already rewarded (0 when the level has no stars). */
  levels: Record<string, number>;
  /** "lab:item" discoveries already rewarded. */
  disc: string[];
  created: number;
  /** Today's Curio of the day (see daily.ts). */
  daily?: { day: string; lab: string; done: boolean };
  /** Labs whose worked example the player has already seen. */
  ex?: string[];
}

export interface Shell {
  profiles: Profile[];
  active: string | null;
  lang: Lang;
  sound: boolean;
  /** Read-aloud voice in the Explorer labs. Missing means on. */
  voice?: boolean;
  /** Gentle music on the island hub. Missing means on. */
  music?: boolean;
  adsForHearts: boolean;
  adFree: boolean;
  seenRules?: boolean;
  /** 'given' or 'skipped' once a grown-up has answered the email question (the address itself is never kept on the device). */
  parentEmail?: 'given' | 'skipped';
}

/** Tunable numbers from the plan. Change here, nowhere else. */
export const RULES = {
  maxHearts: 5,
  refillMin: 20,
  refillMinAdFree: 10,
  heartCost: 600,
  adHeartsPerDay: 3,
  coins: { correct: 10, level: 20, star: 5, discovery: 15, daily: 10 },
  ads: { quietStartSec: 180, gapSec: 270, levelGapSec: 150, maxPerSession: 8 },
};

const SHELL_KEY = 'gl:shell';
const slotKey = (pid: string, world: WorldId) => `gl:p:${pid}:${world}`;

let listeners: (() => void)[] = [];
export function onSave(fn: () => void) { listeners.push(fn); }
function changed() { listeners.forEach(f => f()); }

export function readJSON<T>(k: string, d: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; }
}
function writeRaw(k: string, v: string | null) {
  try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* storage full or blocked */ }
}

// The native app hands over its saved copy before any script runs.
const handed = (window as unknown as { __CURIO_SAVE?: Record<string, string> }).__CURIO_SAVE;
if (handed) Object.entries(handed).forEach(([k, v]) => { if (k.startsWith('gl:')) writeRaw(k, v); });

const blank: Shell = { profiles: [], active: null, lang: 'en', sound: true, adsForHearts: true, adFree: false };
export const S: Shell = Object.assign({}, blank, readJSON<Partial<Shell>>(SHELL_KEY, {}));
if (!Array.isArray(S.profiles)) S.profiles = [];

export function saveShell() { writeRaw(SHELL_KEY, JSON.stringify(S)); changed(); }

export function active(): Profile | null { return S.profiles.find(p => p.id === S.active) || null; }

export function addProfile(name: string, avatar: string, band: Band): Profile {
  const p: Profile = { id: Math.random().toString(36).slice(2, 10), name: name.trim().slice(0, 20), avatar, band, coins: 0, hearts: RULES.maxHearts, heartTs: Date.now(), adDay: '', adCount: 0, levels: {}, disc: [], created: Date.now() };
  S.profiles.push(p); S.active = p.id; saveShell(); return p;
}
/** Wipe a player's progress (levels, stars, discoveries, coins) and refill hearts. Name, avatar and age band stay. */
export function resetProgress(p: Profile) {
  (['colour', 'inventor', 'tinkerer', 'explorer', 'inventor2'] as WorldId[]).forEach(w => writeRaw(slotKey(p.id, w), null));
  p.coins = 0; p.levels = {}; p.disc = []; p.hearts = RULES.maxHearts; p.heartTs = Date.now(); p.adDay = ''; p.adCount = 0;
  delete (p as { badges?: unknown }).badges; delete (p as { stickers?: unknown }).stickers;
  delete (p as { daily?: unknown }).daily; delete (p as { ex?: unknown }).ex;
  saveShell();
}
export function removeProfile(id: string) {
  S.profiles = S.profiles.filter(p => p.id !== id);
  (['colour', 'inventor', 'tinkerer', 'explorer', 'inventor2'] as WorldId[]).forEach(w => writeRaw(slotKey(id, w), null));
  if (S.active === id) S.active = S.profiles[0]?.id ?? null;
  saveShell();
}

/* ---------- World saves, one copy per player ---------- */
export function readSlot(pid: string, world: WorldId): Record<string, unknown> | null {
  return readJSON<Record<string, unknown> | null>(slotKey(pid, world), null);
}
/** Copy a player's save into the key the world reads, adjusted for this visit. */
export function loadWorldSave(pid: string, world: WorldId, patch: Record<string, unknown>) {
  const data = Object.assign({}, readSlot(pid, world) || {}, patch);
  writeRaw(WORLD_SAVE_KEY[world], JSON.stringify(data));
}
/** Keep the player's copy in step with what the world just wrote. */
export function storeWorldSave(pid: string, world: WorldId, raw: string | null) {
  if (raw === null) return;
  writeRaw(slotKey(pid, world), raw); changed();
}

/* ---------- Hearts ---------- */
function refillMs() { return (S.adFree ? RULES.refillMinAdFree : RULES.refillMin) * 60_000; }
/** Bring hearts up to date with the time that has passed. */
export function regen(p: Profile, now = Date.now()) {
  if (p.hearts >= RULES.maxHearts) { p.heartTs = now; return; }
  const n = Math.floor((now - p.heartTs) / refillMs());
  if (n > 0) {
    p.hearts = Math.min(RULES.maxHearts, p.hearts + n);
    p.heartTs = p.hearts >= RULES.maxHearts ? now : p.heartTs + n * refillMs();
  }
}
export function msToNextHeart(p: Profile, now = Date.now()) {
  if (p.hearts >= RULES.maxHearts) return 0;
  return Math.max(0, p.heartTs + refillMs() - now);
}
export function loseHeart(p: Profile) {
  regen(p);
  if (p.hearts >= RULES.maxHearts) p.heartTs = Date.now();
  p.hearts = Math.max(0, p.hearts - 1); saveShell();
}
export function gainHeart(p: Profile) {
  regen(p); p.hearts = Math.min(RULES.maxHearts, p.hearts + 1);
  if (p.hearts >= RULES.maxHearts) p.heartTs = Date.now();
  saveShell();
}
export function buyHeart(p: Profile): boolean {
  regen(p);
  if (p.coins < RULES.heartCost || p.hearts >= RULES.maxHearts) return false;
  p.coins -= RULES.heartCost; gainHeart(p); return true;
}
const today = () => new Date().toISOString().slice(0, 10);
export function adHeartsLeft(p: Profile) { return p.adDay === today() ? Math.max(0, RULES.adHeartsPerDay - p.adCount) : RULES.adHeartsPerDay; }
export function countAdHeart(p: Profile) { if (p.adDay !== today()) { p.adDay = today(); p.adCount = 0; } p.adCount++; saveShell(); }

/* ---------- Coins ---------- */
export function addCoins(p: Profile, n: number) { p.coins += n; saveShell(); }

/** Snapshot of every "gl:" key, for the native app to keep. */
export function snapshot(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('gl:')) out[k] = localStorage.getItem(k) || ''; }
  } catch { /* ignore */ }
  return out;
}
