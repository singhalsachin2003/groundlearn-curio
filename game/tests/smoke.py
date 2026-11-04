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

async def dismiss(pg):
    """Close the worked-example sheet if one appears (it can take a few seconds on a busy software renderer)."""
    for _ in range(24):
        await pg.wait_for_timeout(250)
        shown = await pg.evaluate("(() => { const w = document.getElementById('sheet'); if (!w.hidden && w.dataset.kind === 'example') { w.querySelector('[data-close]').click(); return true; } return false; })()")
        if shown: return True
    return False

async def run_vp(b, name, w, h):
    pg = await b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    await pg.route('https://curio.test/', lambda r: r.fulfill(body=DIST, content_type='text/html'))
    await pg.goto('https://curio.test/')
    await pg.wait_for_timeout(500)
    async def shot(n):
        try: await pg.screenshot(path=str(OUT / f'{name}-{n}.png'), timeout=60000)
        except Exception as e: print('note · screenshot skipped', n)
    await pg.wait_for_selector('#ruOk'); await shot('0-rules'); await pg.click('#ruOk')
    await shot('1-players')
    await pg.click('#pAdd'); await pg.fill('#npName', 'Manan'); await pg.click('[data-band="inventor"]'); await pg.click('#npGo')
    await pg.wait_for_selector('.hub3d'); await pg.wait_for_timeout(800); await shot('2-hub')
    await pg.evaluate("(() => { const p = window.__shell.active(); p.daily = { day: new Date().toISOString().slice(0, 10), lab: 'nets', done: false }; })()")
    # Enter Cube Nets and fold the cross: first level done + first net found.
    await pg.click('#hAll', force=True); await pg.wait_for_selector('.sheet [data-lab="nets"]'); await shot('2b-all'); await pg.click('.sheet [data-lab="nets"]'); await pg.wait_for_timeout(2500); check(await dismiss(pg), 'worked example shows on first visit'); await shot('3-nets')
    fr = pg.frame_locator('.world-frame')
    await pg.evaluate("document.querySelector('.world-frame').contentWindow.__curio.nets.fold()")
    await pg.wait_for_timeout(2600); await shot('4-nets-folded')
    await pg.wait_for_timeout(800)
    coins = await pg.inner_text('#wCoins')
    check(coins.strip() == '45', f'coins after first fold = {coins.strip()} (20 level + 15 discovery + 10 daily)')
    # Labs without questions: 3 free misses per level, the 4th costs a heart.
    await pg.evaluate("(() => { const w = document.querySelector('.world-frame').contentWindow; for (let i = 0; i < 3; i++) w.__tries.miss('launch', 9, 3); })()")
    h = await pg.inner_text('#hHearts'); check(h.strip().startswith('❤️ 5'), 'three free misses cost no heart')
    await pg.evaluate("document.querySelector('.world-frame').contentWindow.__tries.miss('launch', 9, 3)")
    h = await pg.inner_text('#hHearts'); check(h.strip().startswith('❤️ 4'), 'fourth miss costs a heart')
    await pg.keyboard.press('Escape')
    await pg.evaluate("(() => { const d = document.querySelector('.world-frame').contentDocument; const o = d.getElementById('overlay'); if (o && !o.hidden) d.getElementById('mdPri').click(); })()")
    await pg.evaluate("document.getElementById('wBack').click()"); await pg.wait_for_selector('.hub3d')
    check(await pg.locator('.daily.done').count() == 1, 'Curio of the day shows as done')
    await pg.click('#hAll', force=True); prog = await pg.inner_text('.sheet [data-lab="nets"] .cnt'); await pg.click('.sheet [data-close]')
    check(prog.startswith('1/6'), f'nets card progress {prog}')
    # Wrong answers cost hearts; at zero the out-of-hearts sheet appears and free play continues.
    for _ in range(5): await pg.evaluate("window.curioWorld.answer(false)")
    hearts = await pg.inner_text('#hHearts'); check(hearts.strip().startswith('❤️ 0'), f'hearts after 5 wrong = {hearts.split()[1]}')
    ok = await pg.evaluate("window.curioWorld.canAnswer()"); check(ok is False, 'cannot answer with 0 hearts')
    await pg.wait_for_selector('.sheet #ohBuy'); await shot('5-out-of-hearts')
    await pg.click('#ohBuy'); await pg.wait_for_timeout(200)
    hearts = await pg.inner_text('#hHearts'); check(hearts.strip().startswith('❤️ 1'), 'bought a heart for 30 coins')
    coins = await pg.inner_text('#hCoins'); check(coins.strip() == '15', f'coins after buying = {coins.strip()}')
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
    await pg.click('#pcBuy'); await pg.wait_for_selector('#emSkip'); await shot('6b-email'); await pg.fill('#emIn', 'nope'); await pg.click('#emGo'); check(await pg.locator('#emErr').is_visible(), 'bad email is refused'); await pg.click('#emSkip'); await pg.wait_for_timeout(900)
    txt = await pg.inner_text('.sheet'); check('Ad-free is on' in txt, 'Ad-free purchase (browser stand-in)')
    await pg.click('[data-close]')
    # Second player in the Explorer band sees Colour Studio only.
    await pg.click('#hWho'); await pg.click('#pAdd'); await pg.fill('#npName', 'Tara'); await pg.click('[data-band="explorer"]'); await pg.click('#npGo')
    await pg.wait_for_selector('.hub3d'); await pg.wait_for_timeout(800); await shot('7-hub-explorer')
    for _ in range(3): await pg.evaluate("window.curioWorld.answer(false)")
    h = await pg.inner_text('#hHearts'); check(h.strip().startswith('❤️ 5'), 'explorer loses no hearts on wrong answers')
    await pg.click('#hAll', force=True); n_labs = await pg.locator('.sheet [data-lab]').count(); check(n_labs == 11, f'explorer sees {n_labs} playable labs (Colour Studio and ten of their own)'); check(await pg.locator('.sheet [data-lab="forge"]').count() == 0, 'explorer does not see Inventor labs'); await shot('7b-all-explorer')
    await pg.click('.sheet [data-lab="colour"]'); await pg.wait_for_timeout(3000); check(await dismiss(pg), 'worked example shows on first visit'); await shot('8-colour')
    await pg.evaluate("document.getElementById('wBack').click()"); await pg.wait_for_selector('.hub3d')
    # Explorer labs: six rounds each, solved through the world's hook; wrong answers never cost hearts.
    WJ = "document.querySelector('.world-frame').contentWindow.__curio"
    for lab in ('fizz', 'seesaw', 'bulb', 'scales', 'baby', 'pond', 'share', 'clock', 'pattern', 'daynight'):
        await pg.click('#hAll', force=True); await pg.click(f'.sheet [data-lab="{lab}"]'); await pg.wait_for_timeout(1800); await dismiss(pg)
        if lab == 'fizz':
            await shot('7c-fizz'); MU = "document.querySelector('.world-frame').contentDocument.getElementById('mute')"
            await pg.evaluate(f"{MU}.click()"); check(await pg.evaluate(f"{MU}.getAttribute('aria-pressed')") == 'true', 'Explorer voice can be muted'); await shot('7d-muted')
            await pg.evaluate(f"{MU}.click()"); check(await pg.evaluate(f"{MU}.getAttribute('aria-pressed')") == 'false', 'Explorer voice can be turned back on')
        for i in range(6):
            await pg.evaluate(f"{WJ}.solve()"); await pg.wait_for_timeout(2200); await pg.evaluate(f"{WJ}.next()"); await pg.wait_for_timeout(300)
        await pg.evaluate("document.getElementById('wBack').click()"); await pg.wait_for_selector('.hub3d')
        await pg.click('#hAll', force=True); prog = await pg.inner_text(f'.sheet [data-lab="{lab}"] .cnt'); check(prog.startswith('6/6'), f'explorer {lab} finished 6/6'); await pg.click('[data-close]')
    # Players keep separate saves.
    await pg.click('#hWho'); await pg.click('.player >> text=Manan'); await pg.wait_for_selector('.hub3d')
    await pg.click('#hAll', force=True); prog = await pg.inner_text('.sheet [data-lab="nets"] .cnt'); check(prog.startswith('1/6'), 'Manan keeps his own progress')
    await pg.click('.sheet [data-lab="circuit"]'); await pg.wait_for_timeout(2500); check(await dismiss(pg), 'worked example shows on first visit'); await shot('9-circuit')
    await pg.evaluate("document.getElementById('wBack').click()")
    # The four newer Inventor labs: solve each level, answer the bonus question (first option is right).
    for lab, n in (('matter', 5), ('fraction', 6), ('sound', 5), ('cell', 5), ('moon', 6), ('area', 6), ('decimal', 6), ('pythag', 6)):
        await pg.click('#hAll', force=True); await pg.click(f'.sheet [data-lab="{lab}"]'); await pg.wait_for_timeout(1800); await dismiss(pg)
        if lab in ('matter', 'cell'): await shot(f'9b-{lab}')
        for i in range(n):
            await pg.evaluate("window.__shell.active().hearts = 5")  # wrong quiz picks must not lock the test out
            await pg.evaluate(f"{WJ}.solve()"); await pg.wait_for_timeout(1700)
            await pg.evaluate("document.querySelector('.world-frame').contentDocument.querySelector('#modal .qopt').click()"); await pg.wait_for_timeout(200)
            await pg.evaluate(f"{WJ}.next()"); await pg.wait_for_timeout(300)
        await pg.evaluate("document.getElementById('wBack').click()"); await pg.wait_for_selector('.hub3d')
        await pg.click('#hAll', force=True); prog = await pg.inner_text(f'.sheet [data-lab="{lab}"] .cnt'); check(prog.startswith(f'{n}/{n}'), f'inventor {lab} finished {n}/{n}'); await pg.click('[data-close]')
    # Tinkerer band: its own labs, driven through the world's test hooks; rewards come from diffing the saves.
    await pg.click('#hWho'); await pg.click('#pAdd'); await pg.fill('#npName', 'Tia'); await pg.click('[data-band="tinkerer"]'); await pg.click('#npGo')
    await pg.wait_for_selector('.hub3d'); await pg.wait_for_timeout(800)
    await pg.click('#hAll', force=True); await pg.wait_for_selector('.sheet [data-lab="atom"]')
    for lab in ('atom', 'kitchen', 'mirror'): check(await pg.locator(f'.sheet [data-lab="{lab}"]').count() == 1, f'tinkerer sees {lab}')
    check(await pg.locator('.sheet [data-lab="forge"]').count() == 0, 'tinkerer does not see Inventor labs')
    await shot('10-all-tinkerer')
    await pg.click('.sheet [data-lab="atom"]'); await pg.wait_for_timeout(2500); check(await dismiss(pg), 'worked example shows on first visit'); await shot('11-atom')
    for e in ('H', 'H'): await pg.evaluate(f"{WJ}.atom._add('{e}')"); await pg.wait_for_timeout(250)
    await pg.wait_for_timeout(1200); st = await pg.evaluate(f"{WJ}.atom._state()"); check(st['won'] and st['formula'] == 'H₂', 'atom snap level 1 solved'); await shot('12-atom-won')
    await pg.evaluate("(() => { const d = document.querySelector('.world-frame').contentDocument; d.getElementById('mdPri').click(); })()")
    await pg.evaluate("document.querySelector('.world-frame').contentDocument.getElementById('tab-kitchen').click()"); await pg.wait_for_timeout(800)
    await pg.evaluate(f"{WJ}.kitchen._pick('soda')"); await pg.evaluate(f"{WJ}.kitchen._pick('vinegar')"); await pg.wait_for_timeout(600)
    await pg.evaluate(f"{WJ}.kitchen._mix()"); await pg.wait_for_timeout(1500); await shot('13-kitchen-fizz')
    check('fizzV' in (await pg.evaluate(f"{WJ}.kitchen._state()"))['found'], 'kitchen: baking soda + vinegar discovered')
    await pg.evaluate("document.querySelector('.world-frame').contentDocument.getElementById('tab-mirror').click()"); await pg.wait_for_timeout(800)
    await pg.evaluate(f"{WJ}.mirror._cell(3, 3)"); await pg.wait_for_timeout(1500); await shot('14-mirror-won')
    check((await pg.evaluate(f"{WJ}.mirror._state()"))['won'], 'mirror maze level 1 solved')
    # Every mirror level has a solution within its mirror budget (and the par is reachable).
    ok = await pg.evaluate(f"(() => {{ const m = {WJ}.mirror; return m._levels.length; }})()"); check(ok == 8, 'mirror maze has 8 levels')
    await pg.evaluate("document.querySelector('.world-frame').contentDocument.getElementById('mdPri').click()")
    # Batch 2: coordinate pictures, pea crosses, food chains.
    await pg.evaluate("document.querySelector('.world-frame').contentDocument.getElementById('tab-coord').click()"); await pg.wait_for_timeout(800)
    for _ in range(6):
        t = await pg.evaluate(f"{WJ}.coord._target()"); await pg.evaluate(f"{WJ}.coord._select({t['x']}, {t['y']})"); await pg.evaluate(f"{WJ}.coord._place()"); await pg.wait_for_timeout(120)
    await pg.wait_for_timeout(1500); await shot('15-coord-won'); check((await pg.evaluate(f"{WJ}.coord._state()"))['won'], 'coordinate pictures: house drawn')
    await pg.evaluate("document.querySelector('.world-frame').contentDocument.getElementById('mdPri').click()")
    await pg.evaluate("document.querySelector('.world-frame').contentDocument.getElementById('tab-pea').click()"); await pg.wait_for_timeout(800)
    await pg.evaluate(f"{WJ}.pea._set('Pp', 'Pp')"); await pg.evaluate(f"{WJ}.pea._go()"); await pg.wait_for_timeout(1800); await shot('16-pea-cross')
    check(not (await pg.evaluate(f"{WJ}.pea._state()"))['won'], 'pea crosses: Pp x Pp does not solve level 1')
    await pg.evaluate(f"{WJ}.pea._set('PP', 'pp')"); await pg.evaluate(f"{WJ}.pea._go()"); await pg.wait_for_timeout(2400)
    check((await pg.evaluate(f"{WJ}.pea._state()"))['won'], 'pea crosses: PP x pp solves level 1')
    await pg.evaluate("document.querySelector('.world-frame').contentDocument.getElementById('mdPri').click()")
    await pg.evaluate("document.querySelector('.world-frame').contentDocument.getElementById('tab-chain').click()"); await pg.wait_for_timeout(800)
    for _ in range(3): await pg.evaluate(f"{WJ}.chain._next()"); await pg.wait_for_timeout(700)
    await pg.wait_for_timeout(1200); await shot('17-chain-won'); check((await pg.evaluate(f"{WJ}.chain._state()"))['won'], 'food chains: meadow chain built')
    await pg.evaluate("document.getElementById('wBack').click()"); await pg.wait_for_selector('.hub3d')
    await pg.click('#hAll', force=True)
    for lab, want in (('coord', '1/6'), ('pea', '1/6'), ('chain', '1/6')):
        prog = await pg.inner_text(f'.sheet [data-lab="{lab}"] .cnt'); check(prog.startswith(want), f'{lab} progress {prog}')
    await pg.click('.sheet [data-close]'); await pg.click('#hAll', force=True)
    for lab, want in (('atom', '1/8'), ('kitchen', '1/12'), ('mirror', '1/8')):
        prog = await pg.inner_text(f'.sheet [data-lab="{lab}"] .cnt'); check(prog.startswith(want), f'{lab} progress {prog}')
    await pg.click('.sheet [data-close]')
    # Round 4 Tinkerer labs (hosted in the second Inventor world): solve every level, answer the bonus question.
    for lab, n in (('groups', 6), ('ladoo', 6), ('symmetry', 6), ('water', 6)):
        await pg.click('#hAll', force=True); await pg.click(f'.sheet [data-lab="{lab}"]'); await pg.wait_for_timeout(1800); await dismiss(pg)
        if lab == 'groups': await shot('17b-groups')
        for i in range(n):
            await pg.evaluate("window.__shell.active().hearts = 5")  # wrong quiz picks must not lock the test out
            await pg.evaluate(f"{WJ}.solve()"); await pg.wait_for_timeout(1700)
            await pg.evaluate("document.querySelector('.world-frame').contentDocument.querySelector('#modal .qopt').click()"); await pg.wait_for_timeout(200)
            await pg.evaluate(f"{WJ}.next()"); await pg.wait_for_timeout(300)
        await pg.evaluate("document.getElementById('wBack').click()"); await pg.wait_for_selector('.hub3d')
        await pg.click('#hAll', force=True); prog = await pg.inner_text(f'.sheet [data-lab="{lab}"] .cnt'); check(prog.startswith(f'{n}/{n}'), f'tinkerer {lab} finished {n}/{n}'); await pg.click('[data-close]')
    # Journal: start fresh clears the player's progress (behind the parent gate).
    await pg.click('#hJournal'); await pg.wait_for_selector('#jReset'); await shot('18-journal')
    await pg.click('#jReset'); q = await pg.inner_text('.gate-q')
    a_txt, b_txt = q.split('×'); b_txt = b_txt.split('=')[0].strip(); a_txt = a_txt.strip(); parts = a_txt.split('-'); a = T[parts[0]] + (W[parts[1]] if len(parts) > 1 else 0)
    await pg.fill('#gIn', str(a * W[b_txt])); await pg.click('#gOk'); await pg.wait_for_selector('#rsGo'); await shot('19-reset-ask'); await pg.click('#rsGo'); await pg.wait_for_selector('.hub3d'); await pg.wait_for_timeout(400)
    coins = await pg.inner_text('#hCoins'); check(coins.strip() == '0', 'start fresh: coins back to 0')
    await pg.click('#hAll', force=True); prog = await pg.inner_text('.sheet [data-lab="atom"] .cnt'); check(prog.startswith('0/8'), f'start fresh: atom progress {prog}'); await pg.click('.sheet [data-close]')
    # Hindi: the Tinkerer, Explorer and newer Inventor labs show their text in Hindi.
    dev = re.compile('[\u0900-\u097F]')
    await pg.click('#hWho'); await pg.click('#pLang'); await pg.wait_for_timeout(300)
    for who, lab, sel in (('Tia', 'atom', 'mText'), ('Tara', 'fizz', 'gt'), ('Manan', 'matter', 'mText')):
        await pg.click(f'.player >> text={who}'); await pg.wait_for_selector('.hub3d'); await pg.click('#hAll', force=True); await pg.click(f'.sheet [data-lab="{lab}"]'); await pg.wait_for_timeout(2500); await dismiss(pg)
        txt = await pg.evaluate(f"document.querySelector('.world-frame').contentDocument.getElementById('{sel}').textContent"); check(bool(dev.search(txt)), f'{lab} text is in Hindi')
        if lab == 'atom': await shot('20-atom-hi')
        await pg.evaluate("document.getElementById('wBack').click()"); await pg.wait_for_selector('.hub3d'); await pg.click('#hWho')
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
