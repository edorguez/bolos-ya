export type SyncOperationType = 'INSERT' | 'UPDATE' | 'DELETE';

export type SyncTable = 'users' | 'supermarkets' | 'products' | 'carts' | 'cart_products';

export interface SyncOperation {
  table: SyncTable;
  action: SyncOperationType;
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
