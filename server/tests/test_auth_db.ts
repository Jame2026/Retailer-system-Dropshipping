import './../config/env.js';
import { prisma } from '../database/client.js';
import bcrypt from 'bcryptjs';

async function test() {
  const user = await (prisma as any).adminUser.findUnique({
    where: { email: 'admin@retailer-system.com' },
  });

  console.log('✅ Supabase Query Result:');
  console.log('- Admin Name:', user.name);
  console.log('- Admin Email:', user.email);
  console.log('- Admin Role:', user.role);
  console.log('- Password check (admin123):', bcrypt.compareSync('admin123', user.passwordHash));
  console.log('- Password check (wrongpass):', bcrypt.compareSync('wrongpass', user.passwordHash));
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
