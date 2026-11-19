"""Check the per-platform ad profile: game page with a fake app bridge for ios/no-ads, ios/ads, android.
Run: python3 -I tests/ads_profile.py   (after `npm run build`)."""
import sys, pathlib, asyncio, json
from playwright.async_api import async_playwright
HERE = pathlib.Path(__file__).resolve().parent
DIST = (HERE.parent / 'dist' / 'index.html').read_text()
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/curio-ads'); OUT.mkdir(parents=True, exist_ok=True)
fails = []
def check(c, m):
    print(('ok · ' if c else 'FAIL · ') + m)
    if not c: fails.append(m)

async def run(b, name, platform, ads):
    pg = await b.new_page(viewport={'width': 430, 'height': 900})
    await pg.add_init_script(f"""window.__CURIO_PLATFORM = {json.dumps(platform)}; window.__CURIO_ADS = {json.dumps(ads)};
      window.__sent = []; window.ReactNativeWebView = {{ postMessage: s => window.__sent.push(JSON.parse(s)) }};""")
    await pg.route('https://curio.test/', lambda r: r.fulfill(body=DIST, content_type='text/html'))
    await pg.goto('https://curio.test/'); await pg.wait_for_selector('#obNext')
    for _ in range(2): await pg.click('#obNext')
    await pg.click('#ruOk'); await pg.click('#pAdd'); await pg.fill('#npName', 'Manan'); await pg.click('[data-band="inventor"]'); await pg.click('#npGo')
    await pg.wait_for_selector('.hub3d'); await pg.wait_for_timeout(600)
    sent = await pg.evaluate("window.__sent.filter(m => m.t === 'banner').map(m => m.mode)")
    want_banner = platform == 'android' and ads
    check(('space' in sent) == want_banner, f'{name}: banner space requested = {"space" in sent} (want {want_banner})')
    # Out of hearts: the ad button only when rewards are possible.
    await pg.click('#hAll', force=True); await pg.wait_for_selector('.sheet [data-lab="nets"]'); await pg.click('.sheet [data-lab="nets"]'); await pg.wait_for_timeout(2500)
    await pg.evaluate("(() => { const w = document.getElementById('sheet'); if (!w.hidden) w.querySelector('[data-close]')?.click(); })()")
    for _ in range(5): await pg.evaluate("window.curioWorld.answer(false)")
    await pg.evaluate("window.curioWorld.canAnswer()"); await pg.wait_for_selector('.sheet #ohBuy')
    n = await pg.locator('#ohAd').count(); check((n == 1) == ads, f'{name}: out-of-hearts ad button shown = {n == 1} (want {ads})')
    await pg.evaluate("document.querySelector('#sheet [data-close]').click()")
    # Show me / hints: a no-ads build opens them straight away.
    opened = await pg.evaluate("new Promise(r => { window.curioWorld.showMe ? window.curioWorld.showMe(() => r(true)) : r('n/a'); setTimeout(() => r(false), 800); })")
    print(f'   {name}: showMe opened immediately = {opened}')
    await pg.evaluate("document.getElementById('wBack').click()"); await pg.wait_for_selector('.hub3d')
    # Parent Corner.
    await pg.click('#hParent'); q = await pg.inner_text('.gate-q')
    W = {w: i for i, w in enumerate(['zero','one','two','three','four','five','six','seven','eight','nine'])}
    T = {w: i * 10 for i, w in enumerate(['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']) if w}
    a_txt, b_txt = q.split('×'); b_txt = b_txt.split('=')[0].strip(); parts = a_txt.strip().split('-'); a = T[parts[0]] + (W[parts[1]] if len(parts) > 1 else 0)
    await pg.fill('#gIn', str(a * W[b_txt])); await pg.click('#gOk'); await pg.wait_for_selector('#pcSound')
    await pg.screenshot(path=str(OUT / f'{name}-parent.png'))
    buy = await pg.locator('#pcBuy').count(); tog = await pg.locator('#pcAdH').count()
    check((buy == 1) == ads, f'{name}: Ad-free purchase shown = {buy == 1} (want {ads})')
    check((tog == 1) == ads, f'{name}: reward-ads toggle shown = {tog == 1} (want {ads})')
    await pg.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        await run(b, 'ios-noads', 'ios', False)
        await run(b, 'ios-ads', 'ios', True)
        await run(b, 'android', 'android', True)
        await b.close()
    print('FAILS:', fails)
    if fails: sys.exit(1)
asyncio.run(main())
