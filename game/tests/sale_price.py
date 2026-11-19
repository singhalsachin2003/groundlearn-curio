"""Sale price display: during a sale the buy button shows the regular price struck through before the sale price
(Android Ad-free and the iOS whole-island unlock); outside a sale only the price.
Run: python3 -I tests/sale_price.py [out-dir]   (after `npm run build`)."""
import sys, pathlib, asyncio, json
from playwright.async_api import async_playwright
HERE = pathlib.Path(__file__).resolve().parent
DIST = (HERE.parent / 'dist' / 'index.html').read_text()
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/curio-sale'); OUT.mkdir(parents=True, exist_ok=True)
fails = []
def check(c, m):
    print(('ok · ' if c else 'FAIL · ') + m)
    if not c: fails.append(m)

async def parent(pg):
    await pg.click('#hParent'); q = await pg.inner_text('.gate-q')
    W = {w: i for i, w in enumerate(['zero','one','two','three','four','five','six','seven','eight','nine'])}
    T = {w: i * 10 for i, w in enumerate(['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']) if w}
    a_txt, b_txt = q.split('×'); b_txt = b_txt.split('=')[0].strip(); parts = a_txt.strip().split('-'); a = T[parts[0]] + (W[parts[1]] if len(parts) > 1 else 0)
    await pg.fill('#gIn', str(a * W[b_txt])); await pg.click('#gOk'); await pg.wait_for_selector('#pcSound')

async def run(b, name, ios):
    pg = await b.new_page(viewport={'width': 430, 'height': 900})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    if ios: await pg.add_init_script("window.__CURIO_LOCKS = true; window.__CURIO_PLATFORM = 'ios'; window.__CURIO_ADS = false;")
    await pg.route('https://curio.test/', lambda r: r.fulfill(body=DIST, content_type='text/html'))
    await pg.goto('https://curio.test/'); await pg.wait_for_selector('#obNext')
    for _ in range(2): await pg.click('#obNext')
    await pg.click('#ruOk'); await pg.click('#pAdd'); await pg.fill('#npName', 'Manan'); await pg.click('[data-band="inventor"]'); await pg.click('#npGo')
    await pg.wait_for_selector('.hub3d')
    # Regular price only.
    await pg.evaluate("window.curioNative.receive({ t: 'adFree', value: false, price: '₹149' })")
    await parent(pg)
    btn = await pg.inner_html('#pcBuy'); check('<s' not in btn and '₹149' in btn, f'{name}: regular price, nothing struck through')
    await pg.evaluate("document.querySelector('#sheet [data-close]').click()")
    # Sale.
    await pg.evaluate("window.curioNative.receive({ t: 'adFree', value: false, price: '₹99', was: '₹149' })")
    await parent(pg)
    btn = await pg.inner_html('#pcBuy')
    check('<s class="was">₹149</s> ₹99' in btn, f'{name}: sale shows ₹149 struck through, then ₹99')
    if ios:
        note = await pg.inner_html('.pc section')
        check('<s class="was">₹149</s> ₹99' in note.split('pcTrial')[0], f'{name}: trial terms show the sale price the same way')
    await pg.locator('#pcBuy').scroll_into_view_if_needed(); await pg.screenshot(path=str(OUT / f'{name}-sale.png'))
    await pg.evaluate("document.querySelector('#sheet [data-close]').click()")
    # Sale over.
    await pg.evaluate("window.curioNative.receive({ t: 'adFree', value: false, price: '₹149' })")
    await parent(pg)
    btn = await pg.inner_html('#pcBuy'); check('<s' not in btn and '₹149' in btn, f'{name}: after the sale, the strike-through is gone')
    check(not errs, f'{name}: no page errors {errs[:2]}')
    await pg.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        await run(b, 'android', False); await run(b, 'ios', True)
        await b.close()
    print('FAILS:', fails)
    if fails: sys.exit(1)
asyncio.run(main())
