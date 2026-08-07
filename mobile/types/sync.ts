export const SYNC_ACTIONS = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type SyncAction = (typeof SYNC_ACTIONS)[keyof typeof SYNC_ACTIONS];

export const SYNC_TABLES = {
  USERS: 'users',
  SUPERMARKETS: 'supermarkets',
  PRODUCTS: 'products',
  CARTS: 'carts',
  CART_PRODUCTS: 'cart_products',
} as const;

export type SyncTable = (typeof SYNC_TABLES)[keyof typeof SYNC_TABLES];

export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

export interface SyncOperation {
  table: SyncTable;
  action: SyncAction;
  payload: Record<string, unknown>;
  timestamp: number;
  localId: string;
}

export interface SyncRequest {
  operations: SyncOperation[];
}

export interface SyncResult {
  success: boolean;
  error?: string;
  serverVersion?: Record<string, unknown>;
  localId: string;
}

export interface SyncResponse {
  results: SyncResult[];
}
