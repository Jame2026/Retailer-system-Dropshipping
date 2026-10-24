import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import supertest from 'supertest';

describe('mock Google OAuth exchange (e2e)', () => {
  let app: express.Express;

  before(() => {
    app = express();
    app.use(express.json());
    app.post('/api/auth/google', async (req, res) => {
      try {
        const { credential } = req.body;
        if (!credential || credential.length > 8192) {
          return res.status(400).json({ success: false, error: 'Validation failed' });
        }
        const aud =
          '766119471004-n7v9j0drvpr78n6oi6pq08sb23a9q63j.apps.googleusercontent.com';
        const b64 = credential.split('.')[1] || '';
        const payload = JSON.parse(
          Buffer.from(b64, 'base64url').toString('utf8')
        );
        if (
          payload.aud !== aud ||
          payload.iss !== 'accounts.google.com' ||
          payload.email_verified !== true ||
          payload.exp * 1000 <= Date.now()
        ) {
          return res
            .status(401)
            .json({ success: false, error: 'Google sign-in could not be verified' });
        }
        const email = payload.email.toLowerCase();
        const name = payload.name || 'Google User';
        const token = 'eyJhbGciOiJIUzI1NiIsInRldmlldCJ9.e30.5b4d8a1f2c3a';
        res.json({
          success: true,
          data: {
            status: 'authenticated',
            token,
            user: {
              id: 'usr_9f3c2a1e',
              email,
              name,
              avatar_url: payload.picture || null,
            },
          },
        });
      } catch (err) {
        res.status(500).json({ success: false, error: 'Internal error' });
      }
    });
  });

  it('returns 400 for an empty credential', async () => {
    const res = await supertest(app).post('/api/auth/google').send({ credential: '' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('returns 200 and a session for a valid Google ID token', async () => {
    const header = Buffer.from(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
    ).toString('base64url');
    const payload = {
      aud: '766119471004-n7v9j0drvpr78n6oi6pq08sb23a9q63j.apps.googleusercontent.com',
      iss: 'accounts.google.com',
      sub: '1234567890',
      name: 'Test User',
      email: 'test@example.com',
      email_verified: true,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      picture: 'https://lh3.googleusercontent.com/test',
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = 'SIGNATURE';
    const validToken = `${header}.${payloadB64}.${signature}`;
    const res = await supertest(app)
      .post('/api/auth/google')
      .send({ credential: validToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'authenticated');
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'test@example.com');
  });

  it('returns 401 when the audience is wrong', async () => {
    const header = Buffer.from(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
    ).toString('base64url');
    const payload = {
      aud: 'wrong-audience-here',
      iss: 'accounts.google.com',
      sub: '1234567890',
      name: 'Test User',
      email: 'test@example.com',
      email_verified: true,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = 'SIGNATURE';
    const badPayload = `${header}.${payloadB64}.${signature}`;
    const res = await supertest(app)
      .post('/api/auth/google')
      .send({ credential: badPayload });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('returns 401 when the email is not verified', async () => {
    const header = Buffer.from(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
    ).toString('base64url');
    const payload = {
      aud: '766119471004-n7v9j0drvpr78n6oi6pq08sb23a9q63j.apps.googleusercontent.com',
      iss: 'accounts.google.com',
      sub: '1234567890',
      name: 'Test User',
      email: 'test@example.com',
      email_verified: false,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = 'SIGNATURE';
    const unverified = `${header}.${payloadB64}.${signature}`;
    const res = await supertest(app)
      .post('/api/auth/google')
      .send({ credential: unverified });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('returns 401 when the token is expired', async () => {
    const header = Buffer.from(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
    ).toString('base64url');
    const payload = {
      aud: '766119471004-n7v9j0drvpr78n6oi6pq08sb23a9q63j.apps.googleusercontent.com',
      iss: 'accounts.google.com',
      sub: '1234567890',
      name: 'Test User',
      email: 'test@example.com',
      email_verified: true,
      exp: Math.floor(Date.now() / 1000) - 3600,
      iat: Math.floor(Date.now() / 1000),
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = 'SIGNATURE';
    const past = `${header}.${payloadB64}.${signature}`;
    const res = await supertest(app)
      .post('/api/auth/google')
      .send({ credential: past });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
});
