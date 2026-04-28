# Technical Specification – Bolos Ya
**Version:** 1.0 – MVP
**Date:** March 2026 

---

## 1. Overview
A mobile application (iOS/Android) that allows users in Venezuela to calculate supermarket cart totals in dual currency (Bolívares + USD), with offline‑first functionality, crowdsourced price data, and OCR powered by Google ML Kit. The project is a monorepo containing a Go backend (using **Gin** and **GORM**) and a React Native (Expo) frontend.

---

## 2. Technology Stack

| Layer            | Technology                                                                 |
|------------------|----------------------------------------------------------------------------|
| **Backend**      | Go 1.26+, PostgreSQL 15+, Redis 7+, **Gin** (HTTP), **GORM** (ORM)         |
| **Backend APIs** | REST (OpenAPI 3.0)                                                         |
| **Mobile**       | React Native (Expo) with TypeScript, expo-sqlite                           |
| **OCR**          | Google ML Kit (Text Recognition) – on‑device, no external API costs        |
| **Image Storage**| AWS S3 (for premium users)                                                 |
| **Auth**         | better-auth (Expo API Routes), header-based validation in Go backend       |
| **Cache**        | Redis (BCV exchange rate, TTL 24h)                                         |
| **Infrastructure**| Docker containers, deployed on AWS ECS                                    |

---

## 3. Monorepo Folder Structure

The entire project lives in a single Git repository, following a standard Go layout with separate folders for the backend service, shared packages, and the mobile app.

bolos-ya/
├── .gitignore
├── docker-compose.yml # local dev: PostgreSQL, Redis, MinIO
├── go.mod # module github.com/edorguez/bolos-ya
├── go.sum
├── Makefile # tasks: build, test, generate, run
├── .env.example # example environment variables
├── cmd/
│ └── server/ # main entry point for the backend service
│ └── main.go
├── configs/
│ └── server/ # configuration for the backend service
│ └── config.go # loads env vars, returns config struct
├── env/
│ ├── example.server.env # example environment file for server
│ └── example.mobile.env # optional: mobile environment vars
├── internal/
│ └── server/ # all backend code, organized by domain
│ ├── handlers/ # HTTP handlers (Gin)
│ │ ├── auth_handler.go
│ │ ├── cart_handler.go
│ │ ├── product_handler.go
│ │ ├── sync_handler.go
│ │ └── dto/ # request/response DTOs
│ │ ├── auth_dto.go
│ │ ├── cart_dto.go
│ │ └── ...
│ ├── models/ # GORM models (database tables)
│ │ ├── user.go
│ │ ├── cart.go
│ │ ├── cart_item.go
│ │ ├── product.go
│ │ ├── price.go
│ │ ├── supermarket.go
│ │ └── config.go
│ ├── repository/ # data access layer (GORM)
│ │ ├── user_repo.go
│ │ ├── cart_repo.go
│ │ ├── product_repo.go
│ │ ├── price_repo.go
│ │ └── ...
│ ├── services/ # business logic
│ │ ├── auth_service.go
│ │ ├── cart_service.go
│ │ ├── sync_service.go
│ │ ├── price_confidence.go # confidence algorithm
│ │ └── ...
│ ├── middleware/ # Gin middlewares
│ │ ├── auth.go
│ │ ├── cors.go
│ │ └── logger.go
│ └── routes.go # registers all routes (Gin)
├── pkg/ # shared libraries, reusable across services
│ ├── constants/
│ │ ├── constants.go
│ │ └── user_plans.go # premium/free limits
│ ├── core/
│ │ └── errors/
│ │ └── errors.go # custom error types
│ ├── database/
│ │ ├── postgresql/ # PostgreSQL connection (GORM)
│ │ │ └── postgresql.go
│ │ └── redis/ # Redis client
│ │ └── redis.go
│ ├── middleware/ # reusable middleware (e.g., logging)
│ │ └── logging.go
│ └── utils/
│ └── http.go # HTTP helpers
├── migrations/ # SQL migration files (golang-migrate)
│ ├── 001_create_users_table.up.sql
│ ├── 002_create_supermarkets_table.up.sql
│ └── ...
├── scripts/ # helper scripts (seed data, etc.)
│ ├── seed_data.go
│ └── generate_openapi.sh
├── docs/
│ └── openapi.yaml # OpenAPI 3.0 specification (source of truth)
├── gen/ # generated code from OpenAPI
│ ├── go/ # Go server stubs (oapi-codegen)
│ └── typescript/ # TypeScript client & models
├── mobile/ # Expo project (React Native)
│ ├── package.json
│ ├── app.json
│ ├── babel.config.js
│ ├── metro.config.js
│ ├── tsconfig.json
│ ├── src/
│ │ ├── api/ # generated TypeScript client from OpenAPI
│ │ ├── components/
│ │ ├── screens/
│ │ ├── navigation/
│ │ ├── store/ # Zustand / MobX state
│ │ ├── services/
│ │ │ ├── ocr.ts # Google ML Kit wrapper
│ │ │ ├── syncManager.ts # offline sync queue logic
│ │ │ └── database.ts # expo-sqlite setup & queries
│ │ ├── utils/
│ │ └── types/
│ ├── assets/
│ ├── android/ # native folder (bare workflow)
│ └── ios/ # native folder (bare workflow)
├── web/ # optional: admin dashboard or static files
│ └── ...
└── .github/
└── workflows/
├── backend-ci.yml
└── mobile-ci.yml

---

## 4. Backend Architecture (Layered with Gin & GORM)

The backend follows a **conventional layered architecture** that separates concerns into distinct layers, making the codebase easy to understand, test, and maintain.

### Layers

- **Handlers** (`internal/server/handlers/`):  
  Gin HTTP handlers that parse requests, validate input, call the appropriate service, and return JSON responses. Each handler is focused on a specific resource (e.g., auth, cart, sync).

- **Services** (`internal/server/services/`):  
  Contains the core business logic. Services orchestrate data operations, enforce rules (e.g., premium limits, budget validation), and call repositories. They are independent of HTTP concerns and can be unit‑tested with mocks.

- **Repository** (`internal/server/repository/`):  
  Data access layer using GORM. Each repository implements CRUD and custom queries for a specific model. Repositories are the only place that directly interact with the database.

- **Models** (`internal/server/models/`):  
  GORM structs that represent database tables. They include field definitions, tags (e.g., `gorm:"primaryKey"`), and sometimes simple validation methods.

- **Middleware** (`internal/server/middleware/`):  
  Reusable Gin middleware for authentication, CORS, logging, and request context injection.

- **Routes** (`internal/server/routes.go`):  
  Central place where all routes are registered with their handlers and middleware.

### Technology Stack

- **Gin** is used as the HTTP router and middleware provider.  
- **GORM** is used as the ORM for database interactions, with models defined in `internal/server/models`.

### Data Flow

1. **HTTP Request** → Gin router → Middleware (auth, logger) → Handler
2. **Handler** validates request, calls **Service** method
3. **Service** implements business logic, calls **Repository** methods
4. **Repository** executes GORM queries against the PostgreSQL database
5. The result flows back through the layers to produce an HTTP response.

### Dependency Injection

Dependencies (e.g., repositories, external clients) are passed explicitly via constructor injection. This makes the code testable and avoids global state. Example:

```go
// Service constructor
func NewCartService(cartRepo repository.CartRepository, productRepo repository.ProductRepository) *CartService {
    return &CartService{cartRepo: cartRepo, productRepo: productRepo}
}

// Handler uses the service
func SetupRoutes(router *gin.Engine, cartService *CartService) {
    router.POST("/carts", cartHandler.CreateCart(cartService))
}
```

### Project Structure (Extract)

internal/server/
├── handlers/
│   ├── auth_handler.go
│   ├── cart_handler.go
│   ├── sync_handler.go
│   └── dto/
├── models/
│   ├── user.go
│   ├── cart.go
│   ├── cart_item.go
│   └── ...
├── repository/
│   ├── user_repo.go
│   ├── cart_repo.go
│   └── ...
├── services/
│   ├── auth_service.go
│   ├── cart_service.go
│   ├── sync_service.go
│   └── price_confidence.go
├── middleware/
│   ├── auth.go
│   └── logger.go
└── routes.go

This layered approach keeps the codebase organised, makes it easy to add new features, and follows common patterns in the Go community.

---

## 5. Mobile Architecture

- **Offline‑First**: All data is stored locally in expo-sqlite. Writes are immediate to SQLite; they are queued for sync.
- **Sync Manager**: A background process (using `expo-background-fetch` or a timer) sends pending operations to `POST /api/sync`. Uses exponential backoff on failure.
- **State Management**: Zustand or MobX. Actions call the local repository (which updates SQLite and enqueues sync operations). The store subscribes to SQLite changes.
- **Google ML Kit**: Integrated via an Expo config plugin (bare workflow). The OCR service captures images from camera, processes with ML Kit, and returns parsed text.

---

## 6. Shared Types via OpenAPI

The OpenAPI 3.0 specification (`docs/openapi.yaml`) is the **single source of truth** for the API contract.

- **Generate Go server** using `oapi-codegen` (or similar) → output to `gen/go/`.  
- **Generate TypeScript client** using `openapi-typescript-codegen` → output to `gen/typescript/`.  
- The mobile app imports the generated client and models.  
- A `make generate` target runs both generators, ensuring consistency.

**Example OpenAPI snippet** (to be expanded):

```yaml
openapi: 3.0.0
info:
  title: Bolos Ya API
  version: 1.0.0
paths:
  /api/auth/register:
    post:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
  /api/sync:
    post:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                operations:
                  type: array
                  items:
                    $ref: '#/components/schemas/SyncOperation'
      responses:
        '200':
          description: Sync results
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
        is_premium:
          type: boolean
    SyncOperation:
      type: object
      properties:
        table:
          type: string
          enum: [cart_items, carts, prices]
        action:
          type: string
          enum: [INSERT, UPDATE, DELETE]
        payload:
          type: object
        timestamp:
          type: integer
          format: int64
```

---

## 7. Data Models (PostgreSQL with GORM)

The database contains two sets of tables: **better-auth tables** (identity/credentials managed by better-auth in Expo API Routes) and **application tables** (business logic, managed by the Go backend). Both share the same PostgreSQL database.

### 7.1 better-auth Tables (managed by better-auth)
```sql
CREATE TABLE "user" (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "session" (
    id TEXT PRIMARY KEY NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE "account" (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP,
    refresh_token_expires_at TIMESTAMP,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "verification" (
    id TEXT PRIMARY KEY NOT NULL,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 7.2 Application Tables (managed by Go backend)

GORM models are defined in `internal/server/models/`. The application `users` table stores app-specific data and links to better-auth via `better_auth_user_id`.

```sql
-- Users (application data, linked to better-auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    better_auth_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    auth_provider VARCHAR(20) CHECK (auth_provider IN ('email', 'google', 'guest')),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Supermarkets
CREATE TABLE supermarkets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    chain VARCHAR(100),
    is_custom BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id)
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(50),
    category VARCHAR(100),
    is_weight_based BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prices (crowdsourced)
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    supermarket_id UUID REFERENCES supermarkets(id),
    price_bolivares DECIMAL(15,2),
    price_usd DECIMAL(10,2),
    reported_by UUID REFERENCES users(id),
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    reports_count INTEGER DEFAULT 1,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tasa_bcv_del_dia DECIMAL(10,2)
);

-- Carts
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    supermarket_id UUID REFERENCES supermarkets(id),
    status VARCHAR(50) DEFAULT 'active',
    budget_bs DECIMAL(15,2) DEFAULT 0,
    budget_usd DECIMAL(10,2) DEFAULT 0,
    total_estimated_bs DECIMAL(15,2) DEFAULT 0,
    total_estimated_usd DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    price_snapshot_bs DECIMAL(15,2),
    price_snapshot_usd DECIMAL(10,2),
    quantity INTEGER DEFAULT 1,
    is_manual_entry BOOLEAN DEFAULT FALSE,
    product_image_url VARCHAR(500),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuration (e.g., BCV rate)
CREATE TABLE config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_prices_product_supermarket ON prices(product_id, supermarket_id);
CREATE INDEX idx_carts_user_active ON carts(user_id, status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
```

Sync Queue Table (local only) – not on server. The server does not persist a queue; it processes batches on demand.

---

## 8. Authentication & Authorization

### 8.1 Architecture

Authentication is handled by **better-auth**, hosted in the Expo app's API Routes (Node.js). The Go backend **does not** handle credential validation, password hashing, or token generation — better-auth manages all of that.

**Flow:**
1. **Mobile App** sends auth requests (sign-in, sign-up, Google OAuth) to Expo API Routes.
2. **Expo API Routes** use better-auth to validate credentials/sessions, creating/updating users in better-auth's tables (`user`, `session`, `account`).
3. **Expo API Routes** forward authenticated business requests to the Go backend with headers:
   - `Authorization`: Bearer `<INTERNAL_API_KEY>` — shared secret validating the request came from Expo API Routes.
   - `X-User-ID`: `<better_auth_user_id>` — the user's ID from better-auth's `user` table.
   - `X-User-Email`: `<user email>` — for auto-creating app user records on first visit.
   - `X-Auth-Provider`: `email` | `google` | `guest` — the authentication method used.
4. **Go Middleware** validates the internal API key, looks up or auto-creates the application user record (in the `users` table, linked via `better_auth_user_id`), and injects the user into the Gin context.
5. **Handlers** use `GetUserIDFromContext(c)` to access the authenticated user's UUID for business logic.

### 8.2 User Record Strategy

- **better-auth `user` table**: stores identity (name, email, email_verified, avatar). Managed by better-auth.
- **Application `users` table**: stores app-specific data (is_premium, premium_until, auth_provider, timestamps). Managed by the Go backend.
- **Link**: `users.better_auth_user_id` → `"user".id`. A one-to-one relationship.
- **Auto-creation**: When the Go backend receives a request with an unknown `better_auth_user_id`, it auto-creates the application user record with the provided email and auth_provider headers.

### 8.3 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/sync` | Internal API Key | Sync/upsert a user record from better-auth data |
| GET | `/api/v1/auth/me` | Internal API Key + X-User-ID | Returns current authenticated user info |
| POST | `/api/v1/carts` | Internal API Key + X-User-ID | Create a cart for the authenticated user |
| GET | `/api/v1/carts/:cartId/items` | Internal API Key + X-User-ID | Get cart items |
| POST | `/api/v1/carts/:cartId/checkout` | Internal API Key + X-User-ID | Checkout a cart |
| POST | `/api/v1/cart-items` | Internal API Key + X-User-ID | Add product to cart |
| PUT | `/api/v1/cart-items/:cartItemId` | Internal API Key + X-User-ID | Update quantity |
| DELETE | `/api/v1/cart-items/:cartItemId` | Internal API Key + X-User-ID | Remove item |
| POST | `/api/v1/sync` | Internal API Key + X-User-ID | Process offline sync batch |

### 8.4 Authorization

- **Free vs Premium**: Premium status is stored in the application `users` table. Middleware injects the full user object; handlers check `user.IsActivePremium()` for feature gates.
- **Guest users**: Supported via better-auth's anonymous/guest session support. Tracked in the `users` table with `auth_provider = 'guest'`.
- **Internal API Key**: A shared secret between Expo API Routes and the Go backend. Protects the Go backend from unauthorized direct access.

---

## 9. Offline Sync Strategy

### 9.1 Mobile Sync Queue
- All write operations (add item, update cart, delete) are stored in a local `sync_queue` table with fields: `id`, `table`, `action`, `payload` (JSON), `timestamp`, `retry_count`, `synced` (bool).  
- The `syncManager` periodically (every 5 minutes, or on network change) sends pending operations to `POST /api/sync`.  
- On success, marks as synced. On failure, increments retry count; after 5 attempts moves to a `dead_letter` table for manual inspection.

### 9.2 Conflict Resolution
- Each record in PostgreSQL has a `updated_at` timestamp.  
- The server processes sync operations in timestamp order.  
- If a conflict occurs (e.g., two clients updated same cart item), server returns HTTP 409 with the current server version. The mobile app can either:  
  - Show a conflict resolution screen (manual merge)  
  - Apply last‑write‑wins with server data (discard local)  
- Carritos activos are locked to one device via optimistic locking: the server checks `updated_at` on update; if mismatch, returns conflict.

### 9.3 Sync Endpoint (`POST /api/sync`)
- Accepts an array of operations.  
- For each operation, validates user permissions and applies in a transaction.  
- Returns an array of results: `{ success: true }` or `{ success: false, error: ..., server_version: ... }`.

---

## 10. Google ML Kit Integration (OCR)

### 10.1 Setup in Expo (Bare Workflow)
1. Create an Expo project with `expo init` and choose the bare workflow.  
2. Install necessary dependencies:  
   - `expo-camera` for camera access.  
   - For ML Kit: use a custom config plugin or manually add native dependencies.  
3. Add a config plugin (e.g., in `app.json` plugins array) that:  
   - **iOS**: Adds pod `GoogleMLKit/TextRecognition` to Podfile.  
   - **Android**: Adds dependencies in `android/app/build.gradle`:  
     ```gradle
     implementation 'com.google.mlkit:text-recognition:16.0.0'
     implementation 'com.google.android.gms:play-services-mlkit-text-recognition:19.0.0'
     ```

### 10.2 OCR Service Implementation

Create mobile/src/services/ocr.ts that:

- Captures an image using expo-camera.
- Passes the image to the native ML Kit module (via a custom native module or using a community library like expo-mlkit).
- Processes the result: extracts text and uses regex to identify product name and price.
- Returns a structured object: { rawText, suggestedName, suggestedPrice, currency }

Regex patterns (for Venezuelan tickets):
```typescript
const priceRegex = /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/;
const currencyRegex = /(Bs|USD|\$)/i;
// Additional logic to find the line with price, and adjacent line as product name.
```

---

## 11. Crowdsourcing Price Confidence

The confidence score for a price report is calculated on the backend using the algorithm described in the original spec:
go

```go
func CalculatePriceConfidence(productID, supermarketID uuid.UUID) float64 {
    reports := GetRecentReports(productID, supermarketID, days: 7)
    if len(reports) < 3 {
        return 0.5
    }
    clusters := ClusterByPrice(reports, tolerance: 0.10)
    majorityCluster := FindLargestCluster(clusters)
    confidence := float64(majorityCluster.Count) / float64(len(reports))
    if majorityCluster.Count > 10 && confidence > 0.8 {
        return 0.95
    }
    return confidence
}
```

This function is called whenever a new price is reported; it updates the confidence_score and reports_count fields in the prices table.

---

## 12. Deployment & Configuration

### 12.1 Backend (Docker + ECS)
- **Dockerfile**: Multi‑stage, final image based on `scratch` or `alpine`.
- **Environment variables** (provided via ECS task definition or `.env` file locally):
  - `DATABASE_URL` (PostgreSQL connection string)
  - `REDIS_URL`
  - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - `INTERNAL_API_KEY` — shared secret between Expo API Routes and Go backend
  - `BETTER_AUTH_URL` — URL of the Expo API Routes (for health checks)
- **docker-compose.yml** for local development: spins up PostgreSQL, Redis, and optionally MinIO for S3 mock.

### 12.2 Mobile (Expo)
- Builds are done via **EAS Build** for both development and production.  
- Environment variables (e.g., API base URL) are injected at build time using `app.config.js`.

### 12.3 CI/CD
- GitHub Actions workflows:  
  - `backend-ci.yml`: Runs Go tests, linter, and builds Docker image (pushed to ECR on main).  
  - `mobile-ci.yml`: Runs TypeScript type check, ESLint, and builds the app (EAS build triggered on push to main).

---

## 13. Development Workflow

1. **Clone repository** and set up local environment (run `docker-compose up`).  
2. **Update OpenAPI spec** in `docs/openapi.yaml` when API changes.  
3. Run `make generate` to regenerate Go server stubs and TypeScript client.  
4. **Backend development**: Implement domain, application, and infrastructure in Go using Gin and GORM.  
5. **Mobile development**: Work inside `mobile/`, using the generated API client.  
6. **Test sync flow** locally with both mobile simulator and backend.

---

## 14. Future Considerations

- **Push notifications**: Implement using Expo Push Notifications.  
- **Analytics**: Track user actions for KPIs (retention, OCR accuracy).  
- **Premium payments**: Integrate Stripe (via WebView) or USDT (via manual verification).

---

This document is the blueprint for building the app. All code, configuration, and infrastructure decisions should adhere to it. If any changes are needed, update this spec and communicate them across the team.