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
| **Auth**         | JWT + Google OAuth, email/password                                         |
| **Cache**        | Redis (BCV exchange rate, TTL 24h)                                         |
| **Infrastructure**| Docker containers, deployed on AWS ECS                                    |

## 3. Monorepo Folder Structure

The entire project lives in a single Git repository.

bolos-ya/
├── go.mod # module github.com/edorguez/bolos-ya
├── go.sum
├── Makefile # tasks: build, test, generate, run
├── docker-compose.yml # local dev (PostgreSQL, Redis, MinIO)
├── .env.example
├── cmd/
│ └── server/
│ └── main.go # entry point for backend server (Gin setup)
├── internal/ # private Go packages
│ ├── api/ # HTTP handlers & DTOs
│ │ ├── rest/ # Gin handlers
│ │ ├── middleware/ # auth, logging, CORS
│ │ └── dto/ # request/response DTOs
│ ├── domain/ # core entities & interfaces
│ │ ├── user.go
│ │ ├── cart.go
│ │ ├── product.go
│ │ ├── price.go
│ │ └── repository.go # interfaces for DB operations
│ ├── application/ # use cases / services
│ │ ├── auth_service.go
│ │ ├── cart_service.go
│ │ ├── sync_service.go
│ │ └── price_confidence.go # confidence algorithm
│ ├── infrastructure/ # adapters to external resources
│ │ ├── gorm/ # GORM models & repositories
│ │ │ ├── models/ # GORM model definitions
│ │ │ └── repositories/ # repository implementations using GORM
│ │ ├── redis/ # cache client
│ │ ├── s3/ # AWS S3 client
│ │ └── http/ # HTTP client for BCV API
│ └── pkg/ # shared utilities
│ ├── config/ # env config
│ ├── logger/ # structured logging
│ └── errors/ # custom error types
├── migrations/ # SQL migrations (golang-migrate)
│ ├── 001_create_users_table.up.sql
│ ├── ...
├── scripts/ # helper scripts (seed data, etc.)
├── mobile/ # Expo project
│ ├── package.json
│ ├── app.json
│ ├── babel.config.js
│ ├── metro.config.js
│ ├── tsconfig.json
│ ├── src/
│ │ ├── api/ # generated TypeScript client from OpenAPI
│ │ ├── components/ # reusable UI components
│ │ ├── screens/ # app screens
│ │ ├── navigation/ # React Navigation setup
│ │ ├── store/ # Zustand / MobX state
│ │ ├── services/
│ │ │ ├── ocr.ts # Google ML Kit wrapper
│ │ │ ├── syncManager.ts # offline sync queue logic
│ │ │ └── database.ts # expo-sqlite setup & queries
│ │ ├── utils/ # helpers, formatters
│ │ └── types/ # additional TS types (if needed)
│ ├── assets/ # images, fonts
│ ├── android/ # native folder (bare workflow)
│ └── ios/ # native folder (bare workflow)
├── docs/
│ └── openapi.yaml # OpenAPI 3.0 specification (source of truth)
├── gen/ # generated code
│ ├── go/ # Go server stubs (oapi-codegen)
│ └── typescript/ # TypeScript client & models
└── .github/
└── workflows/
├── backend-ci.yml
└── mobile-ci.yml

## 4. Backend Architecture (Clean / Hexagonal with Gin & GORM)

The Go backend follows **clean architecture** to separate business logic from frameworks.  
- **Gin** is used as the HTTP router and middleware provider.  
- **GORM** is used as the ORM for database interactions, with models defined in `internal/infrastructure/gorm/models`.  
- **Domain** (`internal/domain`): Plain Go structs and repository interfaces. Contains core business rules (e.g., confidence score algorithm).  
- **Application** (`internal/application`): Use cases that orchestrate domain objects and repository calls. Testable without DB/HTTP.  
- **Infrastructure** (`internal/infrastructure`): Concrete implementations of repositories using GORM, Redis client, etc.  
- **API** (`internal/api/rest`): Gin handlers that parse requests, call application services, and format responses.  
- **Dependency Injection**: All dependencies are passed explicitly (constructor injection). No global state.

**Key patterns:**
- **Repository**: Data access abstraction. GORM repositories implement the interfaces defined in `domain`.
- **CQRS (simplified)**: Commands (writes) are processed through the sync endpoint; queries (reads) go directly to DB.
- **OpenAPI Contract‑First**: All endpoints defined in `docs/openapi.yaml`. Generate server stubs and client models.

## 5. Mobile Architecture

- **Offline‑First**: All data is stored locally in expo-sqlite. Writes are immediate to SQLite; they are queued for sync.
- **Sync Manager**: A background process (using `expo-background-fetch` or a timer) sends pending operations to `POST /api/sync`. Uses exponential backoff on failure.
- **State Management**: Zustand or MobX. Actions call the local repository (which updates SQLite and enqueues sync operations). The store subscribes to SQLite changes.
- **Google ML Kit**: Integrated via an Expo config plugin (bare workflow). The OCR service captures images from camera, processes with ML Kit, and returns parsed text.

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

GORM models will be defined in `internal/infrastructure/gorm/models`. Below are the corresponding SQL schema (also used for migrations). The GORM models will map to these tables.

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50) CHECK (auth_provider IN ('email', 'google', 'guest')),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP
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

- **JWT tokens** with short expiry (15 minutes) and refresh tokens (stored in DB).  
- **Google OAuth**: Mobile obtains a Google ID token; backend exchanges it for a JWT after verifying the token and creating/linking user.  
- **Email/Password**: Passwords hashed with bcrypt.  
- **Middleware**: All protected endpoints validate JWT, extract user ID, and inject into context.  
- **Role‑based**: Free vs Premium checks happen in application layer (e.g., limit on active carts for free users).

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
  - `JWT_SECRET`  
  - `GOOGLE_OAUTH_CLIENT_ID` (if needed for token verification)  
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

- **Push notifications**: Implement using Firebase Cloud Messaging.  
- **Analytics**: Track user actions for KPIs (retention, OCR accuracy).  
- **Premium payments**: Integrate Stripe (via WebView) or USDT (via manual verification).

---

This document is the blueprint for building the app. All code, configuration, and infrastructure decisions should adhere to it. If any changes are needed, update this spec and communicate them across the team.