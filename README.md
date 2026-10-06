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
| `GET/PUT /api/auth/settings` | Dynamic OTP + rate-limit settings (PUT = superadmin only). |

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

