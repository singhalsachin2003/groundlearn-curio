import './styles.css';
import { installFonts } from './fonts';
import { start } from './app';

// Register fonts in the shell itself, then start (they swap in when ready).
try { installFonts(document, FontFace).catch(() => null); } catch { /* old WebView: system fonts */ }
start(document.getElementById('app')!);
