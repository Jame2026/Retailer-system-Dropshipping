import { prisma } from '../database/client.js';
import { totp } from '../utils/totp.js';

const email = process.argv[2] || 'admin@retailer-system.com';
const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'Admin@2026';
const base = process.env.API_BASE || 'http://localhost:4000';

const post = (path, body) =>
  fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const admin = await prisma.adminUser.findUnique({ where: { email } });
if (!admin || !admin.isActive) {
  console.error(`No active admin for ${email}`);
  process.exit(1);
}

const login = await post('/api/auth/login', { email, password });
const payload = login.data ?? login;

if (payload.status === 'authenticated') {
  console.log(JSON.stringify({ token: payload.token, user: payload.user }));
} else if (payload.status === 'otp_required') {
  const verified = await post('/api/auth/verify-otp', {
    otpSession: payload.otpSession,
    otp: totp(admin.totpSecret),
  });
  if (!verified.success) {
    console.error('OTP verification failed:', JSON.stringify(verified));
    process.exit(1);
  }
  console.log(JSON.stringify({ token: verified.data.token, user: verified.data.user }));
} else {
  console.error('Unexpected login status:', payload.status, payload.error ?? '');
  process.exit(1);
}

await prisma.$disconnect();
