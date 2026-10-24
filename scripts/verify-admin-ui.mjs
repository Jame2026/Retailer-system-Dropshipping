import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const token = process.argv[2];
const origin = process.argv[3] || 'http://localhost:3000';
const apiOrigin = process.env.API_ORIGIN || 'http://localhost:4000';
const routes = (process.argv[4] || '/admin,/profile,/settings,/login').split(',');

if (!token) {
  console.error('usage: node scripts/verify-admin-ui.mjs <token> [origin] [routes]');
  process.exit(2);
}

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

const port = 9400 + Math.floor(Math.random() * 200);
const profile = path.join(os.tmpdir(), `retailer-ui-audit-${port}`);
const chrome = spawn(
  CHROME,
  [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--disable-extensions',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    'about:blank',
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

async function seedProfile() {
  const res = await fetch(`${apiOrigin}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  const profile = body.data || body.user || body;
  if (!res.ok || !profile?.id) {
    throw new Error(`GET /api/auth/me failed (${res.status}): ${body.error || 'no profile'}`);
  }
  return profile;
}

async function load(route, profile) {
  await send('Page.navigate', { url: origin + '/' });
  await sleep(800);
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('retailer_auth_token', ${JSON.stringify(token)});\n      localStorage.setItem('retailer_auth_user', ${JSON.stringify(JSON.stringify(profile))});`,
  });
  await send('Page.navigate', { url: origin + route });
  for (let i = 0; i < 25; i++) {
    await sleep(600);
    const { result } = await send('Runtime.evaluate', {
      expression: 'document.body && document.body.innerText.length > 80',
      returnByValue: true,
    });
    if (result?.value) return;
  }
}

async function diagnostics(route) {
  const { result } = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      landed: location.pathname,
      expected: ${JSON.stringify(route)},
      hasToken: !!localStorage.getItem('retailer_auth_token'),
      hasUser: !!localStorage.getItem('retailer_auth_user'),
    })`,
    returnByValue: true,
  });
  return JSON.parse(result?.value || '{}');
}

async function openProfileMenu() {
  const { result } = await send('Runtime.evaluate', {
    expression: `(() => { const b = document.querySelector('[title="View profile"]'); if (b) { b.click(); return true; } return false; })()`,
    returnByValue: true,
  });
  await sleep(400);
  const opened = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.includes("Sign out")',
    returnByValue: true,
  });
  return Boolean(result?.value) && Boolean(opened.result?.value);
}

const AUDIT = `(() => {
  const dark = [];
  const lum = (c) => {
    const m = /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/.exec(c);
    if (!m) return 255;
    return 0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3];
  };
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 12 || r.height < 12) continue;
    if (s.visibility === 'hidden' || s.display === 'none') continue;
    // Translucent scrims (menus/dialogs) are intentional; opaque dark surfaces are not.
    const alpha = /rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)/.exec(s.backgroundColor);
    if (alpha && parseFloat(alpha[1]) <= 0.5) continue;
    if (lum(s.backgroundColor) < 45 && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      dark.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 70),
        bg: s.backgroundColor,
        box: Math.round(r.width) + 'x' + Math.round(r.height),
      });
    }
  }
  return JSON.stringify(dark.slice(0, 25), null, 1);
})()`;

let failed = false;
const sessionProfile = await seedProfile();
console.log(`session: ${sessionProfile.email} (${sessionProfile.role})`);
for (const route of routes) {
  await load(route, sessionProfile);
  const menuOpened = await openProfileMenu();
  const { result } = await send('Runtime.evaluate', { expression: AUDIT, returnByValue: true });
  const found = JSON.parse(result?.value || '[]');
  const shown = (await send('Runtime.evaluate', {
    expression: '(document.body.innerText || "").trim().slice(0, 160)',
    returnByValue: true,
  })).result?.value;

  console.log(`\n=== ${route} === (profile menu ${menuOpened ? 'opened' : 'n/a'})`);
  const diag = await diagnostics(route);
  if (diag.landed !== diag.expected) {
    failed = true;
    console.log(`REDIRECTED → ${diag.landed} (session: token=${diag.hasToken} user=${diag.hasUser})`);
  }
  console.log('page:', String(shown).replace(/\n+/g, ' | '));
  if (found.length === 0) {
    console.log('no dark surfaces ✅');
  } else {
    failed = true;
    console.log(`DARK SURFACES (${found.length}):`);
    for (const item of found) console.log(`  ${item.tag}.${item.cls} → ${item.bg} (${item.box})`);
  }
}

chrome.kill();
socket.close();
process.exit(failed ? 1 : 0);

async function waitForTarget(portNum) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${portNum}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {

    }
    await sleep(500);
  }
  throw new Error('chrome devtools never came up');
}
