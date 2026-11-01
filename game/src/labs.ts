// Every playable lab, which world it lives in, and how to read its progress from that
// world's save. Level counts must match the arrays inside the world files.
export type Band = 'explorer' | 'tinkerer' | 'inventor';
export type Subject = 'colour' | 'chem' | 'phy' | 'math' | 'bio';
export type WorldId = 'colour' | 'inventor' | 'tinkerer';

export interface Lab {
  id: string;
  world: WorldId;
  subject: Subject;
  icon: string;
  name: { en: string; hi: string };
  blurb: { en: string; hi: string };
  /** Field in the world save that records progress, and how many items there are. */
  progress: { field: string; total: number; kind: 'levels' | 'found' };
  /** Labs made for one age band only (the Tinkerer labs); the rest are open to older bands. */
  only?: Band;
}

export const LABS: Lab[] = [
  { id: 'colour', world: 'colour', subject: 'colour', icon: '🎨', name: { en: 'Colour Studio', hi: 'रंगों की कार्यशाला' }, blurb: { en: 'Mix paint and light', hi: 'रंग और रोशनी मिलाओ' }, progress: { field: 'found', total: 16, kind: 'found' } },
  { id: 'forge', world: 'inventor', subject: 'chem', icon: '⚛️', name: { en: 'Molecules', hi: 'अणु' }, blurb: { en: 'Build real molecules', hi: 'असली अणु बनाओ' }, progress: { field: 'forgeFound', total: 36, kind: 'found' } },
  { id: 'react', world: 'inventor', subject: 'chem', icon: '🧪', name: { en: 'Reactions', hi: 'अभिक्रियाएँ' }, blurb: { en: 'Mix, heat and test', hi: 'मिलाओ, गरम करो, जाँचो' }, progress: { field: 'rxFound', total: 17, kind: 'found' } },
  { id: 'launch', world: 'inventor', subject: 'phy', icon: '🚀', name: { en: 'Launch', hi: 'प्रक्षेपण' }, blurb: { en: 'Angles and gravity', hi: 'कोण और गुरुत्व' }, progress: { field: 'launchStars', total: 7, kind: 'levels' } },
  { id: 'light', world: 'inventor', subject: 'phy', icon: '🔦', name: { en: 'Light', hi: 'प्रकाश' }, blurb: { en: 'Steer a laser', hi: 'लेज़र को मोड़ो' }, progress: { field: 'lightStars', total: 7, kind: 'levels' } },
  { id: 'circuit', world: 'inventor', subject: 'phy', icon: '💡', name: { en: 'Circuits', hi: 'परिपथ' }, blurb: { en: 'Light every bulb', hi: 'हर बल्ब जलाओ' }, progress: { field: 'circDone', total: 8, kind: 'levels' } },
  { id: 'mach', world: 'inventor', subject: 'phy', icon: '⚙️', name: { en: 'Machines', hi: 'मशीनें' }, blurb: { en: 'Levers, pulleys, ramps', hi: 'लीवर, घिरनी, ढलान' }, progress: { field: 'machDone', total: 7, kind: 'levels' } },
  { id: 'balance', world: 'inventor', subject: 'math', icon: '⚖️', name: { en: 'Balance', hi: 'संतुलन' }, blurb: { en: 'Solve for x', hi: 'x निकालो' }, progress: { field: 'balSolved', total: 14, kind: 'levels' } },
  { id: 'graph', world: 'inventor', subject: 'math', icon: '📈', name: { en: 'Graphs', hi: 'ग्राफ़' }, blurb: { en: 'Lines through gems', hi: 'रेखा से रत्न पकड़ो' }, progress: { field: 'graphStars', total: 8, kind: 'levels' } },
  { id: 'nets', world: 'inventor', subject: 'math', icon: '🎲', name: { en: 'Cube Nets', hi: 'घन के जाल' }, blurb: { en: 'Fold flat into 3D', hi: 'चपटे से 3D बनाओ' }, progress: { field: 'netsDone', total: 6, kind: 'levels' } },
  { id: 'genes', world: 'inventor', subject: 'bio', icon: '🌱', name: { en: 'Genes', hi: 'जीन' }, blurb: { en: 'Grow pea plants', hi: 'मटर के पौधे उगाओ' }, progress: { field: 'geneDone', total: 7, kind: 'levels' } },
  { id: 'body', world: 'inventor', subject: 'bio', icon: '❤️', name: { en: 'Body', hi: 'शरीर' }, blurb: { en: 'Travel through you', hi: 'शरीर के अंदर सफ़र' }, progress: { field: 'bodyDone', total: 8, kind: 'levels' } },
  { id: 'eco', world: 'inventor', subject: 'bio', icon: '🐅', name: { en: 'Ecosystem', hi: 'पारितंत्र' }, blurb: { en: 'Grass, deer, tigers', hi: 'घास, हिरण, बाघ' }, progress: { field: 'ecoDone', total: 5, kind: 'levels' } },
  // Round 2: the Tinkerer labs (ages 7-9).
  { id: 'atom', world: 'tinkerer', only: 'tinkerer', subject: 'chem', icon: '💧', name: { en: 'Atom Snap', hi: 'परमाणु जोड़ो' }, blurb: { en: 'Snap atoms into molecules', hi: 'परमाणु जोड़कर अणु बनाओ' }, progress: { field: 'atomDone', total: 8, kind: 'levels' } },
  { id: 'kitchen', world: 'tinkerer', only: 'tinkerer', subject: 'chem', icon: '🍋', name: { en: 'Kitchen Reactions', hi: 'रसोई की अभिक्रियाएँ' }, blurb: { en: 'Mix safe things, see what happens', hi: 'चीज़ें मिलाओ, देखो क्या होता है' }, progress: { field: 'kitchenFound', total: 12, kind: 'found' } },
  { id: 'mirror', world: 'tinkerer', only: 'tinkerer', subject: 'phy', icon: '✨', name: { en: 'Mirror Maze', hi: 'दर्पण भूलभुलैया' }, blurb: { en: 'Bounce the beam to the star', hi: 'किरण को तारे तक पहुँचाओ' }, progress: { field: 'mirrorStars', total: 8, kind: 'levels' } },
  { id: 'coord', world: 'tinkerer', only: 'tinkerer', subject: 'math', icon: '🗺️', name: { en: 'Coordinate Pictures', hi: 'निर्देशांक चित्र' }, blurb: { en: 'Join the dots in order', hi: 'बिंदुओं को क्रम से जोड़ो' }, progress: { field: 'coordDone', total: 6, kind: 'levels' } },
  { id: 'pea', world: 'tinkerer', only: 'tinkerer', subject: 'bio', icon: '🌱', name: { en: 'Pea Crosses', hi: 'मटर के मेल' }, blurb: { en: 'Cross plants, predict the flowers', hi: 'पौधों का मेल, फूलों का अनुमान' }, progress: { field: 'peaDone', total: 6, kind: 'levels' } },
  { id: 'chain', world: 'tinkerer', only: 'tinkerer', subject: 'bio', icon: '🐟', name: { en: 'Food Chains', hi: 'खाद्य शृंखला' }, blurb: { en: 'Who eats whom?', hi: 'कौन किसे खाता है?' }, progress: { field: 'chainDone', total: 6, kind: 'levels' } },
];


/** Planned games shown as "coming soon" so younger bands can see what is on the way. */
export const COMING: Record<Band, { icon: string; en: string; hi: string; subject: Subject }[]> = {
  explorer: [
    { icon: '🧼', en: 'Fizz Kitchen', hi: 'झाग वाली रसोई', subject: 'chem' },
    { icon: '🐘', en: 'See-saw Animals', hi: 'सी-सॉ के जानवर', subject: 'phy' },
    { icon: '💡', en: 'Light the Bulb', hi: 'बल्ब जलाओ', subject: 'phy' },
    { icon: '🍎', en: 'Fruit Scales', hi: 'फलों का तराज़ू', subject: 'math' },
    { icon: '🐣', en: 'Baby Animals', hi: 'जानवरों के बच्चे', subject: 'bio' },
    { icon: '🐸', en: 'Pond Feeding', hi: 'तालाब का खाना', subject: 'bio' },
  ],
  tinkerer: [],
  inventor: [
    { icon: '❄️', en: 'States of Matter', hi: 'पदार्थ की अवस्थाएँ', subject: 'chem' },
    { icon: '🍕', en: 'Fractions and Ratio', hi: 'भिन्न और अनुपात', subject: 'math' },
    { icon: '🔊', en: 'Sound and Waves', hi: 'ध्वनि और तरंगें', subject: 'phy' },
    { icon: '🦠', en: 'Cells and Microbes', hi: 'कोशिकाएँ और सूक्ष्मजीव', subject: 'bio' },
  ],
};

export const WORLD_SAVE_KEY: Record<WorldId, string> = { colour: 'curio-colour-v1', inventor: 'curio-inventor-v1', tinkerer: 'curio-tinkerer-v1' };

/** How a world save reports finished levels (field → lab id). Values are true or a star count. */
export const LEVEL_FIELDS: Record<string, string> = {
  launchStars: 'launch', lightStars: 'light', graphStars: 'graph', bodyDone: 'body', balSolved: 'balance',
  geneDone: 'genes', circDone: 'circuit', ecoDone: 'eco', machDone: 'mach', netsDone: 'nets',
  atomDone: 'atom', mirrorStars: 'mirror', coordDone: 'coord', peaDone: 'pea', chainDone: 'chain',
};
/** Collections in a world save where each new item is a discovery (field → lab id). */
export const FOUND_FIELDS: Record<WorldId, Record<string, string>> = {
  inventor: { forgeFound: 'forge', rxFound: 'react', netsFound: 'nets' },
  colour: { found: 'colour' },
  tinkerer: { kitchenFound: 'kitchen' },
};

export function labProgress(lab: Lab, save: Record<string, unknown> | null): number {
  if (!save) return 0;
  const v = save[lab.progress.field];
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === 'object') return Object.keys(v).length;
  return 0;
}
