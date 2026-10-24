import { totp } from '../utils/totp.js';

const secret = process.argv[2];
if (!secret) {
  console.error('Usage: npx tsx scripts/devTotp.mjs <BASE32_SECRET>');
  process.exit(1);
}
console.log(totp(secret));
