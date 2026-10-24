export const PROFILE_CACHE_KEY = 'retailer_auth_profile';

export const PROFILE_UPDATED_EVENT = 'retailer-profile-updated';

// Monotonic counter bumped whenever a local profile write (avatar upload/remove)
// supersedes what the server last knew. Async /me responses that started before
// the latest bump are stale and must not overwrite the newer local state. This is
// what lets a freshly-uploaded avatar appear in the navbar immediately instead of
// being reverted to initials when an in-flight /me resolves after the upload.
let localWriteSeq = 0;

export function getLocalWriteSeq(): number {
  return localWriteSeq;
}

export function bumpLocalWrite(): void {
  localWriteSeq += 1;
}

export function isStaleProfileResponse(startedSeq: number): boolean {
  return startedSeq < localWriteSeq;
}

function emitProfileUpdated(): void {
  try {
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  } catch {

  }
}

export interface CachedProfile {
  id?: string;
  email: string;
  name: string;
  role: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string | null;

  avatarUrl?: string | null;
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

  }
  emitProfileUpdated();
}

export function clearCachedProfile(): void {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {

  }
  emitProfileUpdated();
}

export function resizeImageToDataUrl(file: File, size = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {

        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas is not supported in this browser'));
          return;
        }
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not process the image'));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read that image — try a different file'));
    };
    img.src = objectUrl;
  });
}
