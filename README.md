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
