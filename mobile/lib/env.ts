import { Platform } from 'react-native';

// Production fallbacks so release builds never crash on missing env vars.
// Override at build time via EXPO_PUBLIC_BETTER_AUTH_URL / EXPO_PUBLIC_GO_BACKEND_URL.
const DEFAULT_AUTH_URL = 'https://auth.somosmerki.app/api/auth';
const DEFAULT_BACKEND_URL = 'https://api.somosmerki.app/api/v1';

function getDevHost(): string {
  if (Platform.OS === 'ios') {
    return 'localhost';
  }
  return process.env.EXPO_PUBLIC_DEVICE_HOST || '10.0.2.2';
}

export function getAuthBaseUrl(): string {
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_BETTER_AUTH_URL || DEFAULT_AUTH_URL;
  }
  return `http://${getDevHost()}:3001/api/auth`;
}

export function getGoBackendUrl(): string {
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_GO_BACKEND_URL || DEFAULT_BACKEND_URL;
  }
  return `http://${getDevHost()}:8080/api/v1`;
}
