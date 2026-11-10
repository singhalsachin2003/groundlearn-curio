// Every playable lab, which world it lives in, and how to read its progress from that
// world's save. Level counts must match the arrays inside the world files.
export type Band = 'explorer' | 'tinkerer' | 'inventor';
export type Subject = 'colour' | 'chem' | 'phy' | 'math' | 'bio';
export type WorldId = 'colour' | 'inventor' | 'tinkerer' | 'explorer' | 'inventor2';

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
  // Round 2: the Tinkerer labs (ages 7-10).
  { id: 'atom', world: 'tinkerer', only: 'tinkerer', subject: 'chem', icon: '💧', name: { en: 'Atom Snap', hi: 'परमाणु जोड़ो' }, blurb: { en: 'Snap atoms into molecules', hi: 'परमाणु जोड़कर अणु बनाओ' }, progress: { field: 'atomDone', total: 8, kind: 'levels' } },
  { id: 'kitchen', world: 'tinkerer', only: 'tinkerer', subject: 'chem', icon: '🍋', name: { en: 'Kitchen Reactions', hi: 'रसोई की अभिक्रियाएँ' }, blurb: { en: 'Mix safe things, see what happens', hi: 'चीज़ें मिलाओ, देखो क्या होता है' }, progress: { field: 'kitchenFound', total: 12, kind: 'found' } },
  { id: 'mirror', world: 'tinkerer', only: 'tinkerer', subject: 'phy', icon: '✨', name: { en: 'Mirror Maze', hi: 'दर्पण भूलभुलैया' }, blurb: { en: 'Bounce the beam to the star', hi: 'किरण को तारे तक पहुँचाओ' }, progress: { field: 'mirrorStars', total: 8, kind: 'levels' } },
  { id: 'coord', world: 'tinkerer', only: 'tinkerer', subject: 'math', icon: '🗺️', name: { en: 'Coordinate Pictures', hi: 'निर्देशांक चित्र' }, blurb: { en: 'Join the dots in order', hi: 'बिंदुओं को क्रम से जोड़ो' }, progress: { field: 'coordDone', total: 6, kind: 'levels' } },
  { id: 'pea', world: 'tinkerer', only: 'tinkerer', subject: 'bio', icon: '🌱', name: { en: 'Pea Crosses', hi: 'मटर के मेल' }, blurb: { en: 'Cross plants, predict the flowers', hi: 'पौधों का मेल, फूलों का अनुमान' }, progress: { field: 'peaDone', total: 6, kind: 'levels' } },
  { id: 'chain', world: 'tinkerer', only: 'tinkerer', subject: 'bio', icon: '🐟', name: { en: 'Food Chains', hi: 'खाद्य शृंखला' }, blurb: { en: 'Who eats whom?', hi: 'कौन किसे खाता है?' }, progress: { field: 'chainDone', total: 6, kind: 'levels' } },
  // Round 3: the Explorer labs (ages 4-7). No reading needed.
  { id: 'fizz', world: 'explorer', only: 'explorer', subject: 'chem', icon: '🧼', name: { en: 'Fizz Kitchen', hi: 'झाग वाली रसोई' }, blurb: { en: 'Mix and watch it fizz', hi: 'मिलाओ और झाग देखो' }, progress: { field: 'fizzDone', total: 6, kind: 'levels' } },
  { id: 'seesaw', world: 'explorer', only: 'explorer', subject: 'phy', icon: '🐘', name: { en: 'See-saw Animals', hi: 'सी-सॉ के जानवर' }, blurb: { en: 'Make the see-saw level', hi: 'सी-सॉ को बराबर करो' }, progress: { field: 'seesawDone', total: 6, kind: 'levels' } },
  { id: 'bulb', world: 'explorer', only: 'explorer', subject: 'phy', icon: '💡', name: { en: 'Light the Bulb', hi: 'बल्ब जलाओ' }, blurb: { en: 'Which things light it up?', hi: 'किससे बल्ब जलेगा?' }, progress: { field: 'bulbDone', total: 6, kind: 'levels' } },
  { id: 'scales', world: 'explorer', only: 'explorer', subject: 'math', icon: '🍎', name: { en: 'Fruit Scales', hi: 'फलों का तराज़ू' }, blurb: { en: 'Count to make it equal', hi: 'गिनकर बराबर करो' }, progress: { field: 'scalesDone', total: 6, kind: 'levels' } },
  { id: 'baby', world: 'explorer', only: 'explorer', subject: 'bio', icon: '🐣', name: { en: 'Baby Animals', hi: 'जानवरों के बच्चे' }, blurb: { en: 'Find each baby', hi: 'हर बच्चे को ढूँढो' }, progress: { field: 'babyDone', total: 6, kind: 'levels' } },
  { id: 'pond', world: 'explorer', only: 'explorer', subject: 'bio', icon: '🐸', name: { en: 'Pond Feeding', hi: 'तालाब का खाना' }, blurb: { en: 'Who eats what?', hi: 'कौन क्या खाता है?' }, progress: { field: 'pondDone', total: 6, kind: 'levels' } },
  // Round 3: four more Inventor labs (ages 10+).
  { id: 'matter', world: 'inventor2', subject: 'chem', icon: '❄️', name: { en: 'States of Matter', hi: 'पदार्थ की अवस्थाएँ' }, blurb: { en: 'Heat and cool the particles', hi: 'कणों को गरम और ठंडा करो' }, progress: { field: 'matterDone', total: 5, kind: 'levels' } },
  { id: 'fraction', world: 'inventor2', subject: 'math', icon: '🍕', name: { en: 'Fractions and Ratio', hi: 'भिन्न और अनुपात' }, blurb: { en: 'Slice, share and mix', hi: 'काटो, बाँटो, मिलाओ' }, progress: { field: 'fractionDone', total: 6, kind: 'levels' } },
  { id: 'sound', world: 'inventor2', subject: 'phy', icon: '🔊', name: { en: 'Sound and Waves', hi: 'ध्वनि और तरंगें' }, blurb: { en: 'Tune pitch and loudness', hi: 'सुर और आवाज़ ठीक करो' }, progress: { field: 'soundDone', total: 5, kind: 'levels' } },
  { id: 'cell', world: 'inventor2', subject: 'bio', icon: '🦠', name: { en: 'Cells and Microbes', hi: 'कोशिकाएँ और सूक्ष्मजीव' }, blurb: { en: 'Build a cell, watch germs grow', hi: 'कोशिका बनाओ, जीवाणु बढ़ते देखो' }, progress: { field: 'cellDone', total: 5, kind: 'levels' } },
  // Round 4: ideas from play-and-learn maths sites, one pair per age band.
  { id: 'share', world: 'explorer', only: 'explorer', subject: 'math', icon: '🍬', name: { en: 'Share the Sweets', hi: 'मिठाई बाँटो' }, blurb: { en: 'Give every friend the same', hi: 'हर दोस्त को बराबर दो' }, progress: { field: 'shareDone', total: 6, kind: 'levels' } },
  { id: 'clock', world: 'explorer', only: 'explorer', subject: 'math', icon: '🕒', name: { en: 'Clock Time', hi: 'घड़ी का समय' }, blurb: { en: 'What time is it?', hi: 'कितने बजे हैं?' }, progress: { field: 'clockDone', total: 6, kind: 'levels' } },
  { id: 'groups', world: 'inventor2', only: 'tinkerer', subject: 'math', icon: '🧺', name: { en: 'Equal Groups', hi: 'बराबर समूह' }, blurb: { en: 'Baskets with the same number', hi: 'हर टोकरी में बराबर' }, progress: { field: 'groupsDone', total: 6, kind: 'levels' } },
  { id: 'ladoo', world: 'inventor2', only: 'tinkerer', subject: 'math', icon: '🟠', name: { en: 'Ladoo Fractions', hi: 'लड्डू के भिन्न' }, blurb: { en: 'Take a fraction of the box', hi: 'डिब्बे का एक भिन्न भाग लो' }, progress: { field: 'ladooDone', total: 6, kind: 'levels' } },
  { id: 'moon', world: 'inventor2', subject: 'phy', icon: '🌙', name: { en: 'Moon Phases', hi: 'चाँद की कलाएँ' }, blurb: { en: 'Move the Moon round the Earth', hi: 'चाँद को पृथ्वी के चारों ओर घुमाओ' }, progress: { field: 'moonDone', total: 6, kind: 'levels' } },
  { id: 'area', world: 'inventor2', subject: 'math', icon: '📐', name: { en: 'Area and Perimeter', hi: 'क्षेत्रफल और परिमाप' }, blurb: { en: 'Build shapes on a grid', hi: 'ग्रिड पर आकृतियाँ बनाओ' }, progress: { field: 'areaDone', total: 6, kind: 'levels' } },
  // Round 5: next batch.
  { id: 'pattern', world: 'explorer', only: 'explorer', subject: 'math', icon: '🔴', name: { en: 'Pattern Beads', hi: 'मोतियों के पैटर्न' }, blurb: { en: 'What comes next?', hi: 'आगे क्या आएगा?' }, progress: { field: 'patternDone', total: 6, kind: 'levels' } },
  { id: 'daynight', world: 'explorer', only: 'explorer', subject: 'phy', icon: '🌞', name: { en: 'Day and Night', hi: 'दिन और रात' }, blurb: { en: 'Is it a day or night thing?', hi: 'यह दिन की चीज़ है या रात की?' }, progress: { field: 'dayDone', total: 6, kind: 'levels' } },
  { id: 'symmetry', world: 'inventor2', only: 'tinkerer', subject: 'math', icon: '🦋', name: { en: 'Mirror Pictures', hi: 'दर्पण चित्र' }, blurb: { en: 'Copy the other half', hi: 'दूसरा आधा हिस्सा बनाओ' }, progress: { field: 'symDone', total: 6, kind: 'levels' } },
  { id: 'water', world: 'inventor2', only: 'tinkerer', subject: 'chem', icon: '🌧️', name: { en: 'Water Cycle', hi: 'जल चक्र' }, blurb: { en: 'Put the steps in order', hi: 'चरणों को क्रम में लगाओ' }, progress: { field: 'waterDone', total: 6, kind: 'levels' } },
  { id: 'decimal', world: 'inventor2', subject: 'math', icon: '💯', name: { en: 'Decimals and Percent', hi: 'दशमलव और प्रतिशत' }, blurb: { en: 'Shade the hundred grid', hi: 'सौ वर्गों की ग्रिड रंगो' }, progress: { field: 'decDone', total: 6, kind: 'levels' } },
  { id: 'pythag', world: 'inventor2', subject: 'math', icon: '📏', name: { en: 'Pythagoras Squares', hi: 'पाइथागोरस के वर्ग' }, blurb: { en: 'Squares on a right triangle', hi: 'समकोण त्रिभुज पर वर्ग' }, progress: { field: 'pythDone', total: 6, kind: 'levels' } },
  // Round 6: one new lab in every subject for each age band.
  { id: 'mix', world: 'explorer', only: 'explorer', subject: 'colour', icon: '🖌️', name: { en: 'Colour Mixing', hi: 'रंग मिलाओ' }, blurb: { en: 'Two colours make a new one', hi: 'दो रंगों से नया रंग' }, progress: { field: 'mixDone', total: 6, kind: 'levels' } },
  { id: 'states', world: 'explorer', only: 'explorer', subject: 'chem', icon: '🧊', name: { en: 'Solid or Liquid', hi: 'ठोस या तरल' }, blurb: { en: 'Sort what you see', hi: 'जो दिखे उसे छाँटो' }, progress: { field: 'statesDone', total: 6, kind: 'levels' } },
  { id: 'float', world: 'explorer', only: 'explorer', subject: 'phy', icon: '🛟', name: { en: 'Float or Sink', hi: 'तैरेगा या डूबेगा' }, blurb: { en: 'Drop it in the water', hi: 'पानी में डालकर देखो' }, progress: { field: 'floatDone', total: 6, kind: 'levels' } },
  { id: 'count', world: 'explorer', only: 'explorer', subject: 'math', icon: '🔢', name: { en: 'Count Them', hi: 'गिनती करो' }, blurb: { en: 'How many can you see?', hi: 'कितने दिख रहे हैं?' }, progress: { field: 'countDone', total: 6, kind: 'levels' } },
  { id: 'home', world: 'explorer', only: 'explorer', subject: 'bio', icon: '🏡', name: { en: 'Animal Homes', hi: 'जानवरों के घर' }, blurb: { en: 'Who lives where?', hi: 'कौन कहाँ रहता है?' }, progress: { field: 'homeDone', total: 6, kind: 'levels' } },
  { id: 'magnet', world: 'inventor2', only: 'tinkerer', subject: 'phy', icon: '🧲', name: { en: 'Magnet Hunt', hi: 'चुंबक की खोज' }, blurb: { en: 'What will a magnet pull?', hi: 'चुंबक क्या खींचेगा?' }, progress: { field: 'magnetDone', total: 5, kind: 'levels' } },
  { id: 'life', world: 'inventor2', only: 'tinkerer', subject: 'bio', icon: '🦋', name: { en: 'Life Cycles', hi: 'जीवन चक्र' }, blurb: { en: 'From egg to grown-up', hi: 'अंडे से बड़े होने तक' }, progress: { field: 'lifeDone', total: 6, kind: 'levels' } },
  { id: 'ph', world: 'inventor2', subject: 'chem', icon: '🧫', name: { en: 'Acids and Bases', hi: 'अम्ल और क्षार' }, blurb: { en: 'Change the pH, watch the colour', hi: 'pH बदलो, रंग देखो' }, progress: { field: 'phDone', total: 6, kind: 'levels' } },
  { id: 'filter', world: 'inventor2', subject: 'colour', icon: '🔦', name: { en: 'Coloured Light', hi: 'रंगीन रोशनी' }, blurb: { en: 'Why things look coloured', hi: 'चीज़ें रंगीन क्यों दिखती हैं' }, progress: { field: 'filterDone', total: 6, kind: 'levels' } },
  { id: 'angle', world: 'inventor2', subject: 'math', icon: '📐', name: { en: 'Angle Maker', hi: 'कोण बनाओ' }, blurb: { en: 'Judge angles by eye', hi: 'आँख से कोण का अंदाज़ा' }, progress: { field: 'angleDone', total: 6, kind: 'levels' } },
];


/** Labs added in the latest update: they wear a "New" ribbon until first played. */
export const NEW_LABS = new Set(['mix', 'states', 'float', 'count', 'home', 'magnet', 'life', 'ph', 'filter', 'angle']);

/** Planned games (none right now) shown as "coming soon" so younger bands can see what is on the way. */
export const COMING: Record<Band, { icon: string; en: string; hi: string; subject: Subject }[]> = {
  explorer: [],
  tinkerer: [],
  inventor: [],
};

export const WORLD_SAVE_KEY: Record<WorldId, string> = { colour: 'curio-colour-v1', inventor: 'curio-inventor-v1', tinkerer: 'curio-tinkerer-v1', explorer: 'curio-explorer-v1', inventor2: 'curio-inventor2-v1' };

/** How a world save reports finished levels (field → lab id). Values are true or a star count. */
export const LEVEL_FIELDS: Record<string, string> = {
  launchStars: 'launch', lightStars: 'light', graphStars: 'graph', bodyDone: 'body', balSolved: 'balance',
  geneDone: 'genes', circDone: 'circuit', ecoDone: 'eco', machDone: 'mach', netsDone: 'nets',
  atomDone: 'atom', fizzDone: 'fizz', seesawDone: 'seesaw', bulbDone: 'bulb', scalesDone: 'scales', babyDone: 'baby', pondDone: 'pond',
  matterDone: 'matter', fractionDone: 'fraction', soundDone: 'sound', cellDone: 'cell', shareDone: 'share', clockDone: 'clock', groupsDone: 'groups', ladooDone: 'ladoo', moonDone: 'moon', areaDone: 'area', patternDone: 'pattern', dayDone: 'daynight', symDone: 'symmetry', waterDone: 'water', decDone: 'decimal', pythDone: 'pythag', mirrorStars: 'mirror', coordDone: 'coord', peaDone: 'pea', chainDone: 'chain',
  mixDone: 'mix', statesDone: 'states', floatDone: 'float', countDone: 'count', homeDone: 'home', magnetDone: 'magnet', lifeDone: 'life', phDone: 'ph', filterDone: 'filter', angleDone: 'angle',
};
/** Collections in a world save where each new item is a discovery (field → lab id). */
export const FOUND_FIELDS: Record<WorldId, Record<string, string>> = {
  inventor: { forgeFound: 'forge', rxFound: 'react', netsFound: 'nets' },
  colour: { found: 'colour' },
  tinkerer: { kitchenFound: 'kitchen' },
  explorer: {},
  inventor2: {},
};

export function labProgress(lab: Lab, save: Record<string, unknown> | null): number {
  if (!save) return 0;
  const v = save[lab.progress.field];
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === 'object') return Object.keys(v).length;
  return 0;
}
