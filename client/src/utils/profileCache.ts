/**
 * Local cache of the signed-in admin's profile.
 *
 * The header menu and the profile page hydrate from this synchronously so
 * they render real data instantly, then refresh from the API in the
 * background (the API itself is also cached server-side for 15s).
 */
export const PROFILE_CACHE_KEY = 'retailer_auth_profile';

export interface CachedProfile {
  id?: string;
  email: string;
  name: string;
  role: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string | null;
}

export function readCachedProfile(): CachedProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedProfile;
    return parsed && typeof parsed.email === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCachedProfile(profile: CachedProfile): void {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch {
    // Storage full or blocked — in-memory state still works.
  }
}

export function clearCachedProfile(): void {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
    // ignore
  }
}
