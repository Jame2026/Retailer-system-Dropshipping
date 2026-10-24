import { env } from '../../config/env.js';

export interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
}

export function verifyGooglePayload(
  payload: Record<string, unknown>,
  clientId: string
): GoogleProfile | null {
  const aud = payload.aud;
  const iss = payload.iss;
  const email = payload.email;
  const exp = Number(payload.exp);
  const verified = payload.email_verified === true || payload.email_verified === 'true';

  if (typeof aud !== 'string' || (clientId && aud !== clientId)) return null;
  if (iss !== 'accounts.google.com' && iss !== 'https://accounts.google.com') return null;
  if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) return null;
  if (typeof email !== 'string' || !email.includes('@') || !verified) return null;

  const given = typeof payload.given_name === 'string' ? payload.given_name : '';
  const family = typeof payload.family_name === 'string' ? payload.family_name : '';
  const name =
    (typeof payload.name === 'string' && payload.name.trim()) ||
    [given, family].filter(Boolean).join(' ') ||
    email.split('@')[0];

  return {
    email: email.toLowerCase(),
    name,
    picture: typeof payload.picture === 'string' ? payload.picture : undefined,
  };
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const payload = (await res.json()) as Record<string, unknown>;
    return verifyGooglePayload(payload, env.GOOGLE_CLIENT_ID);
  } catch {
    return null;
  }
}