# 🚀 Retailer Dropshipping Automation System

Fullstack automated dropshipping operations platform integrating **Shopify**, **CJ Dropshipping**, and **Zendrop** with automatic 6-hour hold buffer safety checks, address normalizer, dynamic pricing rules, and tracking sync.

---

## ⚡ Quick Start (Single Command)

From the root directory, install and run everything simultaneously with a single command:

```bash
# 1. Install all dependencies across root, server, and client
npm run install:all

# 2. Run both Backend Server, Background Worker, and Frontend Client concurrently:
npm run dev
```

### Available Root Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | **Runs Server (`:4000`), Client (`:3000`), & Background Worker concurrently** |
| `npm run dev:app` | Runs Server and Client only (without the worker process) |
| `npm run build` | Compiles and builds production bundles for both Backend and Frontend |
| `npm run test` | Runs the backend unit test suite (Pricing formulas, HMAC signatures) |
| `npm run prisma:generate` | Regenerates the Prisma ORM client |
| `npm run prisma:seed` | Seeds database with mock suppliers, products, and test orders |

---

## 🌐 Ports & Services

- **Frontend Client Dashboard**: `http://localhost:3000`
- **Backend API & Webhooks**: `http://localhost:4000`
- **Health Check**: `http://localhost:4000/health`
- **API Documentation**: `server/docs/api-spec.yaml`

---

## 🔐 Admin Authentication (OTP / 2FA)

Login is a two-step flow protected by rate limiting and TOTP (RFC 6238,
Google Authenticator / Authy / 1Password compatible).

| Endpoint | Purpose |
| :--- | :--- |
| `POST /api/auth/login` | Step 1 — password check. Returns `otp_required`, `2fa_setup_required` or `authenticated`. |
| `POST /api/auth/verify-otp` | Step 2 — exchange OTP session + code for an access token. |
| `POST /api/auth/2fa/setup` | Rotate the pending TOTP secret during enrolment. |
| `POST /api/auth/2fa/enable` | Confirm the code, enable 2FA, finish login. |
| `POST /api/auth/2fa/disable` | Turn 2FA off (requires current code, authenticated). |
| `GET /api/auth/me` | Current session profile. |
| `POST /api/auth/google` | Sign in with a Google ID token (verified server-side). |
| `PUT /api/auth/avatar` | Set the profile picture (base64 data URL, max ~500KB). |
| `DELETE /api/auth/avatar` | Remove the profile picture. |
| `POST /api/auth/change-password` | Change the signed-in account's password. |
| `GET/PUT /api/auth/settings` | Dynamic OTP + rate-limit settings (PUT = superadmin only). |

### Google sign-in (optional)

Sign-in with Google is available when both sides are configured. It verifies the
ID token on the server (audience, issuer, `email_verified`, expiry), then either
finds the existing account or provisions a new `operator` account with the Google
display name and avatar.

```bash
# server/.env  (audience the server checks the token against)
GOOGLE_CLIENT_ID=…apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=…

# client/.env  (client the browser button is rendered for)
VITE_GOOGLE_CLIENT_ID=…apps.googleusercontent.com
```

Both IDs normally match. When `GOOGLE_CLIENT_ID` is unset the server answers
`503 Google sign-in is not configured on this server`; the client hides the
button when `VITE_GOOGLE_CLIENT_ID` is unset.

### Profile pictures

Avatars are stored as base64 data URLs in `AdminUser.avatarUrl` (upload is
resized to 320px JPEG in the browser). They appear in the header menu and on
*Profile*; removing one falls back to the initials avatar.

**Dynamic settings** are stored in the `AppSetting` table and override `.env`
without a server restart — editable from *Settings → Security: OTP & Rate Limiting*
or via `PUT /api/auth/settings`.

**Rate limits** (defaults): 8 login attempts / 15 min per IP+email,
6 OTP attempts / 15 min per IP, 600 API requests / 15 min per IP.

### Managing passwords

```bash
cd server
npm run set-password -- admin@retailer-system.com 'YourNewPassword'
```

Dev helper to print a TOTP code from a secret (no phone needed):
`npx tsx scripts/devTotp.mjs <BASE32_SECRET>`

### Checking the auth flows end-to-end (headless Chrome)

Two dev scripts drive a real headless Chrome over the DevTools protocol — they
need `npm run dev` running and a `chrome` binary on the default path.

```bash
# Print a session for an existing account (uses its TOTP secret locally):
npx tsx server/scripts/devSession.mjs admin@retailer-system.com 'password' > /tmp/session.json

# Audit the light theme on the admin pages (reports near-black surfaces → exit 1):
node scripts/verify-admin-ui.mjs "$(node -e "console.log(require('/tmp/session.json').token)")"

# Register a fresh account, then sign in with it (no seeded session):
node scripts/check-auth-flows.mjs
```

