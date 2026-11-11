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

/** The mascot as an SVG string. `cls` adds classes for size or animation. */
export function mascot(mood: Mood = 'happy', cls = ''): string {
  let mane = '';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mane += `<circle cx="${(60 + Math.cos(a) * 30).toFixed(1)}" cy="${(48 + Math.sin(a) * 30).toFixed(1)}" r="11.5"/>`; }
  return `<svg class="mascot ${cls}" viewBox="0 0 120 130" role="img" aria-label="${MASCOT.en}" xmlns="http://www.w3.org/2000/svg">
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
