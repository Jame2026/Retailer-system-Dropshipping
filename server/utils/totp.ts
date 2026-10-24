import crypto from 'node:crypto';

const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const B32_LOOKUP = new Map<string, number>(
  Array.from(B32_ALPHABET).map((ch, i) => [ch, i])
);

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += B32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(input: string): Buffer {
  const cleaned = input.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const ch of cleaned) {
    const idx = B32_LOOKUP.get(ch);
    if (idx === undefined) {
      throw new Error(`Invalid base32 character: ${ch}`);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function hotp(secret: Buffer, counter: number, digits: number): string {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));

  const mac = crypto.createHmac('sha1', secret).update(counterBuf).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const binary =
    ((mac[offset] & 0x7f) << 24) |
    (mac[offset + 1] << 16) |
    (mac[offset + 2] << 8) |
    mac[offset + 3];

  return (binary % 10 ** digits).toString().padStart(digits, '0');
}

export interface TotpOptions {

  step?: number;

  digits?: number;

  window?: number;

  timestamp?: number;
}

export function totp(secretBase32: string, options: TotpOptions = {}): string {
  const { step = 30, digits = 6, timestamp = Date.now() } = options;
  const counter = Math.floor(timestamp / 1000 / step);
  return hotp(base32Decode(secretBase32), counter, digits);
}

export function verifyTotp(secretBase32: string, token: string, options: TotpOptions = {}): boolean {
  const { step = 30, digits = 6, window = 1, timestamp = Date.now() } = options;

  if (!/^\d+$/.test(token) || token.length !== digits) {
    return false;
  }

  const secret = base32Decode(secretBase32);
  const counter = Math.floor(timestamp / 1000 / step);

  for (let i = -window; i <= window; i++) {
    const expected = hotp(secret, counter + i, digits);

    if (
      expected.length === token.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
    ) {
      return true;
    }
  }
  return false;
}

export function otpauthUri(params: {
  secret: string;
  account: string;
  issuer?: string;
  step?: number;
  digits?: number;
}): string {
  const { secret, account, issuer = 'Retailer Dropshipping Admin', step = 30, digits = 6 } = params;
  const label = encodeURIComponent(`${issuer}:${account}`);
  const query = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(digits),
    period: String(step),
  });
  return `otpauth://totp/${label}?${query.toString()}`;
}
