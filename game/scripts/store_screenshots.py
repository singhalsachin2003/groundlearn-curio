"""App Store screenshots for Curio Island: iPhone 6.9" (1320x2868) and iPad 13" (2752x2064 landscape).
Run after `npm run build`: python3 -I scripts/store_screenshots.py <out-dir> iphone,ipad
Then copy the picks into app/store/screenshots-ios/{iphone,ipad}/ (see the README there)."""
import sys, pathlib, asyncio, json
from playwright.async_api import async_playwright
DIST = (pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'index.html').read_text()
OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
DEV = {'iphone': (440, 956, 3), 'ipad': (1376, 1032, 2)}

async def profile(pg, band, name):
    await pg.click('#pAdd'); await pg.fill('#npName', name); await pg.click(f'[data-band="{band}"]'); await pg.click('#npGo')
    await pg.wait_for_selector('.hub3d')

async def seed(pg):
    await pg.evaluate("""(() => { const sh = window.__shell, p = sh.active();
      p.ex = ['colour','forge','react','launch','light','circuit','mach','balance','graph','nets','genes','body','eco','matter','fraction','sound','cell','moon','area','decimal','pythag','ph','filter','angle','atom','kitchen','mirror','coord','pea','chain','groups','ladoo','symmetry','water','magnet','life','senses','plants','materials','shapes','forces','coins','fizz','seesaw','bulb','scales','baby','pond','share','clock','pattern','daynight','mix','states','float','count','home'];
      p.coins = 1240; sh.S.adFree = true; p.daily = { day: new Date().toISOString().slice(0,10), lab: 'circuit', done: false };
      if (p.band === 'inventor') sh.storeWorldSave(p.id, 'inventor', JSON.stringify({ launchStars: {0:3,1:3,2:2}, balSolved: {0:1,1:1,2:1,3:1}, circDone: {0:1,1:1}, graphStars: {0:3,1:2}, geneDone: {0:1}, netsDone: {0:1,1:1}, lightStars: {0:3} }));
      if (p.band === 'inventor') sh.storeWorldSave(p.id, 'inventor2', JSON.stringify({ fractionDone: {0:1,1:1}, phDone: {0:1}, moonDone: {0:1,1:1} }));
      if (p.band === 'inventor') sh.storeWorldSave(p.id, 'colour', JSON.stringify({ found: [] }));
      if (p.band === 'explorer') sh.storeWorldSave(p.id, 'explorer', JSON.stringify({ fizzDone: {0:1,1:1}, seesawDone: {0:1}, countDone: {0:1,1:1,2:1} }));
      if (p.band === 'tinkerer') sh.storeWorldSave(p.id, 'tinkerer', JSON.stringify({ atomDone: {0:1,1:1}, mirrorStars: {0:3} }));
      sh.hub(); })()""")
    await pg.wait_for_timeout(1500)

async def lab(pg, lab, show_ms=None, before=None):
    await pg.click('#hAll', force=True); await pg.wait_for_selector(f'.sheet [data-lab="{lab}"]')
    await pg.click(f'.sheet [data-lab="{lab}"]'); await pg.wait_for_timeout(3500)
    await pg.evaluate("(() => { const w = document.getElementById('sheet'); if (!w.hidden) w.querySelector('[data-close]')?.click(); })()")
    if before: await pg.evaluate(before)
    if show_ms:
        await pg.evaluate(f"(() => {{ const w = document.querySelector('.world-frame').contentWindow, g = w.__curio && w.__curio[{json.dumps(lab)}]; if (g && g.show) g.show(); }})()")
        await pg.wait_for_timeout(show_ms)
    else: await pg.wait_for_timeout(800)

async def back(pg):
    await pg.evaluate("document.getElementById('wBack').click()"); await pg.wait_for_selector('.hub3d'); await pg.wait_for_timeout(500)

async def run(b, dev):
    w, h, s = DEV[dev]
    pg = await b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=s, has_touch=True)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script("window.__CURIO_PLATFORM = 'ios'; window.__CURIO_ADS = false; window.__CURIO_LOCKS = true;")
    await pg.route('https://curio.test/', lambda r: r.fulfill(body=DIST, content_type='text/html'))
    await pg.goto('https://curio.test/'); await pg.wait_for_selector('#obNext')
    for _ in range(2): await pg.click('#obNext')
    await pg.click('#ruOk')
    async def shot(n): await pg.screenshot(path=str(OUT / f'{dev}-{n}.png'), timeout=120000)
    await profile(pg, 'inventor', 'Manan'); await seed(pg); await shot('hub')
    await pg.click('#hAll', force=True); await pg.wait_for_timeout(700); await shot('all'); await pg.evaluate("document.querySelector('#sheet [data-close]').click()")
    for name, ms in [('forge', 2600), ('launch', 1500), ('circuit', 2200), ('light', 2000), ('body', None), ('genes', None)]:
        await lab(pg, name, ms); await shot(name); await back(pg)
    await lab(pg, 'colour'); await shot('colour'); await back(pg)
    await lab(pg, 'fraction'); await shot('fraction'); await back(pg)
    await lab(pg, 'moon'); await shot('moon'); await back(pg)
    await pg.click('#hWho', force=True)
    await pg.wait_for_selector('#pAdd'); await profile(pg, 'explorer', 'Aanya'); await seed(pg); await shot('hub-explorer')
    for name in ['fizz', 'seesaw', 'baby', 'count']:
        await lab(pg, name); await shot(name); await back(pg)
    await pg.click('#hWho', force=True); await pg.wait_for_selector('#pAdd')
    await profile(pg, 'tinkerer', 'Kabir'); await seed(pg); await shot('hub-tinkerer')
    for name, ms in [('atom', None), ('mirror', 1800), ('coord', None), ('coins', None)]:
        await lab(pg, name, ms); await shot(name); await back(pg)
    print(dev, 'errors:', errs[:3]); await pg.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for dev in (sys.argv[2] if len(sys.argv) > 2 else 'iphone,ipad').split(','): await run(b, dev)
        await b.close()
asyncio.run(main())
