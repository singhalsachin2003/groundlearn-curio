// Turns the Inventor Lab's English into Hindi while it runs. Mission texts and hints
// are translated as whole strings; buttons, labels and status lines are translated
// text node by text node as the lab writes them. Anything without an entry stays English.
import { HI_TEXT, HI_UI } from './inventor';

export interface Translator { text(s: string): string; meta(s: string): string; observe(doc: Document): void }

const META: Record<string, string> = { Mission: 'मिशन', Level: 'लेवल', Puzzle: 'पहेली', Experiment: 'प्रयोग', Graph: 'ग्राफ़', Circuit: 'परिपथ', Machine: 'मशीन' };

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
    let out: string | undefined = HI_UI[t];
    if (!out) {
      const m1 = t.match(/^Your strength: (\d+) N$/); if (m1) out = `तुम्हारी ताक़त: ${m1[1]} N`;
      const m2 = t.match(/^Nets found (\d+)\/11$/); if (m2) out = `मिले जाल ${m2[1]}/11`;
    }
    if (!out || out === t) return null;
    return raw.replace(t, out);
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
