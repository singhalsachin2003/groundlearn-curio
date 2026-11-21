// Web build: the same fonts as fonts.ts, but fetched as separate files instead of being
// inlined in the code (inlined fonts cannot be compressed and slow the first visit).
import lexend from '@fontsource-variable/lexend/files/lexend-latin-wght-normal.woff2?url';
import bricolage from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url';
import mono from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';
import baloo from '@fontsource-variable/baloo-2/files/baloo-2-latin-wght-normal.woff2?url';
import balooDeva from '@fontsource-variable/baloo-2/files/baloo-2-devanagari-wght-normal.woff2?url';
import { FONT_LIST, type SharedFont } from './fontlist';
export type { SharedFont };

const FILES = { lexend, bricolage, mono, baloo, balooDeva };

/** Filled once the files arrive; a font that fails to load is simply left out (system font instead). */
export const FONTS: SharedFont[] = [];
const ready = Promise.all(FONT_LIST.map(f => fetch(FILES[f.key]).then(r => r.arrayBuffer()).then(buf => ({ family: f.family, buf, desc: f.desc }), () => null)))
  .then(list => { list.forEach(f => f && FONTS.push(f)); });

/** Register the fonts in a document (the shell's own, or a world's). */
export function installFonts(doc: Document, Face: typeof FontFace): Promise<unknown> {
  return ready.then(() => Promise.all(FONTS.map(f => { const ff = new Face(f.family, f.buf.slice(0), f.desc); doc.fonts.add(ff); return ff.load().catch(() => null); })));
}
