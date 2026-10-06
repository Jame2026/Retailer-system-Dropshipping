/**
 * Set (or create) an admin account password.
 *
 * Usage:
 *   npm run set-password -- <email> <password> [role] [name]
 *
 * Examples:
 *   npm run set-password -- admin@retailer-system.com 'MyNewPass123!'
 *   npm run set-password -- operator@retailer-system.com 'OpPass123!' operator
 *
 * Notes:
 *  - Only the password is touched; existing 2FA enrolment is preserved.
 *  - Roles: superadmin | operator | support
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const [email, password, role = 'operator', name = 'New Admin'] = process.argv.slice(2);
const VALID_ROLES = ['superadmin', 'operator', 'support'];

if (!email || !password) {
  console.error('Usage: npm run set-password -- <email> <password> [role] [name]');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(`Invalid email address: ${email}`);
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}
if (!VALID_ROLES.includes(role)) {
  console.error(`Invalid role "${role}". Use one of: ${VALID_ROLES.join(', ')}`);
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const normalized = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email: normalized } });

  if (existing) {
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: { passwordHash, isActive: true },
    });
    console.log(`✅ Password updated for ${normalized} (role: ${existing.role}, 2FA: ${existing.totpEnabled ? 'enabled' : 'disabled'})`);
  } else {
    await prisma.adminUser.create({
      data: { email: normalized, passwordHash, name, role, isActive: true },
    });
    console.log(`✅ Created admin account ${normalized} (role: ${role})`);
  }
  console.log('   Existing sessions keep working until their JWT expires.');
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
