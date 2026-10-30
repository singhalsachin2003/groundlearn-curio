"""Smoke test of the built game in headless Chromium.
Run: python3 -I tests/smoke.py <out-dir>   (after `npm run build`)."""
import sys, pathlib, asyncio, re
from playwright.async_api import async_playwright

HERE = pathlib.Path(__file__).resolve().parent
DIST = (HERE.parent / 'dist' / 'index.html').read_text()
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/curio-shots'); OUT.mkdir(parents=True, exist_ok=True)

def check(cond, msg):
    if not cond: raise AssertionError(msg)
    print('ok ·', msg)

async def run_vp(b, name, w, h):
    pg = await b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    await pg.route('https://curio.test/', lambda r: r.fulfill(body=DIST, content_type='text/html'))
    await pg.goto('https://curio.test/')
    await pg.wait_for_timeout(500)
    shot = lambda n: pg.screenshot(path=str(OUT / f'{name}-{n}.png'))
    await shot('1-players')
    await pg.click('#pAdd'); await pg.fill('#npName', 'Manan'); await pg.click('[data-band="inventor"]'); await pg.click('#npGo')
    await pg.wait_for_selector('.hub'); await shot('2-hub')
    # Enter Cube Nets and fold the cross: first level done + first net found.
    await pg.click('[data-lab="nets"]'); await pg.wait_for_timeout(2500); await shot('3-nets')
    fr = pg.frame_locator('.world-frame')
    await pg.evaluate("document.querySelector('.world-frame').contentWindow.__curio.nets.fold()")
    await pg.wait_for_timeout(2600); await shot('4-nets-folded')
    coins = await pg.inner_text('#wCoins')
    check('35' in coins, f'coins after first fold = {coins.strip()} (20 level + 15 discovery)')
    await pg.keyboard.press('Escape')
    await pg.evaluate("(() => { const d = document.querySelector('.world-frame').contentDocument; const o = d.getElementById('overlay'); if (o && !o.hidden) d.getElementById('mdPri').click(); })()")
    await pg.click('#wBack'); await pg.wait_for_selector('.hub')
    prog = await pg.inner_text('[data-lab="nets"] .cnt')
    check(prog.startswith('1/6'), f'nets card progress {prog}')
    # Wrong answers cost hearts; at zero the out-of-hearts sheet appears and free play continues.
    for _ in range(5): await pg.evaluate("window.curioWorld.answer(false)")
    hearts = await pg.inner_text('#hHearts'); check(hearts.strip().startswith('❤️ 0'), f'hearts after 5 wrong = {hearts.split()[1]}')
    ok = await pg.evaluate("window.curioWorld.canAnswer()"); check(ok is False, 'cannot answer with 0 hearts')
    await pg.wait_for_selector('.sheet #ohBuy'); await shot('5-out-of-hearts')
    await pg.click('#ohBuy'); await pg.wait_for_timeout(200)
    hearts = await pg.inner_text('#hHearts'); check(hearts.strip().startswith('❤️ 1'), 'bought a heart for 30 coins')
    coins = await pg.inner_text('#hCoins'); check(coins.strip() == '5', f'coins after buying = {coins.strip()}')
    for _ in range(1): await pg.evaluate("window.curioWorld.answer(false)")
    await pg.evaluate("window.curioWorld.canAnswer()"); await pg.wait_for_selector('#ohAd')
    await pg.click('#ohAd'); await pg.wait_for_timeout(1600)
    hearts = await pg.inner_text('#hHearts'); check(hearts.strip().startswith('❤️ 1'), 'watched an ad for a heart (browser stand-in)')
    # Parent gate then Parent Corner.
    await pg.click('#hParent'); q = await pg.inner_text('.gate-q')
    W = {w: i for i, w in enumerate(['zero','one','two','three','four','five','six','seven','eight','nine'])}
    T = {w: i * 10 for i, w in enumerate(['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']) if w}
    a_txt, b_txt = q.split('×'); b_txt = b_txt.split('=')[0].strip(); a_txt = a_txt.strip()
    parts = a_txt.split('-'); a = T[parts[0]] + (W[parts[1]] if len(parts) > 1 else 0)
    await pg.fill('#gIn', str(a * W[b_txt])); await pg.click('#gOk')
    await pg.wait_for_selector('#pcAdH'); await shot('6-parent')
    await pg.click('#pcBuy'); await pg.wait_for_timeout(900)
    txt = await pg.inner_text('.sheet'); check('Ad-free is on' in txt, 'Ad-free purchase (browser stand-in)')
    await pg.click('[data-close]')
    # Second player in the Explorer band sees Colour Studio only.
    await pg.click('#hWho'); await pg.click('#pAdd'); await pg.fill('#npName', 'Tara'); await pg.click('[data-band="explorer"]'); await pg.click('#npGo')
    await pg.wait_for_selector('.hub'); await shot('7-hub-explorer')
    n_labs = await pg.locator('[data-lab]').count(); check(n_labs == 1, f'explorer sees {n_labs} playable lab')
    await pg.click('[data-lab="colour"]'); await pg.wait_for_timeout(3000); await shot('8-colour')
    await pg.click('#wBack'); await pg.wait_for_selector('.hub')
    # Players keep separate saves.
    await pg.click('#hWho'); await pg.click('.player >> text=Manan'); await pg.wait_for_selector('.hub')
    prog = await pg.inner_text('[data-lab="nets"] .cnt'); check(prog.startswith('1/6'), 'Manan keeps his own progress')
    await pg.click('[data-lab="circuit"]'); await pg.wait_for_timeout(2500); await shot('9-circuit')
    await pg.click('#wBack')
    real = [e for e in errs if 'net::' not in e]
    check(not real, 'no page errors' + ('' if not real else ': ' + ' | '.join(real[:5])))
    await pg.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        await run_vp(b, 'phone', 390, 844)
        await run_vp(b, 'desk', 1280, 800)
        await b.close()

asyncio.run(main())
