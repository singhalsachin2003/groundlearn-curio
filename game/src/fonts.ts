// Fonts are bundled so the game works offline. They are decoded once and shared with
// each world, which registers its own copy before its code runs.
import lexend from '@fontsource-variable/lexend/files/lexend-latin-wght-normal.woff2?inline';
import bricolage from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?inline';
import mono from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?inline';
import baloo from '@fontsource-variable/baloo-2/files/baloo-2-latin-wght-normal.woff2?inline';
import balooDeva from '@fontsource-variable/baloo-2/files/baloo-2-devanagari-wght-normal.woff2?inline';

import { FONT_LIST, type SharedFont } from './fontlist';
export type { SharedFont };

function bytes(dataUrl: string): ArrayBuffer {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1), bin = atob(b64), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

const FILES = { lexend, bricolage, mono, baloo, balooDeva };
export const FONTS: SharedFont[] = FONT_LIST.map(f => ({ family: f.family, buf: bytes(FILES[f.key]), desc: f.desc }));

/** Register the fonts in a document (the shell's own, or a world's). */
export function installFonts(doc: Document, Face: typeof FontFace): Promise<unknown> {
  return Promise.all(FONTS.map(f => { const ff = new Face(f.family, f.buf.slice(0), f.desc); doc.fonts.add(ff); return ff.load().catch(() => null); }));
}
