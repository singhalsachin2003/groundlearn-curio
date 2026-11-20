// Curio Island Play feature graphic, 1024x500, from the app icon and the iPad island screenshot.
// Usage: node curio-feature-graphic.mjs <out.png>   (run from a folder with playwright-core, e.g. the CornerStone repo)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('/Users/sachin/CornerStone/package.json');
const { chromium } = require('playwright-core');
const b64 = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
const icon = b64('/Users/sachin/groundlearn-curio/app/assets/icon.png');
const shot = b64('/Users/sachin/groundlearn-curio/app/store/screenshots-android/tablet-10/01-hub.png');
const html = `<html><body style="margin:0;width:1024px;height:500px;overflow:hidden;position:relative;background:linear-gradient(160deg,#7BDCFF 0%,#2BA9E8 100%);font-family:'Arial Rounded MT Bold','Avenir Next',Arial,sans-serif">
<div style="position:absolute;left:56px;top:70px;width:500px">
  <img src="${icon}" style="width:116px;height:116px;border-radius:26px;box-shadow:0 8px 22px rgba(0,0,0,.25)">
  <div style="font-size:80px;line-height:1;color:#fff;margin-top:26px;text-shadow:0 4px 0 #1E2B57;font-weight:900">Curio Island</div>
  <div style="font-size:29px;line-height:1.25;color:#1E2B57;margin-top:20px;font-weight:700">Science, maths and colour labs<br>for curious kids aged 4 to 10+</div>
</div>
<div style="position:absolute;left:580px;top:70px;width:400px;height:300px;border-radius:26px;border:8px solid #1E2B57;overflow:hidden;transform:rotate(3deg);box-shadow:0 16px 40px rgba(0,0,0,.3)">
  <img src="${shot}" style="width:100%;height:100%;object-fit:cover;object-position:50% 45%"></div>
</body></html>`;
const br = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await br.newPage({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
await pg.setContent(html);
await pg.waitForTimeout(400);
await pg.screenshot({ path: process.argv[2] });
await br.close();
console.log('wrote', process.argv[2]);
