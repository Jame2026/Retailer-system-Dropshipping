import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const origin = process.argv[2] || 'http://localhost:3000';
const stamp = Date.now().toString(36);
const account = {
  email: `flow.${stamp}@example.com`,
  password: `Pass${stamp}9`,
  name: `Flow Tester ${stamp}`,
};

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

const port = 9600 + Math.floor(Math.random() * 150);
const profileDir = path.join(os.tmpdir(), `retailer-auth-flows-${port}`);
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

const evaluate = async (expression, awaitPromise = false) => {
  const { result } = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
  return result?.value;
};

const state = async () =>
  JSON.parse(
    (await evaluate(`JSON.stringify({
      path: location.pathname,
      hasToken: !!localStorage.getItem('retailer_auth_token'),
      hasUser: !!localStorage.getItem('retailer_auth_user'),
      text: (document.body.innerText || '').replace(/\\n+/g, ' | ').slice(0, 260)
    })`)) || '{}'
  );

const failures = [];

await send('Page.navigate', { url: `${origin}/admin/login` });
await sleep(1500);
await evaluate(`localStorage.clear()`);
await send('Page.navigate', { url: `${origin}/admin/login` });
await sleep(1500);

await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Create Database User'));
  if (btn) btn.click();
  return !!btn;
})()`);
await sleep(500);

await evaluate(`(() => {
  const set = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const byPlaceholder = (p) => [...document.querySelectorAll('input')].find((i) => i.placeholder === p);
  set(byPlaceholder('e.g. Alex Morgan'), ${JSON.stringify(account.name)});
  set(byPlaceholder('admin@retailer-system.com'), ${JSON.stringify(account.email)});
  set(byPlaceholder('••••••••'), ${JSON.stringify(account.password)});
  return true;
})()`);
await sleep(400);

await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button[type="submit"]')].find((b) => b.textContent.includes('Create Admin'));
  if (btn) btn.click();
  return !!btn;
})()`);

for (let i = 0; i < 20; i++) {
  await sleep(500);
  const s = await state();
  if (s.path !== '/admin/login' && s.text.length > 80) break;
}
const afterRegister = await state();
console.log('=== REGISTER ===');
console.log(`account: ${account.email}`);
console.log(`landed: ${afterRegister.path}  token=${afterRegister.hasToken} user=${afterRegister.hasUser}`);
console.log(`page: ${afterRegister.text}`);
if (afterRegister.path === '/admin/login' || !afterRegister.hasToken) {
  failures.push('register did not sign the user in directly');
}

await evaluate(`localStorage.clear()`);
await send('Page.navigate', { url: `${origin}/admin/login` });
await sleep(1500);

await evaluate(`(() => {
  const set = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const inputs = [...document.querySelectorAll('input')];
  const emailEl = inputs.find((i) => i.type === 'email');
  const passEl = inputs.find((i) => i.type === 'password');
  set(emailEl, ${JSON.stringify(account.email)});
  set(passEl, ${JSON.stringify(account.password)});
  return true;
})()`);
await sleep(400);
await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button[type="submit"]')].find((b) => b.textContent.includes('Sign In'));
  if (btn) btn.click();
  return !!btn;
})()`);
await sleep(4000);

const firstTry = await state();
if (firstTry.path === '/admin/login' && /too many requests/i.test(firstTry.text)) {
  console.log('rate-limited — waiting 35s and retrying once…');
  await sleep(35_000);
  await evaluate(`(() => {
    const btn = [...document.querySelectorAll('button[type="submit"]')].find((b) => b.textContent.includes('Sign In'));
    if (btn) btn.click();
    return !!btn;
  })()`);
  await sleep(4000);
}

const afterLogin = await state();
const prefilledEmail = await evaluate(`(document.querySelector('input[type=email]') || {}).value || ''`);
console.log('\n=== LOGIN ===');
console.log(`landed: ${afterLogin.path}  token=${afterLogin.hasToken} user=${afterLogin.hasUser}`);
console.log(`email field: ${prefilledEmail}`);
console.log(`page: ${afterLogin.text}`);

const handedOff = afterLogin.path === '/login' && prefilledEmail === account.email;
if (afterLogin.path === '/admin/login' && !afterLogin.hasToken) {
  failures.push('login was a dead end (stayed on /admin/login with no session)');
} else if (!afterLogin.hasToken && !handedOff) {
  failures.push(`login ended on ${afterLogin.path} without a session or OTP hand-off`);
}

chrome.kill();
socket.close();

if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(' - ' + f);
  process.exit(1);
}
console.log('\nflows OK');
process.exit(0);

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
