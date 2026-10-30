// Fonts are bundled so the game works offline. They are decoded once and shared with
// each world, which registers its own copy before its code runs.
import lexend from '@fontsource-variable/lexend/files/lexend-latin-wght-normal.woff2?inline';
import bricolage from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?inline';
import mono from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?inline';
import baloo from '@fontsource-variable/baloo-2/files/baloo-2-latin-wght-normal.woff2?inline';
import balooDeva from '@fontsource-variable/baloo-2/files/baloo-2-devanagari-wght-normal.woff2?inline';

export interface SharedFont { family: string; buf: ArrayBuffer; desc: FontFaceDescriptors }

function bytes(dataUrl: string): ArrayBuffer {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1), bin = atob(b64), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

export const FONTS: SharedFont[] = [
  { family: 'Lexend', buf: bytes(lexend), desc: { weight: '100 900' } },
  { family: 'Bricolage Grotesque', buf: bytes(bricolage), desc: { weight: '200 800' } },
  { family: 'JetBrains Mono', buf: bytes(mono), desc: { weight: '100 800' } },
  { family: 'Baloo 2', buf: bytes(baloo), desc: { weight: '400 800', unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' } },
  { family: 'Baloo 2', buf: bytes(balooDeva), desc: { weight: '400 800', unicodeRange: 'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF' } },
];

/** Register the fonts in a document (the shell's own, or a world's). */
export function installFonts(doc: Document, Face: typeof FontFace): Promise<unknown> {
  return Promise.all(FONTS.map(f => { const ff = new Face(f.family, f.buf.slice(0), f.desc); doc.fonts.add(ff); return ff.load().catch(() => null); }));
}
