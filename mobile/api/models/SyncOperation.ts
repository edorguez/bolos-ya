/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SyncOperation = {
  table?: SyncOperation.table
  action?: SyncOperation.action
  payload?: Record<string, any>
  timestamp?: number
}
export namespace SyncOperation {
  export enum table {
    CART_ITEMS = 'cart_items',
    CARTS = 'carts',
    PRICES = 'prices',
  }
  export enum action {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
  }
}
