package dto

type SyncOperationType string

const (
	SyncOpInsert SyncOperationType = "INSERT"
	SyncOpUpdate SyncOperationType = "UPDATE"
	SyncOpDelete SyncOperationType = "DELETE"
)

type SyncTable string

const (
	SyncTableUsers        SyncTable = "users"
	SyncTableSupermarkets SyncTable = "supermarkets"
	SyncTableProducts     SyncTable = "products"
	SyncTableCarts        SyncTable = "carts"
	SyncTableCartProducts SyncTable = "cart_products"
)

type SyncOperation struct {
	Table     SyncTable         `json:"table"`
	Action    SyncOperationType `json:"action"`
	Payload   map[string]any    `json:"payload"`
	Timestamp int64             `json:"timestamp"`
	LocalID   string            `json:"localId"`
}

type SyncRequest struct {
	Operations []SyncOperation `json:"operations"`
}

type SyncResult struct {
	Success       bool           `json:"success"`
	Error         string         `json:"error,omitempty"`
	ServerVersion map[string]any `json:"serverVersion,omitempty"`
	LocalID       string         `json:"localId"`
}

type SyncResponse struct {
	Results []SyncResult `json:"results"`
}
