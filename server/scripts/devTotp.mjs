/**
 * DEV helper — prints the current TOTP code for a base32 secret.
 *
 * Useful for testing the login flow without a phone:
 *   npx tsx scripts/devTotp.mjs <BASE32_SECRET>
 *
 * Anyone who has the secret can already generate codes, so this does not
 * weaken security — never share the secret itself.
 */
import { totp } from '../utils/totp.js';

const secret = process.argv[2];
if (!secret) {
  console.error('Usage: npx tsx scripts/devTotp.mjs <BASE32_SECRET>');
  process.exit(1);
}
console.log(totp(secret));
