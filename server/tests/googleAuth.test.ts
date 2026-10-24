import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyGooglePayload } from '../services/auth/google.service.js';

const CLIENT_ID = 'test-client.apps.googleusercontent.com';

const basePayload = (): Record<string, unknown> => ({
  aud: CLIENT_ID,
  iss: 'accounts.google.com',
  email: 'User@Example.com',
  email_verified: true,
  exp: Math.floor(Date.now() / 1000) + 3600,
  name: 'User Example',
  picture: 'https://lh3.googleusercontent.com/avatar',
});

test('accepts a valid Google payload', () => {
  const profile = verifyGooglePayload(basePayload(), CLIENT_ID);
  assert.ok(profile);
  assert.equal(profile.email, 'user@example.com');
  assert.equal(profile.name, 'User Example');
  assert.equal(profile.picture, 'https://lh3.googleusercontent.com/avatar');
});

test('rejects a mismatched audience', () => {
  assert.equal(verifyGooglePayload({ ...basePayload(), aud: 'other.apps.googleusercontent.com' }, CLIENT_ID), null);
});

test('rejects a bad issuer', () => {
  assert.equal(verifyGooglePayload({ ...basePayload(), iss: 'evil.example.com' }, CLIENT_ID), null);
  assert.equal(verifyGooglePayload({ ...basePayload(), iss: 'https://accounts.google.com' }, CLIENT_ID)?.email, 'user@example.com');
});

test('rejects an expired token', () => {
  assert.equal(
    verifyGooglePayload({ ...basePayload(), exp: Math.floor(Date.now() / 1000) - 60 }, CLIENT_ID),
    null
  );
});

test('rejects an unverified email', () => {
  assert.equal(verifyGooglePayload({ ...basePayload(), email_verified: false }, CLIENT_ID), null);
  assert.equal(verifyGooglePayload({ ...basePayload(), email_verified: 'false' }, CLIENT_ID), null);
  assert.equal(verifyGooglePayload({ ...basePayload(), email_verified: undefined }, CLIENT_ID), null);
});

test('accepts email_verified as the string "true"', () => {
  assert.ok(verifyGooglePayload({ ...basePayload(), email_verified: 'true' }, CLIENT_ID));
});

test('builds a name from given/family when name is missing', () => {
  const payload = basePayload();
  delete payload.name;
  payload.given_name = 'Jane';
  payload.family_name = 'Doe';
  assert.equal(verifyGooglePayload(payload, CLIENT_ID)?.name, 'Jane Doe');
});

test('falls back to the email prefix when no name fields exist', () => {
  const payload = basePayload();
  delete payload.name;
  assert.equal(verifyGooglePayload(payload, CLIENT_ID)?.name, 'User');
});
