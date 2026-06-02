<div align="center">
  <h1>🛒 Bolos Ya</h1>
  <p><strong>Supermarket cart calculator for Venezuela — dual currency, smart budgets, and receipt OCR</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Go-1.25-00ADD8?style=flat-square&logo=go" alt="Go 1.25">
    <img src="https://img.shields.io/badge/Expo-55-000020?style=flat-square&logo=expo" alt="Expo SDK 55">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License MIT">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs welcome">
  </p>
  <br>
</div>

---

## ✨ Features

- 🏪 **Multi‑supermarket support** — Choose from 11 major chains (Central Madeirense, Excelsior Gama, Unicasa, Farmatodo, and more) or add a custom market.
- 💵 **Dual‑currency budgets** — Set your budget in Bolívares or USD; the other converts automatically at the official BCV rate.
- 📸 **Receipt OCR** — Snap a photo of any price tag or receipt; ML Kit extracts the price and product name on‑device.
- 📊 **Budget tracking** — See real‑time estimates of your cart total versus your budget, with visual usage bars.
- 🏦 **Premium subscriptions** — Pay via Venezuelan bank transfer (pago móvil) to unlock premium features.
- 🔐 **Secure auth** — Email/password, Google OAuth, or anonymous guest access via better-auth.
- 📱 **iOS + Android** — Built with Expo, runs natively on both platforms.

---

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="docs/screenshots/home.png" alt="Home Screen" width="200"><br>
        <em>Home — create cart, BCV rate, recent carts</em>
      </td>
      <td align="center">
        <img src="docs/screenshots/cart.png" alt="Cart Detail" width="200"><br>
        <em>Cart detail with budget tracking</em>
      </td>
      <td align="center">
        <img src="docs/screenshots/scan.png" alt="OCR Scan" width="200"><br>
        <em>Receipt scanning with ML Kit</em>
      </td>
    </tr>
  </table>
</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile (Expo)                        │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ Expo Router│  │  Zustand │  │ API Client (fetch)   │ │
│  │ (tabs,     │  │ (auth,   │  │ + AsyncStorage cache │ │
│  │  modals)   │  │  cart,   │  │ + ML Kit OCR         │ │
│  │           │  │  bcv)    │  │                      │ │
│  └───────────┘  └──────────┘  └──────────┬───────────┘ │
└──────────────────────────────────────────┼─────────────┘
                                           │ Bearer token
                                           │ + X-User-ID
┌──────────────────────────────────────────┼─────────────┐
│              Auth Server (Hono)           │             │
│  ┌─────────────────────┐    ┌────────────▼──────────┐ │
│  │  better-auth         │    │  POST /api/auth/      │ │
│  │  (register, login,  │    │  validate-session     │ │
│  │   OAuth, sessions)  │    │  update-premium       │ │
│  └──────────┬──────────┘    └───────────────────────┘ │
└─────────────┼──────────────────────────────────────────┘
              │
┌─────────────┼──────────────────────────────────────────┐
│             │        Backend (Go / Gin)                 │
│  ┌──────────▼──────────────────────────────────────┐  │
│  │            Auth Middleware                       │  │
│  │  (validates token via auth-server,               │  │
│  │   auto-creates app user)                         │  │
│  └───────────────────────┬──────────────────────────┘  │
│                          │                              │
│     ┌────────────────────┼────────────────────┐        │
│     │                    │                    │        │
│  ┌──▼───┐          ┌────▼───┐          ┌────▼───┐   │
│  │Cart  │          │Payment │          │  BCV   │   │
│  │Handler│         │Handler │          │ Handler│   │
│  └──┬───┘          └────┬───┘          └────┬───┘   │
│     │                   │                   │        │
│  ┌──▼───┐          ┌────▼───┐          ┌────▼───┐   │
│  │Cart  │          │Payment │          │  BCV   │   │
│  │Service│         │Service │          │ Service │   │
│  └──┬───┘          └────┬───┘          └────┬───┘   │
│     │                   │                   │        │
│  ┌──▼──────────────┐    │              ┌────▼──────┐│
│  │  Repository     │◄───┘              │  Colly    ││
│  │  (GORM + PG)    │                   │  Scraper  ││
│  └─────────────────┘                   │  + Cron   ││
│                                        └───────────┘│
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Go 1.25, Gin, GORM, PostgreSQL 15, Redis 7 |
| **Scraping** | gocolly/colly v2 (BCV official rates) |
| **Email** | Resend (HTML templates) |
| **Auth** | better-auth + Hono (standalone server) |
| **Mobile** | Expo SDK 55, TypeScript, Expo Router |
| **State** | Zustand |
| **Styling** | Unistyles |
| **OCR** | ML Kit Text Recognition (on‑device) |
| **Infra** | Docker, docker-compose, AWS ECS |

---

## 🚀 Quick Start

### Prerequisites

- Go 1.25+
- Node.js 20+
- Docker & docker-compose
- Expo CLI (`npm install -g expo-cli`)

### 1. Start infrastructure

```bash
make docker-up
```

This starts PostgreSQL, Redis, MinIO (S3 mock), and the auth server.

### 2. Run database migrations

```bash
make migrate-up
```

### 3. Start the backend

```bash
make run
```

The Go server starts on `http://localhost:8080`.

### 4. Start the mobile app

```bash
cd mobile
npm install
npx expo run:ios    # or run:android
```

---

## 📁 Project Structure

```
bolos-ya/
├── cmd/server/              # Go backend entry point
├── internal/
│   ├── cron/                # BCV rate scraper (background job)
│   └── server/
│       ├── dto/             # Request/response DTOs
│       ├── email/           # Resend email service + templates
│       ├── handlers/        # Gin HTTP handlers
│       ├── middleware/      # Auth middleware
│       ├── models/          # GORM models
│       ├── repository/      # Data access layer
│       ├── services/        # Business logic
│       └── routes.go        # Route registration
├── pkg/
│   ├── database/            # PostgreSQL + Redis connections, migrations
│   ├── logger/              # Zap logger
│   ├── models/              # BaseModel (UUID, timestamps, soft-delete)
│   └── utils/               # HTTP helpers
├── auth-server/             # Hono + better-auth (standalone)
├── mobile/                  # Expo / React Native app
│   ├── app/                 # Expo Router (file-based routing)
│   ├── components/          # UI components by domain
│   ├── store/               # Zustand stores
│   ├── services/            # API client + feature services
│   ├── styles/              # Unistyles theme
│   └── utils/               # Currency, validation, formatting
├── docs/
│   └── openapi.yaml         # OpenAPI 3.0 spec
├── docker-compose.yml       # Local dev environment
└── Makefile                 # build, test, run, migrate
```

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `make build` | Build the Go backend binary |
| `make run` | Start the backend server |
| `make test` | Run all Go tests |
| `make docker-up` | Start all services (PostgreSQL, Redis, MinIO, auth-server) |
| `make docker-down` | Stop all services |
| `make migrate-up` | Apply database migrations |
| `make migrate-down` | Rollback database migrations |
| `make generate` | Regenerate Go stubs from OpenAPI spec |

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feat/amazing-feature`).
5. Open a Pull Request.

Please ensure your code passes `make lint` and `make test` before submitting.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for Venezuela</sub>
</div>
