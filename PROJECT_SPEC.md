# Technical Specification – Bolos Ya
**Version:** 2.0 – Production
**Date:** June 2026

---

## 1. Overview

A mobile application (iOS/Android) that allows users in Venezuela to create supermarket shopping carts with dual‑currency pricing (Bolívares + USD built-in, EUR via BCV official rate), manage budgets, and track spending. The project is a monorepo containing a Go backend (using **Gin** and **GORM**), a React Native (Expo) frontend, and a standalone auth server (Hono + better-auth).

---

## 2. Technology Stack

| Layer                  | Technology                                                                 |
|------------------------|----------------------------------------------------------------------------|
| **Backend**            | Go 1.25, PostgreSQL 15, Redis 7, **Gin** (HTTP), **GORM** (ORM)           |
| **Backend APIs**       | REST (OpenAPI 3.0 specification)                                           |
| **Mobile**             | React Native (Expo SDK 55) with TypeScript, Expo Router                    |
| **Styling**            | Unistyles (`react-native-unistyles`)                                       |
| **State Management**   | Zustand                                                                     |
| **Local Storage**      | AsyncStorage (caching), expo-secure-store (auth tokens)                    |
| **OCR**                | `@infinitered/react-native-mlkit-text-recognition` (on‑device)             |
| **Auth**               | better-auth with Hono (standalone auth server + shared PostgreSQL)         |
| **Email**              | Resend (transactional emails with HTML templates)                          |
| **BCV Rate Scraper**   | gocolly/colly v2 with retry logic (10 min interval, 6 h cap)              |
| **Image Storage**      | AWS S3 / MinIO (local dev) for premium users                               |
| **Infrastructure**     | Docker containers, deployed on AWS ECS                                     |

**Key Go dependencies:** `gin-gonic/gin`, `gorm.io/gorm`, `gorm.io/driver/postgres`, `go-redis/redis/v8`, `gocolly/colly/v2`, `resend/resend-go/v3`, `spf13/viper`, `joho/godotenv`, `google/uuid`, `go.uber.org/zap`.

---

## 3. Monorepo Folder Structure

```
bolos-ya/
├── cmd/server/              # Go backend entry point
│   └── main.go
├── configs/server/          # Viper‑based config (env vars + .env)
│   └── config.go
├── internal/
│   ├── cron/                # Background jobs
│   │   └── bcv_rate_cron.go # BCV exchange rate scraper
│   └── server/
│       ├── dto/             # Request/response DTOs
│       ├── email/           # Resend email service + templates
│       │   └── templates/   # approved.gohtml, rejected.gohtml, welcome.gohtml
│       ├── handlers/        # Gin HTTP handlers
│       ├── middleware/      # Auth middleware (better-auth session validation)
│       ├── models/          # GORM models
│       ├── repository/      # Data access layer (GORM queries)
│       ├── services/        # Business logic layer
│       └── routes.go        # Central route registration
├── pkg/
│   ├── constants/           # Shared constants (plan limits, header keys)
│   ├── core/errors/         # Custom error types
│   ├── database/
│   │   ├── migrations/      # SQL migration files (golang-migrate)
│   │   ├── postgresql/      # GORM connection setup
│   │   └── redis/           # Redis client setup
│   ├── logger/              # Zap logger wrapper
│   ├── middleware/          # Reusable logging middleware
│   ├── models/              # BaseModel (UUID, timestamps, soft-delete)
│   └── utils/               # HTTP helpers, UUID utilities
├── auth-server/             # Standalone auth service (Hono + better-auth)
│   └── src/
│       ├── auth-config.ts   # better-auth configuration
│       └── server.ts        # Hono server
├── mobile/                  # Expo / React Native app
│   ├── app/                 # Expo Router file‑based routing
│   │   ├── (tabs)/          # Home, history, profile
│   │   ├── (cart)/          # Cart detail, scan, checkout
│   │   ├── (onboarding)/    # Welcome, login, register
│   │   └── (premium)/       # Plans, pago-móvil
│   ├── components/          # UI components by domain
│   │   ├── home/
│   │   ├── cart/
│   │   ├── shared/
│   │   ├── profile/
│   │   └── history/
│   ├── store/               # Zustand stores (auth, cart, bcv)
│   ├── services/            # API client + per‑feature services
│   ├── styles/              # Unistyles theme + per‑screen styles
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Currency, validation, formatting, storage
├── docs/
│   └── openapi.yaml         # OpenAPI 3.0 specification
├── scripts/
│   └── init-db.sql          # DB init + seed data
├── Dockerfile               # Multi‑stage Alpine build
├── docker-compose.yml       # Local dev: server, postgres, redis, minio, auth-server
└── Makefile                 # build, test, run, migrate, docker‑up, etc.
```

---

## 4. Backend Architecture

### 4.1 Layers

The backend follows a **conventional layered architecture**:

- **Handlers** (`internal/server/handlers/`): Gin HTTP handlers that parse requests, validate input, call the appropriate service, and return JSON responses. Each handler focuses on a specific resource.
- **Services** (`internal/server/services/`): Core business logic. Orchestrates data operations, enforces rules (premium limits, budget validation, BCV rate syncing), and calls repositories. HTTP‑agnostic and unit‑testable.
- **Repository** (`internal/server/repository/`): Data access layer using GORM. Each repository implements CRUD and custom queries for one model. The only layer that directly interacts with the database.
- **Models** (`internal/server/models/`): GORM structs representing database tables, embedding `pkg/models.BaseModel` (UUID PK, timestamps, soft‑delete).
- **DTO** (`internal/server/dto/`): Request/response structs with JSON tags, separate from models.
- **Middleware** (`internal/server/middleware/`): Auth middleware that validates the Bearer token against better-auth's session validation endpoint, auto‑creates/updates the local user record.
- **Cron** (`internal/cron/`): Background goroutines (currently: BCV rate scraper).

### 4.2 Data Flow

1. **HTTP Request** → Gin Router → Middleware (auth) → Handler
2. **Handler** validates request + DTO, calls Service method
3. **Service** implements business logic, calls Repository methods
4. **Repository** executes GORM queries against PostgreSQL
5. **Response** flows back through the layers as JSON

### 4.3 Dependency Injection

Dependencies are passed via constructor injection:

```go
func NewCartService(cartRepo repository.CartRepository, productRepo repository.ProductRepository) *CartService {
    return &CartService{cartRepo: cartRepo, productRepo: productRepo}
}
```

### 4.4 BCV Rate Scraper

- Runs automatically on server start, then schedules daily at 04:00 AM local time.
- Uses **gocolly/colly** to scrape `bcv.org.ve` for USD and EUR official rates.
- Stores rates in the `bcv_rates` table as `BIGINT` (value × 100, stored in cents).
- **Retry logic**: If scraping fails, retries every 10 minutes, up to 36 attempts (6 hours). After exhausting retries, gives up until the next 04:00 cycle.
- The `GetLatestRate` endpoint always returns the most recent stored rate, acting as a fallback when today's scrape fails.

---

## 5. Mobile Architecture

- **Routing**: Expo Router file‑based routing with tab navigation and modal stacks.
- **State Management**: Zustand stores for auth, cart, and BCV rate data.
- **HTTP Client**: Custom `fetch`‑based API client (`mobile/services/api.ts`). Sends the better-auth session token as `Authorization: Bearer` + `X-User-ID` header.
- **Caching**: AsyncStorage for BCV rate (reduces API calls) and auth session data (via expo-secure-store).
- **OCR**: `@infinitered/react-native-mlkit-text-recognition` for on‑device price extraction from receipt photos.
- **Styling**: Unistyles with a shared theme (`mobile/styles/theme.ts`) and per‑screen style modules.

---

## 6. API & OpenAPI Specification

The OpenAPI 3.0 spec (`docs/openapi.yaml`) is the **source of truth** for the API contract.

- **Go server stubs** are generated via `oapi-codegen` → `internal/api/rest/generated.go` (deprecated — code is currently hand‑written).
- **TypeScript client generation** is deprecated; mobile uses hand‑written service functions in `mobile/services/`.

### 6.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/api/v1/auth/sync` | Bearer + X-User-ID | Sync/upsert user from better-auth |
| GET | `/api/v1/auth/me` | Bearer + X-User-ID | Get current user |
| POST | `/api/v1/carts` | Bearer + X-User-ID | Create cart |
| GET | `/api/v1/carts` | Bearer + X-User-ID | List user carts |
| GET | `/api/v1/carts/:cartId` | Bearer + X-User-ID | Get cart detail with products |
| POST | `/api/v1/carts/:cartId/checkout` | Bearer + X-User-ID | Checkout cart |
| POST | `/api/v1/cart-products` | Bearer + X-User-ID | Add product to cart |
| PUT | `/api/v1/cart-products/:cartProductId` | Bearer + X-User-ID | Update cart product |
| PUT | `/api/v1/cart-products/:cartProductId/quantity` | Bearer + X-User-ID | Update product quantity |
| DELETE | `/api/v1/cart-products/:cartProductId` | Bearer + X-User-ID | Remove product from cart |
| POST | `/api/v1/sync` | Bearer + X-User-ID | Process sync batch |
| POST | `/api/v1/payments` | Bearer + X-User-ID | Create payment request |
| GET | `/api/v1/payments` | Bearer + X-User-ID | List payments |
| GET | `/api/v1/payments/:paymentId` | Bearer + X-User-ID | Get payment detail |
| PUT | `/api/v1/payments/:paymentId` | Bearer + X-User-ID | Update payment |
| DELETE | `/api/v1/payments/:paymentId` | Bearer + X-User-ID | Delete payment |
| GET | `/api/v1/supermarkets` | Bearer + X-User-ID | List supermarkets |
| POST | `/api/v1/supermarkets` | Bearer + X-User-ID | Create custom supermarket |
| GET | `/api/v1/supermarkets/:supermarketId` | Bearer + X-User-ID | Get supermarket |
| GET | `/api/v1/bcv-rates` | Bearer + X-User-ID | Get latest BCV rate |
| GET | `/api/v1/rejection-reasons` | Bearer + X-User-ID | List rejection reasons |
| GET | `/api/v1/payment-statuses` | Bearer + X-User-ID | List payment statuses |

---

## 7. Data Models (PostgreSQL with GORM)

### 7.1 better-auth Tables (managed by better-auth)

```sql
CREATE TABLE "user" (
    id          TEXT PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    image       TEXT,
    "isAnonymous" BOOLEAN DEFAULT FALSE,
    role        TEXT DEFAULT 'user',
    "isPremium" BOOLEAN DEFAULT FALSE,
    "premiumUntil" TIMESTAMP,
    "authProvider" TEXT,
    "deletedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "session" (
    id          TEXT PRIMARY KEY NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    token       TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId"    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE "account" (
    id          TEXT PRIMARY KEY NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId"    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken"   TEXT,
    "accessTokenExpiresAt" TIMESTAMP,
    "refreshTokenExpiresAt" TIMESTAMP,
    scope       TEXT,
    password    TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "verification" (
    id          TEXT PRIMARY KEY NOT NULL,
    identifier  TEXT NOT NULL,
    value       TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP
);
```

### 7.2 Application Tables (managed by Go backend with GORM)

All application models embed `BaseModel` (UUID PK, `created_at`, `updated_at`, `deleted_at`). Monetary values are stored as `BIGINT` in cents to avoid floating‑point rounding errors.

```sql
-- Application users (links to better-auth user via better_auth_user_id)
CREATE TABLE users (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    better_auth_user_id VARCHAR(255) UNIQUE NOT NULL,
    email              VARCHAR(100) UNIQUE,
    auth_provider      VARCHAR(20) CHECK (auth_provider IN ('email','google','guest')),
    is_premium         BOOLEAN DEFAULT FALSE,
    is_anonymous       BOOLEAN DEFAULT FALSE,
    premium_until      TIMESTAMP,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at         TIMESTAMP
);

-- Supermarkets
CREATE TABLE supermarkets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    is_custom   BOOLEAN DEFAULT FALSE,
    image_url   VARCHAR(500),
    user_id     UUID REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP
);

-- Products
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_id  UUID NOT NULL REFERENCES supermarkets(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(100) NOT NULL,
    barcode         VARCHAR(50),
    is_weight_based BOOLEAN DEFAULT FALSE,
    price_usd       BIGINT NOT NULL,
    price_bolivares BIGINT NOT NULL,
    price_bcv       BIGINT NOT NULL,
    image_url       VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP
);

-- Carts
CREATE TABLE carts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_id      UUID NOT NULL REFERENCES supermarkets(id),
    user_id             UUID NOT NULL REFERENCES users(id),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    budget_bs           BIGINT NOT NULL DEFAULT 0,
    budget_usd          BIGINT NOT NULL DEFAULT 0,
    total_estimated_bs  BIGINT,
    total_estimated_usd BIGINT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP
);

-- Cart products (line items)
CREATE TABLE cart_products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id         UUID NOT NULL REFERENCES carts(id),
    product_id      UUID NOT NULL REFERENCES products(id),
    quantity        INTEGER NOT NULL DEFAULT 1,
    is_manual_entry BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP
);

-- Payment statuses (lookup table)
CREATE TABLE payment_statuses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(30) NOT NULL,
    description VARCHAR(100)
);

-- Rejection reasons (lookup table)
CREATE TABLE rejection_reasons (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reason  VARCHAR(100) NOT NULL
);

-- Payments (premium subscription requests via pago-móvil)
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    number_of_months    INTEGER NOT NULL,
    reference_number    VARCHAR(50) NOT NULL,
    bank_name           VARCHAR(80) NOT NULL,
    amount_bs           BIGINT NOT NULL,
    amount_usd          BIGINT NOT NULL,
    price_bcv           BIGINT NOT NULL,
    identification      VARCHAR(20) NOT NULL,
    is_discount         BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_id           UUID NOT NULL REFERENCES payment_statuses(id),
    rejection_reason_id UUID REFERENCES rejection_reasons(id),
    rejection_message   VARCHAR(200),
    approved_at         TIMESTAMP,
    rejected_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP
);

-- BCV exchange rates (auto‑scraped)
CREATE TABLE bcv_rates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usd_rate    BIGINT NOT NULL,
    eur_rate    BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP
);
```

### 7.3 Indexes

```sql
CREATE INDEX idx_supermarkets_user ON supermarkets(user_id);
CREATE INDEX idx_carts_user_active ON carts(user_id, is_active);
CREATE INDEX idx_cart_products_product ON cart_products(product_id);
CREATE INDEX idx_session_user_id ON "session"("userId");
CREATE INDEX idx_session_token ON "session"(token);
CREATE INDEX idx_account_user_id ON "account"("userId");
CREATE INDEX idx_account_provider ON "account"("providerId", "accountId");
CREATE INDEX idx_verification_identifier ON "verification"(identifier);
```

### 7.4 Seed Data

The migration seeds 11 Venezuelan supermarkets (Central Madeirense, Excelsior Gama, Unicasa, Farmatodo, etc.) and payment status/rejection reason lookup records.

---

## 8. Authentication & Authorization

### 8.1 Architecture

Authentication is handled by a **standalone auth server** (`auth-server/`) using **better-auth** with **Hono**. The Go backend does not handle credential validation — it delegates to the auth server.

**Flow:**
1. **Mobile App** sends auth requests (sign-in, sign-up, Google OAuth) to the auth server.
2. **Auth Server** uses better-auth to manage credentials, sessions, and OAuth in shared PostgreSQL tables (`user`, `session`, `account`).
3. **Auth Server** exposes a `POST /api/auth/validate-session` endpoint that validates a Bearer token via direct DB lookup (fast path) or better-auth's cookie-unsigning (fallback).
4. **Go Middleware** passes the Bearer token to the auth server's validate endpoint, retrieves `{ user: { id, email, isAnonymous } }`, and auto‑creates/updates the application user record in the `users` table.
5. **Handlers** use `GetUserIDFromContext(c)` to access the authenticated user's UUID.

### 8.2 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/validate-session` | Validate Bearer token, return user info |
| POST | `/api/auth/update-premium` | Update premium status in better-auth `user` table |
| ALL | `/api/auth/*` | Pass‑through to better-auth handler (register, login, OAuth, etc.) |
| GET | `/health` | Auth server health check |

### 8.3 Authorization

- **Free vs Premium**: Premium status is stored in both `users.is_premium` and better-auth's `"user"."isPremium"`. The Go backend syncs both on approval.
- **Guest users**: Supported via better-auth anonymous sessions (`"isAnonymous"`).
- **Admin users**: Identified by better-auth's `role` field (`'admin'`). Admin endpoints are not yet implemented.

---

## 9. Offline Strategy

The mobile app does **not** implement a full offline sync queue. Instead:

- **Reads** are always served from the API first, falling back to AsyncStorage‑cached data (e.g., BCV rate).
- **Writes** (create cart, add products) require network connectivity.
- **Auth sessions** are stored in expo-secure-store and persist across app restarts.
- **BCV rate** is cached in AsyncStorage and updated daily from the API, with fallback to yesterday's rate if the API or BCV website is unavailable.

Future iterations may add a local SQLite + sync queue for offline write support.

---

## 10. Google ML Kit Integration (OCR)

- **Library**: `@infinitered/react-native-mlkit-text-recognition`
- **Setup**: Installed as an Expo bare‑workflow dependency with native pods/Gradle config.
- **Flow**:
  1. User captures a receipt photo using `expo-camera`.
  2. Image is processed on‑device by ML Kit Text Recognition.
  3. Extracted text is parsed with regex to identify product names and prices:
     - `priceRegex`: `/(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/`
     - `currencyRegex`: `/(Bs|USD|\$)/i`
  4. The scan result populates the product form, allowing the user to confirm/edit before adding to cart.

---

## 11. Deployment & Configuration

### 11.1 Backend (Docker + ECS)

- **Dockerfile**: Multi‑stage build (Go 1.25 alpine → alpine:3.21). Runs as non‑root user (UID 1001). Includes health check on `/health`.
- **docker-compose.yml**: 5 services for local development:
  - `server` — Go backend
  - `postgres` — PostgreSQL 15 with auto‑init via `scripts/init-db.sql`
  - `redis` — Redis 7
  - `minio` — S3‑compatible storage for product images
  - `auth-server` — Hono + better-auth service
- **Environment variables**: Loaded via Viper from `.env` / `.env.docker` files.

### 11.2 Mobile (Expo)

- Builds via **EAS Build** for development and production.
- Environment variables injected at build time via `app.config.js`.

### 11.3 CI/CD

- GitHub Actions workflows:
  - `backend-ci.yml`: Go tests, linter, Docker build → ECR on `main`.
  - `mobile-ci.yml`: TypeScript type check, ESLint, EAS build on `main`.

---

## 12. Development Workflow

1. **Clone** the repo and run `make docker-up` (starts PostgreSQL, Redis, MinIO, auth server).
2. **Backend**: `make run` (or `air` for hot reload) — Go server on `:8080`.
3. **Auth server**: `cd auth-server && npm run dev` — Hono server on `:3001`.
4. **Mobile**: `cd mobile && npx expo run:ios` (or Android).
5. **Database migrations**: `make migrate-up` (applies `pkg/database/migrations/001_create_tables.up.sql`).
6. **API changes**: Update `docs/openapi.yaml`, then run `make generate` to regenerate Go stubs.

---

## 13. Future Considerations

- **Crowdsourced pricing**: A `prices` table with confidence‑scoring algorithm for community‑reported product prices (as originally specified).
- **Offline sync queue**: Local SQLite + background sync with exponential backoff for write‑operations without network.
- **Push notifications**: Via Expo Push Notifications for premium expiry reminders and cart sharing.
- **Admin dashboard**: Web‑based panel for managing payments, users, and reviewing reported prices.
- **Stripe / USDT payments**: Alternative payment methods for premium subscriptions.

---

## 14. License

MIT
