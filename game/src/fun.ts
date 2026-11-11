// Small things that make the island feel alive: a play streak, subject badges, a sticker
// book to spend coins on, confetti for finished levels and gentle music on the hub.
import type { Profile } from './state';

export const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);

type Extra = Profile & { streak?: number; best?: number; lastDay?: string; badges?: Record<string, number>; stickers?: string[] };

/** Call when the player does something on a day. Returns the new streak if it just grew (for a toast), else 0. */
export function markPlayed(p: Profile): number {
  const x = p as Extra, d = today();
  if (x.lastDay === d) return 0;
  x.streak = x.lastDay === yesterday() ? (x.streak || 0) + 1 : 1;
  x.best = Math.max(x.best || 0, x.streak); x.lastDay = d;
  return x.streak;
}
export const streakOf = (p: Profile) => { const x = p as Extra; return x.lastDay === today() || x.lastDay === yesterday() ? x.streak || 0 : 0; };

/** Badge level for a share of a subject finished: 0 none, 1 bronze, 2 silver, 3 gold. */
export const badgeFor = (share: number) => (share >= 1 ? 3 : share >= 0.6 ? 2 : share >= 0.25 ? 1 : 0);
export const BADGE_ICON = ['', '🥉', '🥈', '🥇'];
export const BADGE_COINS = [0, 15, 30, 50];
/** Store a subject's new badge level. Returns the level if it went up, else 0. */
export function raiseBadge(p: Profile, subject: string, level: number): number {
  const x = p as Extra; x.badges = x.badges || {};
  if (level <= (x.badges[subject] || 0)) return 0;
  x.badges[subject] = level; return level;
}
export const badgesOf = (p: Profile) => (p as Extra).badges || {};

/* Hint counters per player per day. */
type HintX = Profile & { hintDay?: string; hintFree?: number; hintAds?: number };
function hintRow(p: Profile) { const x = p as HintX, d = today(); if (x.hintDay !== d) { x.hintDay = d; x.hintFree = 0; x.hintAds = 0; } return x; }
export function hintUse(p: Profile, kind: 'free' | 'ad') { const x = hintRow(p); if (kind === 'free') x.hintFree = (x.hintFree || 0) + 1; else x.hintAds = (x.hintAds || 0) + 1; }
export function hintCounts(p: Profile) { const x = hintRow(p); return { free: x.hintFree || 0, ads: x.hintAds || 0 }; }

/** Stickers are chosen, never random, and bought only with coins earned in the game. */
export const STICKERS = ['🦕', '🚀', '🔭', '🧲', '🌋', '🐙', '🦋', '🪐', '🌈', '🐝', '🦜', '🐢', '🌻', '🍄', '🦒', '🐳', '⚡', '🧊', '🌙', '☄️', '🦖', '🐬', '🌵', '💎'];
export const STICKER_COST = 40;
export const stickersOf = (p: Profile) => (p as Extra).stickers || [];
export function addSticker(p: Profile, s: string) { const x = p as Extra; x.stickers = [...(x.stickers || []), s]; }

/** A short burst of confetti over the screen. Skipped when the device asks for reduced motion. */
export function confetti(reduce: boolean, sides = false) {
  if (reduce) return;
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  const cols = ['#ffb423', '#ff5fa2', '#3fd6ff', '#7ed957', '#fff3b0', '#e2553f'];
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('i');
    const x = sides ? (i % 2 ? 88 : 0) + Math.random() * 12 : Math.random() * 100;
    s.style.cssText = `left:${x}%;background:${cols[i % cols.length]};animation-delay:${Math.random() * 0.3}s;animation-duration:${1.4 + Math.random() * 0.9}s;--dx:${sides ? (i % 2 ? -1 : 1) * Math.random() * 40 : (Math.random() - 0.5) * 160}px;--r:${Math.random() * 720 - 360}deg`;
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2600);
}

/* ------------------------------------------------------------------ hub music */
// Gentle, quiet marimba notes on a pentatonic scale, made on the fly (no audio files).
let ctx: AudioContext | null = null, master: GainNode | null = null, timer = 0, step = 0, on = false;
const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
const PHRASES = [[0, 2, 4, 5, 4, 2], [3, 4, 5, 7, 5, 4], [2, 4, 3, 1, 2, 0], [5, 4, 2, 4, 3, 2]];
function note(f: number, t: number, len: number, vol: number) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 4;
  const g2 = ctx.createGain(); g2.gain.value = 0.12;
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.start(t); o2.start(t); o.stop(t + len + 0.05); o2.stop(t + len + 0.05);
}
function tick() {
  if (!ctx || !on) return;
  const t = ctx.currentTime + 0.05, phrase = PHRASES[Math.floor(step / 8) % PHRASES.length], i = step % 8;
  if (i < 6) note(SCALE[phrase[i]], t, 1.1, 0.5);
  if (i === 0) note(SCALE[phrase[0]] / 2, t, 2.4, 0.35);
  step++;
}
export function music(play: boolean) {
  if (play === on) return;
  on = play;
  if (!play) { clearInterval(timer); if (master && ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.2); return; }
  try {
    if (!ctx) { const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; ctx = new AC(); master = ctx.createGain(); master.connect(ctx.destination); }
    master!.gain.setTargetAtTime(0.06, ctx.currentTime, 0.4);
    if (ctx.state === 'suspended') { const go = () => { ctx?.resume(); window.removeEventListener('pointerdown', go); }; window.addEventListener('pointerdown', go); ctx.resume().catch(() => {}); }
    clearInterval(timer); timer = window.setInterval(tick, 520);
  } catch { on = false; }
}

/* ------------------------------------------------------------------ little sounds for the shell */
// Short synthesised effects (no audio files): coins, a level fanfare, the chest and new things on the island.
let fxCtx: AudioContext | null = null;
function tone(c: AudioContext, f: number, at: number, len: number, vol: number, type: OscillatorType = 'triangle') {
  const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; o.connect(g); g.connect(c.destination);
  g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + len); o.start(at); o.stop(at + len + 0.05);
}
export type Fx = 'coin' | 'win' | 'chest' | 'grow' | 'tap' | 'wear';
export function sfx(kind: Fx) {
  try {
    if (!fxCtx) { const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; fxCtx = new AC(); }
    const c = fxCtx; if (c.state === 'suspended') void c.resume(); const t0 = c.currentTime + 0.02;
    const seq: Record<Fx, [number, number, number][]> = {
      coin: [[1318, 0, 0.09], [1760, 0.07, 0.22]],
      win: [[523, 0, 0.14], [659, 0.11, 0.14], [784, 0.22, 0.14], [1047, 0.33, 0.4]],
      chest: [[392, 0, 0.12], [523, 0.1, 0.12], [659, 0.2, 0.12], [784, 0.3, 0.12], [1047, 0.42, 0.5]],
      grow: [[440, 0, 0.12], [554, 0.09, 0.12], [659, 0.18, 0.12], [880, 0.27, 0.45]],
      tap: [[660, 0, 0.06]],
      wear: [[587, 0, 0.08], [880, 0.07, 0.16]],
    };
    seq[kind].forEach(([f, d, len]) => tone(c, f, t0 + d, len, kind === 'tap' ? 0.05 : 0.1));
  } catch { /* sound is a nicety: never let it break the game */ }
}
