// The Curio of the day: one island resident asks for one thing in one lab. It is done
// the next time the player finishes a new level, wins a new star or makes a new
// discovery in that lab, today. No streaks and no penalty for skipping a day.
import { LABS, labProgress, type Band, type Lab } from './labs';
import { readSlot, saveShell, addCoins, RULES, type Profile } from './state';
import type { ZoneId } from './island';

export interface Daily { day: string; lab: string; done: boolean }

const WHO: Record<ZoneId, { icon: string; en: string; hi: string }> = {
  studio: { icon: '🎨', en: 'Kesar the painter', hi: 'केसर, चित्रकार' },
  kitchen: { icon: '👵', en: 'Amma Jaya, the kitchen chemist', hi: 'अम्मा जया, रसोई की रसायनज्ञ' },
  yard: { icon: '🔧', en: 'Raju the mechanic', hi: 'राजू मिस्त्री' },
  garden: { icon: '🌻', en: 'Gauri the gardener', hi: 'गौरी, माली' },
  pond: { icon: '🐸', en: 'Bittu at the pond', hi: 'तालाब वाला बिट्टू' },
};
const ZONE: Record<string, ZoneId> = { colour: 'studio', chem: 'kitchen', phy: 'yard', math: 'garden', bio: 'pond' };

const ASK: Record<string, { en: string; hi: string }> = {
  colour: { en: 'Can you mix a colour you have not found yet?', hi: 'क्या तुम कोई ऐसा रंग बना सकते हो जो अभी तक नहीं मिला?' },
  forge: { en: 'Can you build a molecule you have never built before?', hi: 'क्या तुम कोई ऐसा अणु बना सकते हो जो पहले कभी नहीं बनाया?' },
  react: { en: 'Can you make a reaction you have not seen yet?', hi: 'क्या तुम कोई नई अभिक्रिया करके दिखा सकते हो?' },
  launch: { en: 'Can you land a launch you have not landed yet?', hi: 'क्या तुम कोई नया निशाना लगा सकते हो?' },
  light: { en: 'Can you steer the laser through a new puzzle?', hi: 'क्या तुम लेज़र को एक नई पहेली से निकाल सकते हो?' },
  circuit: { en: 'Can you light the bulbs in a new circuit?', hi: 'क्या तुम एक नए परिपथ के बल्ब जला सकते हो?' },
  mach: { en: 'Can you get a new machine working?', hi: 'क्या तुम एक नई मशीन चला सकते हो?' },
  balance: { en: 'Can you solve a new balance puzzle?', hi: 'क्या तुम संतुलन की एक नई पहेली हल कर सकते हो?' },
  graph: { en: 'Can you catch every gem on a new graph?', hi: 'क्या तुम एक नए ग्राफ़ पर सारे रत्न पकड़ सकते हो?' },
  nets: { en: 'Can you fold a new net, or solve a new puzzle?', hi: 'क्या तुम एक नया जाल मोड़ सकते हो?' },
  genes: { en: 'Can you finish a new pea-plant experiment?', hi: 'क्या तुम मटर के पौधों का एक नया प्रयोग पूरा कर सकते हो?' },
  body: { en: 'Can you finish a new journey through the body?', hi: 'क्या तुम शरीर के अंदर एक नया सफ़र पूरा कर सकते हो?' },
  eco: { en: 'Can you finish a new forest experiment?', hi: 'क्या तुम जंगल का एक नया प्रयोग पूरा कर सकते हो?' },
  atom: { en: 'Can you snap together a new molecule?', hi: 'क्या तुम कोई नया अणु जोड़ सकते हो?' },
  kitchen: { en: 'Can you mix something new in the kitchen?', hi: 'क्या तुम रसोई में कुछ नया मिला सकते हो?' },
  mirror: { en: 'Can you guide the beam through a new maze?', hi: 'क्या तुम किरण को एक नई भूलभुलैया से निकाल सकते हो?' },
  coord: { en: 'Can you join the dots for a new picture?', hi: 'क्या तुम एक नया चित्र बिंदुओं से बना सकते हो?' },
  pea: { en: 'Can you cross two plants for a new flower mix?', hi: 'क्या तुम दो पौधों का मेल कराकर नए फूल पा सकते हो?' },
  chain: { en: 'Can you build a new food chain?', hi: 'क्या तुम एक नई खाद्य शृंखला बना सकते हो?' },
  fizz: { en: 'Can you make something fizz?', hi: 'क्या तुम कुछ झाग वाला बना सकते हो?' },
  seesaw: { en: 'Can you make the see-saw level?', hi: 'क्या तुम सी-सॉ को बराबर कर सकते हो?' },
  bulb: { en: 'Can you light up the bulb?', hi: 'क्या तुम बल्ब जला सकते हो?' },
  scales: { en: 'Can you make the scales equal?', hi: 'क्या तुम तराज़ू बराबर कर सकते हो?' },
  baby: { en: 'Can you find a baby animal\'s mum?', hi: 'क्या तुम किसी बच्चे की माँ ढूँढ सकते हो?' },
  pond: { en: 'Can you feed the pond animals?', hi: 'क्या तुम तालाब के जानवरों को खाना खिला सकते हो?' },
  matter: { en: 'Can you melt, boil or freeze something new?', hi: 'क्या तुम कुछ नया पिघला, उबाल या जमा सकते हो?' },
  fraction: { en: 'Can you solve a new slice or mix puzzle?', hi: 'क्या तुम टुकड़ों या मिश्रण की नई पहेली हल कर सकते हो?' },
  sound: { en: 'Can you tune a new sound?', hi: 'क्या तुम एक नई आवाज़ ठीक कर सकते हो?' },
  share: { en: 'Can you share the sweets so everyone gets the same?', hi: 'क्या तुम मिठाई ऐसे बाँट सकते हो कि सबको बराबर मिले?' },
  clock: { en: 'Can you read the time on a clock?', hi: 'क्या तुम घड़ी देखकर समय बता सकते हो?' },
  groups: { en: 'Can you fill the baskets with equal groups?', hi: 'क्या तुम टोकरियों में बराबर-बराबर भर सकते हो?' },
  ladoo: { en: 'Can you take the right fraction of the ladoos?', hi: 'क्या तुम लड्डुओं का सही भिन्न भाग ले सकते हो?' },
  moon: { en: 'Can you set the Moon to a new phase?', hi: 'क्या तुम चाँद की एक नई कला बना सकते हो?' },
  area: { en: 'Can you build a shape with the right area and perimeter?', hi: 'क्या तुम सही क्षेत्रफल और परिमाप वाली आकृति बना सकते हो?' },
  pattern: { en: 'Can you carry on a bead pattern?', hi: 'क्या तुम मोतियों का पैटर्न आगे बढ़ा सकते हो?' },
  daynight: { en: 'Can you sort things into day and night?', hi: 'क्या तुम चीज़ों को दिन और रात में छाँट सकते हो?' },
  symmetry: { en: 'Can you finish a mirror picture?', hi: 'क्या तुम दर्पण चित्र पूरा कर सकते हो?' },
  water: { en: 'Can you put the water steps in order?', hi: 'क्या तुम पानी के चरणों को क्रम में लगा सकते हो?' },
  decimal: { en: 'Can you shade the right decimal or percent?', hi: 'क्या तुम सही दशमलव या प्रतिशत रंग सकते हो?' },
  pythag: { en: 'Can you build a right triangle that fits the squares?', hi: 'क्या तुम वर्गों से मेल खाता समकोण त्रिभुज बना सकते हो?' },
  mix: { en: 'Can you mix a brand new colour?', hi: 'क्या तुम एक नया रंग बना सकते हो?' },
  states: { en: 'Can you tell a solid from a liquid?', hi: 'क्या तुम ठोस और तरल पहचान सकते हो?' },
  float: { en: 'Can you guess what floats?', hi: 'क्या तुम बता सकते हो कि क्या तैरेगा?' },
  count: { en: 'Can you count them all?', hi: 'क्या तुम सबको गिन सकते हो?' },
  home: { en: 'Can you find an animal\'s home?', hi: 'क्या तुम किसी जानवर का घर ढूँढ सकते हो?' },
  magnet: { en: 'Can you find everything a magnet pulls?', hi: 'क्या तुम वे सब चीज़ें ढूँढ सकते हो जो चुंबक खींचता है?' },
  life: { en: 'Can you put a life cycle in order?', hi: 'क्या तुम एक जीवन चक्र को क्रम में लगा सकते हो?' },
  ph: { en: 'Can you hit the right pH?', hi: 'क्या तुम सही pH बना सकते हो?' },
  filter: { en: 'Can you change how something looks with coloured light?', hi: 'क्या तुम रंगीन रोशनी से किसी चीज़ का रंग बदल सकते हो?' },
  angle: { en: 'Can you make an angle by eye?', hi: 'क्या तुम आँख से अंदाज़ा लगाकर कोण बना सकते हो?' },
  cell: { en: 'Can you finish a new cell or germ puzzle?', hi: 'क्या तुम कोशिका या जीवाणु की नई पहेली पूरी कर सकते हो?' },
};

const today = () => new Date().toISOString().slice(0, 10);
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export function labsFor(band: Band): Lab[] {
  if (band === 'inventor') return LABS.filter(l => !l.only);
  return LABS.filter(l => l.id === 'colour' || l.only === band);
}

/** Today's ask for this player, chosen once per day from labs they have not finished. */
export function dailyFor(p: Profile & { daily?: Daily }): Daily | null {
  const d = today();
  if (p.daily && p.daily.day === d && LABS.some(l => l.id === p.daily!.lab)) return p.daily;
  const open = labsFor(p.band).filter(l => labProgress(l, readSlot(p.id, l.world)) < l.progress.total);
  if (!open.length) return null;
  p.daily = { day: d, lab: open[hash(d + p.id) % open.length].id, done: false }; saveShell();
  return p.daily;
}

/** Called with the labs where the player just made progress. Returns true if today's ask is now done. */
export function dailyProgress(p: Profile & { daily?: Daily }, labs: Set<string>): boolean {
  const dl = p.daily; if (!dl || dl.done || dl.day !== today() || !labs.has(dl.lab)) return false;
  dl.done = true; addCoins(p, RULES.coins.daily); return true;
}

export function dailyText(dl: Daily, lang: 'en' | 'hi') {
  const lab = LABS.find(l => l.id === dl.lab)!, who = WHO[ZONE[lab.subject]];
  return { icon: who.icon, who: who[lang], ask: ASK[lab.id][lang], lab };
}
