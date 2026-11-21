// Copy the web build into the groundlearn.com site repo at play/curio-island/.
// Usage (from the repo root): npm run publish:web [-- path/to/groundlearn-site]
// The old copy is replaced, so files from earlier builds don't pile up.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist-web');
const site = resolve(process.argv[2] || resolve(here, '../../../groundlearn-site'));
if (!existsSync(resolve(dist, 'index.html'))) throw new Error('no web build: run npm run build:web first');
if (!existsSync(resolve(site, 'CNAME'))) throw new Error('not the groundlearn.com site repo: ' + site);

const target = resolve(site, 'play/curio-island');
rmSync(target, { recursive: true, force: true });
cpSync(dist, target, { recursive: true });
console.log(`web build copied → ${target}`);
