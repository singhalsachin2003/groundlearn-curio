// Sheru the lion cub: Curio Island's guide. An original drawing made for this app (inline SVG, no image files).
export type Mood = 'happy' | 'cheer' | 'think' | 'wave' | 'sleep';
export const MASCOT = { en: 'Sheru', hi: 'शेरू' };

const FUR = '#f6b73c', FACE = '#f9c552', MANE = '#c8641e', DARK = '#6b3410', PALE = '#fde3a8';

function eyes(m: Mood) {
  if (m === 'cheer') return `<path d="M43 47q5-6 10 0M67 47q5-6 10 0" fill="none" stroke="${DARK}" stroke-width="3.2" stroke-linecap="round"/>`;
  if (m === 'sleep') return `<path d="M43 46q5 5 10 0M67 46q5 5 10 0" fill="none" stroke="${DARK}" stroke-width="3.2" stroke-linecap="round"/>`;
  const dy = m === 'think' ? -1.5 : 0, dx = m === 'think' ? 1.5 : 0;
  return `<circle cx="${48 + dx}" cy="${46 + dy}" r="4.2" fill="${DARK}"/><circle cx="${72 + dx}" cy="${46 + dy}" r="4.2" fill="${DARK}"/>
    <circle cx="${49.4 + dx}" cy="${44.4 + dy}" r="1.4" fill="#fff"/><circle cx="${73.4 + dx}" cy="${44.4 + dy}" r="1.4" fill="#fff"/>
    ${m === 'think' ? `<path d="M66 37q6-4 12-1" fill="none" stroke="${DARK}" stroke-width="2.6" stroke-linecap="round"/>` : ''}`;
}
function mouth(m: Mood) {
  if (m === 'cheer') return `<path d="M51 60q9 13 18 0z" fill="${DARK}"/><path d="M55.5 65q4.5 4 9 0q-4.5-3-9 0z" fill="#f48aa0"/>`;
  if (m === 'think') return `<ellipse cx="62" cy="63" rx="3" ry="2.4" fill="${DARK}"/>`;
  if (m === 'sleep') return `<path d="M56 62h8" stroke="${DARK}" stroke-width="2.6" stroke-linecap="round"/>`;
  return `<path d="M52 60q4 6 8 1q4 5 8-1" fill="none" stroke="${DARK}" stroke-width="2.8" stroke-linecap="round"/>`;
}
function arms(m: Mood) {
  const arm = (d: string, cls = '') => `<path class="${cls}" d="${d}" fill="none" stroke="${FUR}" stroke-width="11" stroke-linecap="round"/>`;
  if (m === 'cheer') return arm('M44 88q-12-8-14-22') + arm('M76 88q12-8 14-22');
  if (m === 'wave') return arm('M44 90q-9 6-10 16') + arm('M76 88q12-6 16-20', 'ms-wave');
  if (m === 'think') return arm('M44 90q-9 6-10 16') + arm('M76 92q8-6 2-22');
  return arm('M44 90q-9 6-10 16') + arm('M76 90q9 6 10 16');
}

/* ---------- Sheru's wardrobe: things bought with coins earned in the game ---------- */
export type Slot = 'hat' | 'face' | 'neck';
export interface Outfit { hat?: string; face?: string; neck?: string }
export const WEAR: { id: string; slot: Slot; cost: number; en: string; hi: string }[] = [
  { id: 'bow', slot: 'neck', cost: 50, en: 'Bow tie', hi: 'बो टाई' },
  { id: 'party', slot: 'hat', cost: 60, en: 'Party hat', hi: 'पार्टी टोपी' },
  { id: 'specs', slot: 'face', cost: 60, en: 'Glasses', hi: 'चश्मा' },
  { id: 'scarf', slot: 'neck', cost: 70, en: 'Scarf', hi: 'मफ़लर' },
  { id: 'cap', slot: 'hat', cost: 80, en: 'Cap', hi: 'टोपी' },
  { id: 'shades', slot: 'face', cost: 90, en: 'Sunglasses', hi: 'धूप का चश्मा' },
  { id: 'safari', slot: 'hat', cost: 100, en: 'Explorer hat', hi: 'खोजी टोपी' },
  { id: 'medal', slot: 'neck', cost: 100, en: 'Medal', hi: 'पदक' },
  { id: 'goggles', slot: 'face', cost: 120, en: 'Lab goggles', hi: 'लैब का चश्मा' },
  { id: 'cape', slot: 'neck', cost: 150, en: 'Hero cape', hi: 'हीरो का लबादा' },
  { id: 'crown', slot: 'hat', cost: 250, en: 'Crown', hi: 'मुकुट' },
];
let outfit: Outfit = {};
/** What Sheru wears wherever he is drawn from now on (the current player's choice). */
export function setOutfit(o: Outfit | undefined) { outfit = o || {}; }
const K = '#121528';
function hat(id?: string) {
  if (id === 'party') return `<path d="M60-16L44 14h32z" fill="#ff5fa2" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M52 0l12 6M48 8l20 6" stroke="#ffd23f" stroke-width="3"/><circle cx="60" cy="-17" r="5" fill="#ffd23f" stroke="${K}" stroke-width="2"/>`;
  if (id === 'cap') return `<path d="M36 18q24-34 48 0z" fill="#3f6dff" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M78 15q16-2 22 6q-12 2-22-2z" fill="#2c4fc4" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="1" r="3" fill="#ffd23f"/>`;
  if (id === 'safari') return `<path d="M40 14q20-30 40 0z" fill="#d9b47a" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="60" cy="15" rx="34" ry="6.5" fill="#c79d5d" stroke="${K}" stroke-width="2.5"/><path d="M42 10h36" stroke="#7a4b1c" stroke-width="4"/>`;
  if (id === 'crown') return `<path d="M40 18L37-4l12 10L60-8l11 14l12-10l-3 22z" fill="#ffd23f" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="8" r="3.4" fill="#e2553f"/><circle cx="47" cy="11" r="2.6" fill="#3fd6ff"/><circle cx="73" cy="11" r="2.6" fill="#3fd6ff"/>`;
  return '';
}
function face(id?: string) {
  if (id === 'specs') return `<g fill="rgba(255,255,255,.35)" stroke="${K}" stroke-width="2.6"><circle cx="48" cy="46" r="9"/><circle cx="72" cy="46" r="9"/></g><path d="M57 46h6" stroke="${K}" stroke-width="2.6"/>`;
  if (id === 'shades') return `<g fill="${K}"><rect x="37" y="39" width="20" height="13" rx="5"/><rect x="63" y="39" width="20" height="13" rx="5"/></g><path d="M56 43h8" stroke="${K}" stroke-width="3"/><path d="M41 43l5-2M67 43l5-2" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
  if (id === 'goggles') return `<path d="M33 45h54" stroke="#5d6079" stroke-width="5"/><g fill="rgba(120,220,255,.55)" stroke="${K}" stroke-width="2.6"><rect x="36" y="37" width="22" height="17" rx="7"/><rect x="62" y="37" width="22" height="17" rx="7"/></g>`;
  return '';
}
function neckBack(id?: string) { return id === 'cape' ? `<path d="M38 80q-22 20-14 44q36 8 72 0q8-24-14-44z" fill="#e2553f" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/>` : ''; }
function neck(id?: string) {
  if (id === 'bow') return `<path d="M60 88l-13-7v14zM60 88l13-7v14z" fill="#e2553f" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="60" cy="88" r="3.6" fill="#ffd23f" stroke="${K}" stroke-width="2"/>`;
  if (id === 'scarf') return `<path d="M40 83q20 12 40 0v8q-20 12-40 0z" fill="#3fb37a" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><path d="M70 90l4 20h-10l-2-18z" fill="#3fb37a" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><path d="M64 103h9" stroke="#fff" stroke-width="2.5"/>`;
  if (id === 'medal') return `<path d="M50 82l10 16l10-16" fill="none" stroke="#3f6dff" stroke-width="4.5"/><circle cx="60" cy="101" r="8" fill="#ffd23f" stroke="${K}" stroke-width="2.2"/><path d="M60 96.5l1.5 3h3.2l-2.6 2l1 3.2l-3.1-2l-3.1 2l1-3.2l-2.6-2h3.2z" fill="#b26a00"/>`;
  if (id === 'cape') return `<path d="M44 84q16 8 32 0" fill="none" stroke="#e2553f" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="88" r="3.4" fill="#ffd23f" stroke="${K}" stroke-width="1.8"/>`;
  return '';
}

/** The mascot as an SVG string. `cls` adds classes for size or animation. */
export function mascot(mood: Mood = 'happy', cls = '', wear: Outfit = outfit): string {
  let mane = '';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mane += `<circle cx="${(60 + Math.cos(a) * 30).toFixed(1)}" cy="${(48 + Math.sin(a) * 30).toFixed(1)}" r="11.5"/>`; }
  return `<svg class="mascot ${cls}" viewBox="0 0 120 130" role="img" aria-label="${MASCOT.en}" xmlns="http://www.w3.org/2000/svg">
  ${neckBack(wear.neck)}
  <path d="M82 108q22 2 20-16" fill="none" stroke="${FUR}" stroke-width="6" stroke-linecap="round"/><circle cx="102" cy="90" r="6.5" fill="${MANE}"/>
  <ellipse cx="50" cy="121" rx="10" ry="6" fill="${FUR}"/><ellipse cx="70" cy="121" rx="10" ry="6" fill="${FUR}"/>
  <rect x="40" y="76" width="40" height="44" rx="19" fill="${FUR}"/><ellipse cx="60" cy="101" rx="12" ry="14" fill="${PALE}"/>
  ${arms(mood)}
  <g fill="${MANE}"><circle cx="60" cy="48" r="32"/>${mane}</g>
  <circle cx="35" cy="24" r="9.5" fill="${FUR}"/><circle cx="85" cy="24" r="9.5" fill="${FUR}"/><circle cx="35" cy="24" r="5" fill="${PALE}"/><circle cx="85" cy="24" r="5" fill="${PALE}"/>
  <circle cx="60" cy="48" r="27" fill="${FACE}"/>
  <ellipse cx="60" cy="59" rx="14" ry="10.5" fill="${PALE}"/>
  <circle cx="40" cy="56" r="5" fill="#f48aa0" opacity=".45"/><circle cx="80" cy="56" r="5" fill="#f48aa0" opacity=".45"/>
  ${eyes(mood)}
  <path d="M55 52.5h10q1.5 0 .6 1.4l-4 5q-1.6 1.6-3.2 0l-4-5q-.9-1.4.6-1.4z" fill="${DARK}"/>
  ${mouth(mood)}
  ${face(wear.face)}${hat(wear.hat)}${neck(wear.neck)}
  ${mood === 'sleep' ? `<text x="92" y="22" font-size="16" font-weight="800" fill="#fff">z</text><text x="102" y="10" font-size="11" font-weight="800" fill="#fff">z</text>` : ''}
</svg>`;
}

/** A treasure chest, closed or open, drawn to match. */
export function chestSvg(open: boolean): string {
  return `<svg viewBox="0 0 100 90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  ${open ? `<g><circle cx="38" cy="34" r="9" fill="#ffd23f" stroke="#b26a00" stroke-width="2.5"/><circle cx="58" cy="30" r="9" fill="#ffd23f" stroke="#b26a00" stroke-width="2.5"/><circle cx="50" cy="38" r="9" fill="#ffe680" stroke="#b26a00" stroke-width="2.5"/></g>
  <path d="M14 30q36-34 72 0l-6 6H20z" fill="#8a4b1c" stroke="#3b1d08" stroke-width="3" stroke-linejoin="round" transform="rotate(-18 14 30)"/>` : `<path d="M12 42q0-26 38-26t38 26z" fill="#a85c24" stroke="#3b1d08" stroke-width="3" stroke-linejoin="round"/><path d="M30 20v22M70 20v22" stroke="#ffc83d" stroke-width="5"/>`}
  <rect x="12" y="42" width="76" height="40" rx="6" fill="#a85c24" stroke="#3b1d08" stroke-width="3"/>
  <path d="M30 42v40M70 42v40" stroke="#ffc83d" stroke-width="5"/><rect x="12" y="42" width="76" height="9" fill="#8a4b1c" stroke="#3b1d08" stroke-width="3"/>
  <rect x="43" y="44" width="14" height="17" rx="3" fill="#ffc83d" stroke="#3b1d08" stroke-width="2.5"/><circle cx="50" cy="52" r="2.4" fill="#3b1d08"/>
</svg>`;
}
