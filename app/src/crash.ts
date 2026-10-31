// Turns JavaScript errors into a message on screen instead of closing the app, and keeps
// the last one so it can be shown (and reported) on the next launch.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LAST_ERROR_KEY = 'curio-last-error';
type Listener = (msg: string) => void;
let listener: Listener | null = null;
let pending: string | null = null;

export function onCrash(fn: Listener) { listener = fn; if (pending) fn(pending); }

export function reportError(e: unknown, where: string) {
  const err = e as { message?: string; stack?: string };
  const msg = `${where}: ${err?.message || String(e)}\n${(err?.stack || '').split('\n').slice(0, 8).join('\n')}`;
  pending = msg;
  AsyncStorage.setItem(LAST_ERROR_KEY, `${new Date().toISOString()}\n${msg}`).catch(() => {});
  listener?.(msg);
}

type EU = { getGlobalHandler(): (e: unknown, fatal?: boolean) => void; setGlobalHandler(h: (e: unknown, fatal?: boolean) => void): void };
const EU = (globalThis as unknown as { ErrorUtils?: EU }).ErrorUtils;
if (EU) EU.setGlobalHandler((e, fatal) => reportError(e, fatal ? 'Fatal error' : 'Error'));
