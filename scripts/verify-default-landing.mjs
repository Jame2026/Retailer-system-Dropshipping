/**
 * Headless check of what the app's DEFAULT landing page actually is.
 *
 *   node scripts/verify-default-landing.mjs [origin]
 *
 * Loads the origin root in real headless Chrome, waits for the SPA to render,
 * then reports the final URL and whether the storefront or a login page showed.
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
const profileDir = path.join(os.tmpdir(), `retailer-default-landing-${port}`);
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

await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `${origin}/` });
await sleep(3500);

const finalPath = await evaluate('location.pathname');
const finalUrl = await evaluate('location.href');
const title = await evaluate('document.title');
const bodyText = (await evaluate('(document.body.innerText || "")')) || '';
const hasStorefront = /Popular Products|See All Products|Fast USPS Delivery/i.test(bodyText);
const hasLogin = /Sign in|Sign In|Password|Create an admin account/i.test(bodyText);

console.log(`final url : ${finalUrl}`);
console.log(`final path: ${finalPath}`);
console.log(`title     : ${title}`);
console.log(`storefront marker: ${hasStorefront}`);
console.log(`login marker     : ${hasLogin}`);

chrome.kill();
socket.close();

let page;
if (hasStorefront && !hasLogin) page = 'storefront (public)';
else if (hasLogin && !hasStorefront) page = 'login';
else if (hasStorefront && hasLogin) page = 'storefront (contains a Sign in control — expected)';
else page = 'unknown / blank';

console.log(`\nDEFAULT LANDING = ${page}`);
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
