// Turns the Tinkerer Lab's English into Hindi while it runs. Whole strings are looked up
// (an element's HTML first, so lines with bold parts match, then single text pieces), then
// number patterns handle lines the labs build. Anything without an entry stays English.
import { HI_TK } from './tinkerer_dict';

const D = new Map<string, string>(Object.entries(HI_TK));
const FLOWER: Record<string, string> = { Purple: 'बैंगनी', White: 'सफ़ेद' };
const look = (s: string) => D.get(s.trim()) ?? s;

/** Number patterns, applied to one text piece. */
const PAT: [RegExp, (...m: string[]) => string][] = [
  [/^Molecule (\d+) built$/, (_m, a) => `अणु ${a} बन गया`], [/^Molecule (\d+) of (\d+)$/, (_m, a, b) => `अणु ${a} / ${b}`],
  [/^Found (\d+)\/(\d+)$/, (_m, a, b) => `मिले ${a}/${b}`], [/^New discovery! (\d+) of (\d+)$/, (_m, a, b) => `नई खोज! ${b} में से ${a}`],
  [/^Discovery (\d+) of (\d+)$/, (_m, a, b) => `खोज ${a} / ${b}`], [/^All (\d+) found$/, (_m, a) => `सारे ${a} मिल गए`],
  [/^Mirrors left: (\d+)$/, (_m, a) => `बचे दर्पण: ${a}`],
  [/^Level (\d+) complete$/, (_m, a) => `स्तर ${a} पूरा`], [/^Level (\d+) of (\d+)$/, (_m, a, b) => `स्तर ${a} / ${b}`], [/^Level (\d+)$/, (_m, a) => `स्तर ${a}`],
  [/^Picture (\d+) complete$/, (_m, a) => `चित्र ${a} पूरा`], [/^Picture (\d+) of (\d+)$/, (_m, a, b) => `चित्र ${a} / ${b}`],
  [/^Cross (\d+) solved$/, (_m, a) => `मेल ${a} हल हुआ`], [/^Cross (\d+) of (\d+)$/, (_m, a, b) => `मेल ${a} / ${b}`],
  [/^Chain (\d+) built$/, (_m, a) => `शृंखला ${a} बन गई`], [/^Chain (\d+) of (\d+)$/, (_m, a, b) => `शृंखला ${a} / ${b}`],
  [/^Link (\d+) of (\d+)$/, (_m, a, b) => `कड़ी ${a} / ${b}`], [/^Dot (\d+) of (\d+)$/, (_m, a, b) => `बिंदु ${a} / ${b}`],
  [/^(\d+) dots plotted\.$/, (_m, a) => `${a} बिंदु लगे।`], [/^Build (.+)$/, (_m, a) => `बनाओ: ${look(a)}`],
  [/^(\d+) mirrors? used · the fewest possible is (\d+)$/, (_m, a, b) => `${a} दर्पण लगे · सबसे कम संभव: ${b}`],
  [/^(Purple|White) flowers$/, (_m, a) => `${FLOWER[a]} फूल`],
  [/^(\d+) purple and (\d+) white babies\.$/, (_m, a, b) => `${a} बैंगनी और ${b} सफ़ेद बच्चे।`],
  [/^(\d+) purple and (\d+) white\. Not quite\. Try other parents\.$/, (_m, a, b) => `${a} बैंगनी और ${b} सफ़ेद। बिल्कुल नहीं। दूसरे माता-पिता आज़माओ।`],
  [/^(\d+) purple$/, (_m, a) => `${a} बैंगनी`], [/^(\d+) white$/, (_m, a) => `${a} सफ़ेद`],
  [/^(\d+) across$/, (_m, a) => `${a} आड़े`], [/^(\d+) up$/, (_m, a) => `${a} ऊपर`], [/^(\d+) of (\d+)$/, (_m, a, b) => `${b} में से ${a}`],
  [/^A food chain for (.+)$/, (_m, a) => `खाद्य शृंखला: ${look(a)}`], [/^You drew (.+)!$/, (_m, a) => `तुमने बनाया: ${look(a)}!`],
  [/^That is (.+), (.+)\. A real molecule! This puzzle wants (.+)\.$/, (_m, a, f, w) => `यह ${look(a)} है, ${f}। असली अणु! यह पहेली ${w} माँग रही है।`],
  [/^All hands are full, but that is not (.+)\. Try Undo\.$/, (_m, a) => `सारे हाथ भरे हैं, पर यह ${a} नहीं है। पीछे जाओ दबाओ।`],
  [/^You picked (\d+) across and (\d+) up\. Look at the numbers again\.$/, (_m, a, b) => `तुमने ${a} आड़े और ${b} ऊपर चुना। संख्याएँ फिर देखो।`],
  [/^(.+) does not make its own food\. Start with the plant\.$/, (_m, a) => `${look(a)} अपना भोजन नहीं बनाता। पौधे से शुरू करो।`],
  [/^The (.+) does not eat the (.+) here\.$/, (_m, a, b) => `यहाँ ${look(a[0].toUpperCase() + a.slice(1))} ${look(b[0].toUpperCase() + b.slice(1))} को नहीं खाता।`],
  [/^Every hand is holding on: (\d+)\.$/, (_m, a) => `हर हाथ पकड़े हुए है: ${a}।`],
  [/^You have (\d+) so far\.$/, (_m, a) => `अब तक ${a} हाथ भरे हैं।`],
  [/^Who eats the (.+)\?$/, (_m, a) => `${look(a[0].toUpperCase() + a.slice(1))} को कौन खाता है?`],
  [/^(\d+) hands? (?:is|are) still reaching\.$/, (_m, a) => `${a} हाथ अब भी ख़ाली हैं।`],
  [/^(\d+) purple$/, (_m, a) => `${a} बैंगनी`],
];

function piece(raw: string): string | null {
  const t = raw.trim(); if (!t) return null;
  let out = D.get(t);
  if (out === undefined) for (const [re, f] of PAT) { const m = t.match(re); if (m) { out = f(...m); break; } }
  return out !== undefined && out !== t ? raw.replace(t, out) : null;
}

function walk(n: Node) {
  if (n.nodeType === 3) { const v = piece(n.nodeValue || ''); if (v !== null) n.nodeValue = v; return; }
  if (n.nodeType !== 1) return;
  const el = n as Element, tag = el.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CANVAS' || tag === 'svg') return;
  if (byHtml(el)) return;
  el.childNodes.forEach(walk);
}
/** Replace an element whose whole HTML (with bold parts and so on) is a known line. */
function byHtml(el: Element): boolean {
  if (!el.firstElementChild) return false;
  const html = el.innerHTML.trim(), hit = D.get(html);
  if (hit === undefined || hit === html) return false;
  el.innerHTML = hit; return true;
}

export function makeTinkererTranslator() {
  function observe(doc: Document) {
    const start = () => {
      walk(doc.body);
      new MutationObserver(list => list.forEach(m => {
        if (m.type === 'characterData') { walk(m.target); return; }
        const t = m.target as Element;
        // innerHTML = '…<b>…</b>…' adds only the pieces, so look at the parent's whole HTML first
        if (t !== doc.body && t.nodeType === 1 && byHtml(t)) return;
        m.addedNodes.forEach(walk);
      })).observe(doc.body, { childList: true, characterData: true, subtree: true });
    };
    if (doc.body) start(); else doc.addEventListener('DOMContentLoaded', start);
  }
  return { observe, text: (s: string) => D.get(s.trim()) ?? s, meta: (s: string) => piece(s) ?? s };
}
