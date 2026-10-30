import './styles.css';
import { FONTS } from './fonts';
import { start } from './app';

// Register fonts in the shell itself, then start.
FONTS.forEach(f => { try { const ff = new FontFace(f.family, f.buf.slice(0), f.desc); document.fonts.add(ff); ff.load().catch(() => null); } catch { /* old WebView: system fonts */ } });
start(document.getElementById('app')!);
