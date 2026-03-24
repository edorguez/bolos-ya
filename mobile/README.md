# Bolos Ya Mobile

React Native (Expo) mobile application for calculating supermarket cart totals in dual currency (Bolívares + USD) with OCR and offline sync.

## Features

- Expo Router (file-based navigation)
- TypeScript with strict type checking
- Theme system (light/dark mode)
- Zustand state management
- Expo SQLite for local storage
- Camera and image capture for OCR
- Generated TypeScript client from OpenAPI spec
- ESLint & Prettier configured

## Project Structure

```
src/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── auth/              # Authentication screens
│   ├── (tabs)/            # Tab navigation
│   └── +not-found.tsx     # 404 screen
├── api/                   # Generated API client from OpenAPI
├── components/            # Reusable UI components
├── store/                 # Zustand state stores
├── services/              # Business logic (database, OCR, sync)
├── styles/                # Theme and styling
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (optional)

### Installation

```bash
cd mobile
npm install
```

### Development

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

### Type Checking

```bash
npm run type-check
```

### Linting & Formatting

```bash
npm run lint
npm run lint:fix
npm run format
```

### Generate API Client

When the OpenAPI spec changes:

```bash
npm run generate-api
```

## Key Dependencies

- **Expo Router**: File-based routing
- **Zustand**: State management
- **Expo SQLite**: Local database
- **Expo Camera**: OCR image capture
- **Expo Image**: Image handling
- **React Native Safe Area Context**: Safe area handling

## Environment Setup

Create `.env` file based on `.env.example` (to be added) for API endpoints.

## Next Steps

1. Implement authentication flow
2. Set up SQLite database schema and migrations
3. Implement OCR service with Google ML Kit
4. Build sync manager for offline-first functionality
5. Connect to backend API using generated client
6. Implement cart calculation screens
7. Add price crowdsourcing features

## License

MIT