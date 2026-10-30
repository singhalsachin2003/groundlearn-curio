// Turns the Inventor Lab's English into Hindi while it runs. Mission texts and hints
// are translated as whole strings; buttons, labels and status lines are translated
// text node by text node as the lab writes them. Anything without an entry stays English.
import { HI_TEXT, HI_UI, HI_UI2 } from './inventor';

export interface Translator { text(s: string): string; meta(s: string): string; observe(doc: Document): void }

const META: Record<string, string> = { Mission: 'मिशन', Level: 'लेवल', Puzzle: 'पहेली', Experiment: 'प्रयोग', Graph: 'ग्राफ़', Circuit: 'परिपथ', Machine: 'मशीन' };
const EL: Record<string, string> = { Hydrogen: 'हाइड्रोजन', Carbon: 'कार्बन', Nitrogen: 'नाइट्रोजन', Oxygen: 'ऑक्सीजन', Sulfur: 'सल्फ़र', Chlorine: 'क्लोरीन' };
const UI: Record<string, string> = Object.assign({}, HI_UI2, HI_UI, {"force × distance = force × distance": "बल × दूरी = बल × दूरी", "effort = load ÷ rope sections": "प्रयास = भार ÷ रस्सी के हिस्से", "work going up = work along the ramp": "ऊपर उठाने का कार्य = ढलान पर किया गया कार्य", "grass → deer → tiger": "घास → हिरण → बाघ", "This forest runs on a simple predator–prey model (Lotka–Volterra). Real forests have many more species and links.": "यह जंगल शिकारी–शिकार के एक सरल मॉडल (लोटका–वोल्टेरा) पर चलता है। असली जंगलों में कहीं ज़्यादा प्रजातियाँ और रिश्ते होते हैं।", "This board uses 1.5 V cells. Never experiment with mains electricity from a wall socket.": "यह बोर्ड 1.5 V के सेल इस्तेमाल करता है। दीवार के सॉकेट की बिजली से कभी प्रयोग मत करना।", "Real balls slow down in air, so real shots land a little shorter.": "असली गेंदें हवा में धीमी हो जाती हैं, इसलिए असली फेंक थोड़ी कम दूर गिरती है।", "angle of incidence = angle of reflection": "आपतन कोण = परावर्तन कोण", "Lines like this describe anything that changes at a steady rate, like a taxi fare: a fixed starting charge (c) plus the same amount for every kilometre (m).": "ऐसी रेखाएँ किसी भी स्थिर दर से बदलने वाली चीज़ को दिखाती हैं, जैसे टैक्सी का किराया: तय शुरुआती रक़म (c) और हर किलोमीटर के लिए उतनी ही रक़म (m)।", "Each net is drawn once, however you turn or flip it.": "हर जाल एक बार बनाया गया है, चाहे तुम उसे कैसे भी घुमाओ या पलटो।", "Net journal": "जाल डायरी"});

/** Whole-node patterns for lines the labs build from numbers. */
const WHOLE: [RegExp, string | ((...m: string[]) => string)][] = [
  [/^(Mission|Level|Puzzle|Experiment|Graph|Circuit|Machine) (\d+) complete$/, (_m, w, n) => `${META[w]} ${n} पूरा`],
  [/^(Hydrogen|Carbon|Nitrogen|Oxygen|Sulfur|Chlorine) already has all (\d) of its bonds?\.$/, (_m, e, n) => `${EL[e]} के सारे ${n} बंध पहले से भरे हैं।`],
  [/^(.+) is already in the beaker\.$/, '$1 पहले से बीकर में है।'],
  [/^(.+): you have found this one\.$/, '$1: यह तुम पहले ही खोज चुके हो।'],
  [/^Not found yet$/, 'अभी नहीं मिला'], [/^Bonus$/, 'बोनस'],
  [/^Your pH chart · (\d+) of (\d+)$/, 'तुम्हारा pH चार्ट · $2 में से $1'],
  [/^(\d+)° works\. Now find a different angle that also lands there\.$/, '$1° काम करता है। अब एक अलग कोण ढूँढो जो वहीं गिरे।'],
  [/^That is close to (-?\d+)°\. Find an angle at least 10° away from it\.$/, 'यह $1° के बहुत पास है। उससे कम से कम 10° अलग कोण ढूँढो।'],
  [/^Mirror (\d+)$/, 'दर्पण $1'],
  [/^Bulb (\w+):$/, 'बल्ब $1:'],
  [/^Tap a glowing gap to place the (.+)\.$/, 'चमकती खाली जगह को छूकर यह लगाओ: $1।'],
  [/^Closed switch: (.+) A flows$/, 'बंद स्विच: $1 A बहती है'], [/^Open switch: 0 A$/, 'खुला स्विच: 0 A'],
  [/^Each bulb gets about (.+) V, half the cell’s voltage$/, 'हर बल्ब को लगभग $1 V मिलते हैं, सेल की आधी वोल्टता'],
  [/^Each bulb gets the full (.+) V$/, 'हर बल्ब को पूरे $1 V मिलते हैं'],
  [/^Current from the cell: (.+) A, shared between two paths$/, 'सेल से धारा: $1 A, दो रास्तों में बँटी'],
  [/^Before: (.+) A through the wire$/, 'पहले: तार से $1 A'], [/^After: (.+) A through the bulb$/, 'बाद में: बल्ब से $1 A'],
  [/^Season (\d+)$/, 'मौसम $1'], [/^grass (\d+)$/, 'घास $1'], [/^deer (\d+)$/, 'हिरण $1'], [/^tigers (\d+)$/, 'बाघ $1'],
  [/^After 30 seasons: grass (\d+) · deer (\d+) · tigers (\d+)$/, '30 मौसम बाद: घास $1 · हिरण $2 · बाघ $3'],
  [/^Started with (\d+) deer and (\d+) tigers?$/, '$1 हिरण और $2 बाघों से शुरुआत'],
  [/^Energy flows grass → deer → tiger\. Only about 10% of the energy at each level passes to the next, which is why your forest ended with about (\d+) deer but only (\d+) tigers\.$/,
    'ऊर्जा घास → हिरण → बाघ की ओर बहती है। हर स्तर की सिर्फ़ लगभग 10% ऊर्जा अगले स्तर तक पहुँचती है, इसीलिए तुम्हारे जंगल में आख़िर में लगभग $1 हिरण थे पर सिर्फ़ $2 बाघ।'],
  [/^(\d+) rope sections?$/, 'रस्सी के $1 हिस्से'],
  [/^You would need (\d+) N, but you can only push (\d+) N\. Move the pivot\.$/, 'तुम्हें $1 N चाहिए, पर तुम सिर्फ़ $2 N लगा सकते हो। आलंब खिसकाओ।'],
  [/^It worked, but you pulled (\d+) m of rope for every 1 m of lift\. Can you do it with less rope\?$/, 'काम बन गया, पर हर 1 m उठाने के लिए तुमने $1 m रस्सी खींची। क्या कम रस्सी में कर सकते हो?'],
  [/^Each rope would need (\d+) N, more than your (\d+) N\.$/, 'हर रस्सी पर $1 N चाहिए, जो तुम्हारे $2 N से ज़्यादा है।'],
  [/^You would need (\d+) N\. Try a longer ramp\.$/, 'तुम्हें $1 N चाहिए। लंबी ढलान आज़माओ।'],
  [/^(\d+) N ÷ (\d+) = (\d+) N, but you pulled (\d+) m of rope per metre$/, '$1 N ÷ $2 = $3 N, पर तुमने हर मीटर के लिए $4 m रस्सी खींची'],
  [/^New net for your journal: (\d+) of 11$/, 'डायरी के लिए नया जाल: 11 में से $1'],
  [/^(\d) and (\d) are opposite, and they add up to (\d+), not 7\.$/, '$1 और $2 आमने-सामने हैं, और उनका जोड़ $3 है, 7 नहीं।'],
  [/^(\d+) of 11$/, '11 में से $1'], [/^(\d+) of 11 nets found$/, '11 में से $1 जाल मिले'],
  [/^The scale tipped: (left|right) side is heavier\. Take the same away from the other side\.$/, (_m, s) => `तराज़ू झुक गया: ${s === 'left' ? 'बाईं' : 'दाईं'} तरफ़ भारी है। दूसरी तरफ़ से भी उतना ही हटाओ।`],
  [/^Every amount on the scale splits into (\d+) equal groups\. You can share both sides into (\d+)\.$/, 'तराज़ू पर हर मात्रा $1 बराबर हिस्सों में बँटती है। तुम दोनों तरफ़ को $2 हिस्सों में बाँट सकते हो।'],
  [/^Share into (\d+) groups$/, '$1 हिस्सों में बाँटो'],
  [/^Your (\d+) seeds$/, 'तुम्हारे $1 बीज'], [/^Tall ([\d.]+) : Short ([\d.]+)$/, 'लंबे $1 : बौने $2'],
  [/^tall (\d+) · short (\d+) · purple (\d+) · white (\d+)$/, 'लंबे $1 · बौने $2 · बैंगनी $3 · सफ़ेद $4'],
];
/** Pieces inside longer lines (readouts built from several parts). */
const PIECES: [RegExp, string | ((...m: string[]) => string)][] = [
  [/^(Hydrogen|Carbon|Nitrogen|Oxygen|Sulfur|Chlorine) · (\d) of (\d) bonds? used/, (_m, e, a, b) => `${EL[e]} · ${b} में से ${a} बंध इस्तेमाल`],
  [/\. Add an atom below to bond it here, or tap another atom\./, '। यहाँ जोड़ने के लिए नीचे से कोई परमाणु डालो, या किसी दूसरे परमाणु को छुओ।'],
  [/\. Full: tap another atom to select it\./, '। भरा हुआ: दूसरा परमाणु चुनने के लिए उसे छुओ।'],
  [/ · part of $/, ' · इसका हिस्सा: '], [/ · every bond is full/, ' · हर बंध भरा है'],
  [/Mission complete! /, 'मिशन पूरा! '], [/Next mission unlocked\./, 'अगला मिशन खुल गया।'],
  [/You finished every mission\. Hunt for the bonus molecules\./, 'तुमने सारे मिशन पूरे कर लिए। अब बोनस अणु ढूँढो।'],
  [/^Green zone from $/, 'हरा हिस्सा: '], [/^ to $/, ' से '], [/^Target at $/, 'निशाना: '],
  [/\. This lab ignores air resistance\./, '। यह लैब हवा के प्रतिरोध को नहीं गिनती।'],
  [/^Landed $/, 'गेंद गिरी: '], [/^ away on the ledge · highest point $/, ' दूर, कगार पर · सबसे ऊँचा बिंदु '], [/^ away · highest point $/, ' दूर · सबसे ऊँचा बिंदु '], [/^ in the air\.$/, ' हवा में।'],
  [/^Hit the wall $/, 'दीवार से टकराई: '], [/^ up\. The wall is (\d+) m tall\.$/, ' ऊँचाई पर। दीवार $1 m ऊँची है।'],
  [/^Hit the side of the ledge $/, 'कगार के किनारे से टकराई: '], [/^ up\. Come down onto the top\.$/, ' ऊँचाई पर। ऊपर उतरो।'],
  [/^ is at $/, ' का कोण: '], [/^\. Tap a silver mirror to select it, then turn it\. Tapping it again also turns it\.$/, '। किसी चाँदी जैसे दर्पण को छूकर चुनो, फिर घुमाओ। दोबारा छूने से भी वह घूमता है।'],
  [/^Current from the cell: $/, 'सेल से धारा: '],
  [/^Rock side $/, 'चट्टान की तरफ़ '], [/^ · your side $/, ' · तुम्हारी तरफ़ '], [/^ · push needed $/, ' · ज़रूरी धक्का '], [/ \(you have (\d+) N\)/, ' (तुम्हारे पास $1 N)'],
  [/^Asha: $/, 'आशा: '], [/^ · Ravi: $/, ' · रवि: '],
  [/^ hold the load · each pulls $/, ' भार उठाते हैं · हर एक पर '], [/ · to lift 1 m you pull $/, ' · 1 m उठाने के लिए तुम खींचते हो '], [/^ of rope$/, ' रस्सी'],
  [/^Ramp $/, 'ढलान '], [/^ long · push needed $/, ' लंबी · ज़रूरी धक्का '],
  [/ Try different numbers\./, ' अलग संख्याएँ आज़माओ।'],
  [/^ of 6 squares placed$/, ' / 6 वर्ग लगे'], [/^ squares: a cube has only 6 faces$/, ' वर्ग: घन के सिर्फ़ 6 फलक होते हैं'],
  [/^Blank faces left: $/, 'बचे खाली फलक: '],
  [/ · (\d) of (\d) bonds? used/, ' · $2 में से $1 बंध इस्तेमाल'],
  [/ in the air\./, ' हवा में।'], [/^Shot (\d+)\.$/, 'शॉट $1।'], [/^Shots: (\d+)$/, 'शॉट: $1'],
  [/^Earth · /, 'धरती · '], [/^Moon · /, 'चाँद · '], [/^Mars · /, 'मंगल · '],
];

export function makeTranslator(): Translator {
  const map = new Map(HI_TEXT);
  const keys = [...map.keys()].sort((a, b) => b.length - a.length);
  const suffix = (s: string) => s
    .replace(/<b>(\d+) of (\d+) found\.<\/b>/, '<b>$2 में से $1 मिले।</b>')
    .replace(/<b>First angle: (-?\d+)°\.<\/b>/, '<b>पहला कोण: $1°।</b>');
  function text(s: string): string {
    if (!s) return s;
    const hit = map.get(s); if (hit) return hit;
    for (const k of keys) if (s.startsWith(k)) return map.get(k)! + suffix(s.slice(k.length));
    return suffix(s);
  }
  function meta(s: string): string {
    return s
      .replace(/^(Mission|Level|Puzzle|Experiment|Graph|Circuit|Machine) (\d+) of (\d+)/, (_m, w: string, a: string, b: string) => `${META[w]} ${a} / ${b}`)
      .replace(/^All (\d+) missions done$/, 'सभी $1 मिशन पूरे')
      .replace(' · Blood', ' · रक्त').replace(' · Digestion', ' · पाचन');
  }
  function ui(raw: string): string | null {
    const t = raw.trim(); if (!t) return null;
    let out: string | undefined = UI[t];
    if (!out) {
      const m1 = t.match(/^Your strength: (\d+) N$/); if (m1) out = `तुम्हारी ताक़त: ${m1[1]} N`;
      const m2 = t.match(/^Nets found (\d+)\/11$/); if (m2) out = `मिले जाल ${m2[1]}/11`;
    }
    if (!out) for (const [re, rep] of WHOLE) if (re.test(t)) { out = t.replace(re, rep as string); break; }
    if (out && out !== t) return raw.replace(t, out);
    // pieces work on the raw node so the spaces between parts are kept
    let v = raw;
    for (const [re, rep] of PIECES) v = v.replace(re, rep as string);
    return v !== raw ? v : null;
  }
  function walk(n: Node) {
    if (n.nodeType === 3) { const v = ui(n.nodeValue || ''); if (v !== null) n.nodeValue = v; return; }
    if (n.nodeType !== 1) return;
    const tag = (n as Element).tagName; if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CANVAS') return;
    n.childNodes.forEach(walk);
  }
  function observe(doc: Document) {
    const start = () => {
      walk(doc.body);
      new MutationObserver(list => list.forEach(m => {
        if (m.type === 'characterData') walk(m.target);
        else m.addedNodes.forEach(walk);
      })).observe(doc.body, { childList: true, characterData: true, subtree: true });
    };
    if (doc.body) start(); else doc.addEventListener('DOMContentLoaded', start);
  }
  return { text, meta, observe };
}
