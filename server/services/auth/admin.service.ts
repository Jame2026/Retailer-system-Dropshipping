import { prisma } from '../../database/client.js';
import { settingsService } from '../settings.service.js';
import { verifyTotp } from '../../utils/totp.js';
import type { AdminProfile } from './token.service.js';

/** Strip a Prisma AdminUser row down to the public profile shape. */
export function toProfile(user: { id: string; email: string; name: string; role: string }): AdminProfile {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/** Find by email, tolerating case differences. */
export async function findAdminUser(email: string) {
  const trimmed = email.trim();
  const normalized = trimmed.toLowerCase();
  return (
    (await prisma.adminUser.findUnique({ where: { email: normalized } })) ??
    (normalized === trimmed ? null : await prisma.adminUser.findUnique({ where: { email: trimmed } }))
  );
}

/** Fetch by id and confirm the account can still be used. */
export async function getActiveUser(id: string) {
  const user = await prisma.adminUser.findUnique({ where: { id } });
  return user && user.isActive ? user : null;
}

/** Verify a TOTP code using the dynamic OTP settings. */
export async function verifyOtpCode(
  user: { totpSecret: string | null },
  code: string
): Promise<boolean> {
  if (!user.totpSecret) return false;
  const settings = await settingsService.getAll();
  return verifyTotp(user.totpSecret, code, {
    digits: settings['auth.otpLength'],
    step: settings['auth.otpStepSeconds'],
    window: settings['auth.otpWindowSteps'],
  });
}

/**
 * Short-lived cache for the profile payload so opening the profile menu is
 * instant even though the database is remote. Invalidated on every write.
 */
const PROFILE_CACHE_TTL_MS = 15_000;
const profileCache = new Map<string, { data: Record<string, unknown>; expires: number }>();

export interface CachedAdminProfile extends AdminProfile {
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: Date | null;
}

export function invalidateProfileCache(userId: string): void {
  profileCache.delete(userId);
}

export async function getCachedProfile(userId: string): Promise<CachedAdminProfile | null> {
  const hit = profileCache.get(userId);
  if (hit && hit.expires > Date.now()) {
    return hit.data as unknown as CachedAdminProfile;
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) return null;

  const data: CachedAdminProfile = {
    ...toProfile(user),
    isActive: user.isActive,
    twoFactorEnabled: user.totpEnabled,
    lastLoginAt: user.lastLoginAt,
  };
  profileCache.set(userId, { data: data as unknown as Record<string, unknown>, expires: Date.now() + PROFILE_CACHE_TTL_MS });
  return data;
}

/** Stamp the login time and drop the stale profile cache entry. */
export async function markLoggedIn(userId: string): Promise<void> {
  await prisma.adminUser.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  invalidateProfileCache(userId);
}
