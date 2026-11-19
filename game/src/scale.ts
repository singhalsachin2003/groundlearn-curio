// Tablet scaling. The shell and the worlds were laid out for phones, so on a tablet they
// rendered at phone size in the middle of a big screen. One UI scale, from the shorter side
// of the window so it is the same in portrait and landscape: 1 on every phone, 1.2 on an
// iPad mini, about 1.35 on an 11-inch iPad and 1.5 on a 13-inch iPad. The shell's panels are
// zoomed by it (styles.css), and each world runs in an iframe laid out at 1/scale and scaled
// up, so a world sees a large-phone-sized screen and keeps its own layout.
const PHONE_SIDE = 620, MAX = 1.5;

export function uiScale(): number {
  const s = Math.min(innerWidth, innerHeight) / PHONE_SIDE;
  return Math.round(Math.min(MAX, Math.max(1, s)) * 100) / 100;
}

export function applyUiScale() {
  document.documentElement.style.setProperty('--ui', String(uiScale()));
}
