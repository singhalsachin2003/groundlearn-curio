// The game's fonts: family, file and descriptors. The app build inlines the files (fonts.ts);
// the web build fetches them as separate files (fonts.web.ts).
export type FontKey = 'lexend' | 'bricolage' | 'mono' | 'baloo' | 'balooDeva';
export interface FontSpec { family: string; key: FontKey; desc: FontFaceDescriptors }
export interface SharedFont { family: string; buf: ArrayBuffer; desc: FontFaceDescriptors }

export const FONT_LIST: FontSpec[] = [
  { family: 'Lexend', key: 'lexend', desc: { weight: '100 900' } },
  { family: 'Bricolage Grotesque', key: 'bricolage', desc: { weight: '200 800' } },
  { family: 'JetBrains Mono', key: 'mono', desc: { weight: '100 800' } },
  { family: 'Baloo 2', key: 'baloo', desc: { weight: '400 800', unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' } },
  { family: 'Baloo 2', key: 'balooDeva', desc: { weight: '400 800', unicodeRange: 'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF' } },
];
