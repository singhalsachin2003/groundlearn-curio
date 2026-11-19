"""Free version (iOS) checks: level and discovery gates, daily lab open, trial, unlock, and default (Android/browser) unchanged.
Run: python3 -I tests/locks.py [out-dir]   (after `npm run build`)."""
import sys, pathlib, asyncio, json
from playwright.async_api import async_playwright
HERE = pathlib.Path(__file__).resolve().parent
DIST = (HERE.parent / 'dist' / 'index.html').read_text()
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/curio-locks'); OUT.mkdir(parents=True, exist_ok=True)
fails = []
def check(c, m):
    print(('ok · ' if c else 'FAIL · ') + m)
    if not c: fails.append(m)
TODAY = "new Date().toISOString().slice(0,10)"

async def setup(b, locks, band='inventor'):
    pg = await b.new_page(viewport={'width': 430, 'height': 900})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    if locks: await pg.add_init_script("window.__CURIO_LOCKS = true; window.__CURIO_PLATFORM = 'ios'; window.__CURIO_ADS = false;")
    await pg.route('https://curio.test/', lambda r: r.fulfill(body=DIST, content_type='text/html'))
    await pg.goto('https://curio.test/'); await pg.wait_for_selector('#obNext')
    for _ in range(2): await pg.click('#obNext')
    await pg.click('#ruOk'); await pg.click('#pAdd'); await pg.fill('#npName', 'Manan'); await pg.click(f'[data-band="{band}"]'); await pg.click('#npGo')
    await pg.wait_for_selector('.hub3d'); await pg.wait_for_timeout(400)
    return pg, errs

async def seed(pg, world, save, daily_lab, ex):
    await pg.evaluate(f"""(() => {{ const sh = window.__shell, p = sh.active(); p.ex = {json.dumps(ex)};
      p.daily = {{ day: {TODAY}, lab: {json.dumps(daily_lab)}, done: false }};
      sh.storeWorldSave(p.id, {json.dumps(world)}, {json.dumps(json.dumps(save))}); }})()""")

async def enter(pg, lab):
    await pg.evaluate("window.__shell.hub()"); await pg.wait_for_selector('.hub3d')
    await pg.click('#hAll', force=True); await pg.wait_for_selector(f'.sheet [data-lab="{lab}"]')
    await pg.click(f'.sheet [data-lab="{lab}"]'); await pg.wait_for_timeout(3500)

async def sheet_kind(pg): return await pg.evaluate("(() => { const w = document.getElementById('sheet'); return w.hidden ? '' : w.dataset.kind; })()")
async def wsave(pg, key): return await pg.evaluate(f"JSON.parse(document.querySelector('.world-frame').contentWindow.localStorage.getItem({json.dumps(key)}) || '{{}}')")
async def back(pg):
    await pg.evaluate("(() => { const w = document.getElementById('sheet'); if (!w.hidden) w.querySelector('[data-close]')?.click(); document.getElementById('wBack').click(); })()"); await pg.wait_for_selector('.hub3d')

async def parent(pg):
    await pg.click('#hParent'); q = await pg.inner_text('.gate-q')
    W = {w: i for i, w in enumerate(['zero','one','two','three','four','five','six','seven','eight','nine'])}
    T = {w: i * 10 for i, w in enumerate(['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']) if w}
    a_txt, b_txt = q.split('×'); b_txt = b_txt.split('=')[0].strip(); parts = a_txt.strip().split('-'); a = T[parts[0]] + (W[parts[1]] if len(parts) > 1 else 0)
    await pg.fill('#gIn', str(a * W[b_txt])); await pg.click('#gOk'); await pg.wait_for_selector('#pcSound')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        # --- iOS free version, Inventor band
        pg, errs = await setup(b, True)
        await seed(pg, 'inventor', {'tab': 'nets', 'netsLevel': 3, 'netsDone': {'0': True, '1': True}}, 'launch', ['nets', 'launch', 'forge'])
        await enter(pg, 'nets'); await pg.screenshot(path=str(OUT / 'lock-level.png'))
        check(await sheet_kind(pg) == 'lock', 'level 4 of Cube Nets shows the lock sheet')
        sv = await wsave(pg, 'curio-inventor-v1'); check(sv.get('netsLevel') == 1, f"world falls back to level 2 (netsLevel={sv.get('netsLevel')})")
        await back(pg)
        await pg.click('#hAll', force=True); await pg.wait_for_selector('.sheet [data-lab="nets"]')
        check(await pg.locator('.sheet [data-lab="nets"] .tag.lock').count() == 1, 'Cube Nets card shows a lock')
        check(await pg.locator('.sheet [data-lab="launch"] .tag.lock').count() == 0, "today's Curio lab card has no lock")
        await pg.screenshot(path=str(OUT / 'lock-cards.png')); await pg.evaluate("document.querySelector('#sheet [data-close]').click()")
        # Daily lab is fully open today.
        await seed(pg, 'inventor', {'tab': 'launch', 'launchLevel': 4, 'launchStars': {'0': 3, '1': 3}}, 'launch', ['nets', 'launch', 'forge'])
        await enter(pg, 'launch')
        check(await sheet_kind(pg) != 'lock', "Curio of the day lab opens at level 5 with no lock")
        sv = await wsave(pg, 'curio-inventor-v1'); check(sv.get('launchLevel') == 4, f"launch stays on level 5 (launchLevel={sv.get('launchLevel')})")
        await back(pg)
        # Discoveries: 5 free.
        r = await pg.evaluate("[window.curioWorld.findOpen('forge', 4), window.curioWorld.findOpen('forge', 5)]")
        check(r == [True, False], f'forge discoveries: 5th allowed, 6th locked {r}')
        check(await sheet_kind(pg) == 'lock', 'the 6th discovery shows the lock sheet'); await pg.screenshot(path=str(OUT / 'lock-found.png'))
        await pg.evaluate("document.querySelector('#sheet [data-close]').click()")
        # Parent Corner: trial offer with full disclosure, then start the trial (browser stand-in).
        await parent(pg); await pg.screenshot(path=str(OUT / 'parent-free.png'), full_page=True)
        txt = await pg.inner_text('.pc')
        check(await pg.locator('#pcTrial').count() == 1 and await pg.locator('#pcBuy').count() == 1, 'Parent Corner offers the 7-day trial and the unlock')
        check('7 days' in txt and 'Nothing is charged' in txt and 'lock again' in txt, 'trial terms (duration, no charge, what locks after) are shown before it starts')
        check(await pg.locator('#pcAdH').count() == 0, 'no reward-ads switch without ads')
        await pg.click('#pcTrial'); await pg.wait_for_timeout(1200)
        end = await pg.evaluate("window.__shell.S.trialEnd || 0"); now = await pg.evaluate("Date.now()")
        check(6.9 * 86400e3 < end - now < 7.1 * 86400e3, 'trial runs for 7 days')
        check(await pg.locator('.pc .trial').count() == 1, 'Parent Corner shows the days left'); await pg.screenshot(path=str(OUT / 'parent-trial.png'), full_page=True)
        await pg.evaluate("document.querySelector('#sheet [data-close]').click()")
        r = await pg.evaluate("window.curioWorld.levelOpen('nets', 5)"); check(r == 5, 'during the trial every level opens')
        # Trial over.
        await pg.evaluate("window.__shell.S.trialEnd = Date.now() - 1000")
        r = await pg.evaluate("window.curioWorld.levelOpen('nets', 5)"); check(r == 1, 'after the trial, levels after 2 lock again')
        await pg.evaluate("document.querySelector('#sheet [data-close]')?.click()")
        await parent(pg); txt = await pg.inner_text('.pc')
        check('trial has ended' in txt and await pg.locator('#pcTrial').count() == 0, 'ended trial is not offered again')
        # Unlock (browser stand-in for the purchase).
        await pg.click('#pcBuy'); await pg.wait_for_selector('#emSkip'); await pg.click('#emSkip'); await pg.wait_for_timeout(1200)
        check(await pg.evaluate("window.__shell.S.adFree") is True, 'unlock purchase sets the whole island open')
        await parent(pg) if await sheet_kind(pg) != 'parent' else None
        txt = await pg.inner_text('.pc'); check('unlocked' in txt, 'Parent Corner thanks the family'); await pg.screenshot(path=str(OUT / 'parent-owned.png'), full_page=True)
        await pg.evaluate("document.querySelector('#sheet [data-close]').click()")
        r = await pg.evaluate("[window.curioWorld.levelOpen('nets', 5), window.curioWorld.findOpen('forge', 20)]"); check(r == [5, True], 'unlocked: every level and discovery open')
        check(not errs, f'no page errors {errs[:2]}')
        await pg.close()
        # --- Explorer band (start(i) engine) and Tinkerer engine via inventor2
        pg, errs = await setup(b, True, 'explorer')
        await seed(pg, 'explorer', {'tab': 'seesaw', 'seesawDone': {'0': True, '1': True}}, 'fizz', ['seesaw', 'fizz'])
        await enter(pg, 'seesaw'); check(await sheet_kind(pg) == 'lock', 'Explorer lab: level 3 shows the lock sheet')
        await pg.screenshot(path=str(OUT / 'lock-explorer.png')); await back(pg)
        check(not errs, f'no page errors (explorer) {errs[:2]}'); await pg.close()
        pg, errs = await setup(b, True, 'tinkerer')
        await seed(pg, 'inventor2', {'tab': 'groups', 'groupsDone': {'0': True, '1': True}}, 'atom', ['groups', 'atom'])
        await enter(pg, 'groups'); check(await sheet_kind(pg) == 'lock', 'inventor2 lab: level 3 shows the lock sheet'); await back(pg)
        await seed(pg, 'tinkerer', {'tab': 'mirror', 'mirrorLevel': 2, 'mirrorStars': {'0': 3, '1': 3}}, 'atom', ['groups', 'atom', 'mirror'])
        await enter(pg, 'mirror'); check(await sheet_kind(pg) == 'lock', 'tinkerer lab: level 3 shows the lock sheet'); await back(pg)
        check(not errs, f'no page errors (tinkerer) {errs[:2]}'); await pg.close()
        # --- Default build (Android / browser): nothing locked
        pg, errs = await setup(b, False)
        await seed(pg, 'inventor', {'tab': 'nets', 'netsLevel': 3, 'netsDone': {'0': True, '1': True}}, 'launch', ['nets'])
        await enter(pg, 'nets'); check(await sheet_kind(pg) != 'lock', 'Android/browser: no lock')
        sv = await wsave(pg, 'curio-inventor-v1'); check(sv.get('netsLevel') == 3, 'Android/browser: level 4 opens')
        await back(pg); await parent(pg)
        check(await pg.locator('#pcTrial').count() == 0 and 'Ad-free' in await pg.inner_text('.pc'), 'Android/browser Parent Corner unchanged (Ad-free, no trial)')
        check(not errs, f'no page errors (default) {errs[:2]}')
        await b.close()
    print('FAILS:', fails)
    if fails: sys.exit(1)
asyncio.run(main())
