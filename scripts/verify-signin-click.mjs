/**
 * Headless check that the storefront "Sign In / Register" control is clickable.
 *
 *   node scripts/verify-signin-click.mjs [origin]
 *
 * Loads the storefront, clicks the account control, and asserts the browser
 * actually lands on /login. Exits 1 when the click does nothing (the original
 * bug was a plain <div> with no handler).
 */
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const origin = process.argv[2] || 'http://localhost:3000';

const CHROME =
  process.env.CHROME_PATH ||
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => fs.existsSync(p));

if (!CHROME) {
  console.error('no chrome found — set CHROME_PATH');
  process.exit(2);
}

const port = 9700 + Math.floor(Math.random() * 150);
const profileDir = path.join(os.tmpdir(), `retailer-signin-click-${port}`);
const chrome = spawn(
  CHROME,
  [
    '--headless', '--disable-gpu', '--no-sandbox', '--no-first-run', '--disable-extensions',
    `--user-data-dir=${profileDir}`, `--remote-debugging-port=${port}`, 'about:blank',
  ],
  { stdio: 'ignore' }
);

const socket = new WebSocket(await waitForTarget(port));
let id = 0;
const pending = new Map();
socket.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const callId = ++id;
    pending.set(callId, { resolve, reject });
    socket.send(JSON.stringify({ id: callId, method, params }));
  });
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
await send('Page.enable');
await send('Runtime.enable');

const evaluate = async (expression) => {
  const { result } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return result?.value;
};

const failures = [];

// The desktop control is hidden below the `sm` breakpoint, so use a wide viewport.
await send('Emulation.setDeviceMetricsOverride', {
  width: 1280, height: 900, deviceScaleFactor: 1, mobile: false,
});

await send('Page.navigate', { url: `${origin}/` });
await sleep(2500);

const initialPath = await evaluate('location.pathname');
console.log(`landed: ${initialPath}`);

// Confirm the control is wired to /login before clicking (Link -> an <a href>).
const href = await evaluate(
  `(() => {
     const el = [...document.querySelectorAll('a')].find((a) => a.textContent.includes('Sign In / Register'));
     return el ? el.getAttribute('href') : null;
   })()`
);
console.log(`anchor href: ${href}`);
if (href !== '/login') {
  failures.push(`account control is not a link to /login (got ${JSON.stringify(href)})`);
}

await evaluate(
  `(() => {
     const el = [...document.querySelectorAll('a')].find((a) => a.textContent.includes('Sign In / Register'));
     if (el) el.click();
     return !!el;
   })()`
);

let landed = initialPath;
for (let i = 0; i < 20; i++) {
  await sleep(500);
  landed = await evaluate('location.pathname');
  if (landed !== initialPath) break;
}

console.log(`after click: ${landed}`);
if (landed !== '/login') {
  failures.push(`click did not navigate to /login (ended on ${landed})`);
}

const pageText = await evaluate('(document.body.innerText || "").replace(/\\n+/g, " | ").slice(0, 200)');
console.log(`page: ${pageText}`);

chrome.kill();
socket.close();

if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(' - ' + f);
  process.exit(1);
}
console.log('\nSign-in control is clickable ✅');
process.exit(0);

async function waitForTarget(portNum) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${portNum}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // chrome not up yet
    }
    await sleep(500);
  }
  throw new Error('chrome devtools never came up');
}
