import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  base32Encode,
  base32Decode,
  generateTotpSecret,
  totp,
  verifyTotp,
  otpauthUri,
} from '../utils/totp.js';
import { buildDefaultSettings, validateSetting } from '../services/settings.service.js';

const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890'));

describe('TOTP (RFC 6238)', () => {
  test('matches the official RFC 6238 test vectors (SHA1, 8 digits)', () => {
    const vectors: Array<[number, string]> = [
      [59, '94287082'],
      [1111111109, '07081804'],
      [1111111111, '14050471'],
      [1234567890, '89005924'],
      [2000000000, '69279037'],
      [20000000000, '65353130'],
    ];
    for (const [time, expected] of vectors) {
      assert.strictEqual(
        totp(RFC_SECRET, { digits: 8, step: 30, timestamp: time * 1000 }),
        expected,
        `vector at T=${time}`
      );
    }
  });

  test('verifies the current code and rejects a wrong one', () => {
    const code = totp(RFC_SECRET, { digits: 6 });
    assert.strictEqual(verifyTotp(RFC_SECRET, code, { digits: 6 }), true);
    assert.strictEqual(verifyTotp(RFC_SECRET, '000000', { digits: 6 }), code === '000000');
  });

  test('tolerates one step of clock drift but not more', () => {
    const now = Date.now();
    const step = 30_000;
    const pastCode = totp(RFC_SECRET, { timestamp: now - step });
    const tooOldCode = totp(RFC_SECRET, { timestamp: now - 3 * step });

    assert.strictEqual(verifyTotp(RFC_SECRET, pastCode, { timestamp: now, window: 1 }), true);
    assert.strictEqual(verifyTotp(RFC_SECRET, tooOldCode, { timestamp: now, window: 1 }), false);
  });

  test('rejects malformed codes', () => {
    assert.strictEqual(verifyTotp(RFC_SECRET, '12345', { digits: 6 }), false);
    assert.strictEqual(verifyTotp(RFC_SECRET, 'abcdef', { digits: 6 }), false);
    assert.strictEqual(verifyTotp(RFC_SECRET, '', { digits: 6 }), false);
  });

  test('base32 round-trips and generated secrets are usable', () => {
    const bytes = Buffer.from('dropshipping-secret-payload');
    assert.deepStrictEqual(base32Decode(base32Encode(bytes)), bytes);

    const secret = generateTotpSecret();
    assert.strictEqual(secret.length, 32, '20 bytes => 32 base32 chars');
    assert.match(secret, /^[A-Z2-7]+$/);

    assert.strictEqual(verifyTotp(secret, totp(secret), { digits: 6 }), true);
  });

  test('builds a scannable otpauth:// URI', () => {
    const uri = otpauthUri({ secret: RFC_SECRET, account: 'admin@example.com', issuer: 'Test Issuer' });
    assert.ok(uri.startsWith('otpauth://totp/Test%20Issuer%3Aadmin%40example.com?'));
    assert.ok(uri.includes(`secret=${RFC_SECRET}`));
    assert.ok(uri.includes('period=30'));
    assert.ok(uri.includes('digits=6'));
  });
});

describe('Dynamic settings', () => {
  test('defaults come from the environment with sane values', () => {
    const defaults = buildDefaultSettings();
    assert.strictEqual(defaults['auth.otpLength'], 6);
    assert.strictEqual(defaults['auth.otpStepSeconds'], 30);
    assert.strictEqual(defaults['auth.otpWindowSteps'], 1);
    assert.strictEqual(defaults['auth.requireOtp'], true);
    assert.ok(defaults['rateLimit.login.max'] >= 1);
    assert.ok(defaults['rateLimit.api.max'] >= defaults['rateLimit.login.max']);
  });

  test('validates values and rejects unknown keys / bad ranges', () => {
    assert.strictEqual(validateSetting('rateLimit.login.max', 5), 5);
    assert.strictEqual(validateSetting('auth.requireOtp', false), false);

    assert.throws(() => validateSetting('rateLimit.login.max', 0), /between 1 and 100000/);
    assert.throws(() => validateSetting('auth.otpLength', 12), /between 4 and 8/);
    assert.throws(() => validateSetting('rateLimit.otp.windowSec', 1), /between 10 and 86400/);
    assert.throws(() => validateSetting('auth.otpLength', 'ten'), /must be a number/);
    assert.throws(() => validateSetting('unknown.key', 1), /Unknown setting/);
  });
});
