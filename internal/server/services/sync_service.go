package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
)

// SyncService defines offline synchronization operations
type SyncService interface {
	ProcessSync(ctx context.Context, userID uuid.UUID, operations []dto.SyncOperation) (*dto.SyncResponse, error)
	MigrateUserData(ctx context.Context, anonymousUserID uuid.UUID, newUserID uuid.UUID, operations []dto.SyncOperation) (*dto.SyncResponse, error)
}

type syncService struct {
	userRepo        repository.UserRepository
	cartRepo        repository.CartRepository
	cartProductRepo repository.CartProductRepository
	productRepo     repository.ProductRepository
	supermarketRepo repository.SupermarketRepository
}

func NewSyncService(
	userRepo repository.UserRepository,
	cartRepo repository.CartRepository,
	cartProductRepo repository.CartProductRepository,
	productRepo repository.ProductRepository,
	supermarketRepo repository.SupermarketRepository,
) SyncService {
	return &syncService{
		userRepo:        userRepo,
		cartRepo:        cartRepo,
		cartProductRepo: cartProductRepo,
		productRepo:     productRepo,
		supermarketRepo: supermarketRepo,
	}
}

// ProcessSync processes a batch of sync operations from a mobile client
func (s *syncService) ProcessSync(ctx context.Context, userID uuid.UUID, operations []dto.SyncOperation) (*dto.SyncResponse, error) {
	results := make([]dto.SyncResult, len(operations))

	for i, op := range operations {
		result := dto.SyncResult{
			LocalID: op.LocalID,
			Success: false,
		}

		var err error
		var serverVersion map[string]any

		switch op.Table {
		case dto.SyncTableUsers:
			result.Success, result.Error = s.processUserOperation(ctx, userID, op)
		case dto.SyncTableSupermarkets:
			serverVersion, err = s.processSupermarketOperation(ctx, userID, op)
		case dto.SyncTableProducts:
			serverVersion, err = s.processProductOperation(ctx, userID, op)
		case dto.SyncTableCarts:
			serverVersion, err = s.processCartOperation(ctx, userID, op)
		case dto.SyncTableCartProducts:
			serverVersion, err = s.processCartProductOperation(ctx, userID, op)
		default:
			result.Error = "tabla desconocida"
		}

		if err != nil {
			result.Error = err.Error()
		} else if op.Table != dto.SyncTableUsers {
			result.Success = true
			if serverVersion != nil {
				result.ServerVersion = serverVersion
			}
		}

		results[i] = result
	}

	return &dto.SyncResponse{Results: results}, nil
}

func (s *syncService) MigrateUserData(
	ctx context.Context,
	anonymousUserID uuid.UUID,
	newUserID uuid.UUID,
	operations []dto.SyncOperation,
) (*dto.SyncResponse, error) {
	newUserIDStr := newUserID.String()
	for i := range operations {
		if _, ok := operations[i].Payload["userId"]; ok {
			operations[i].Payload["userId"] = newUserIDStr
		}
		if _, ok := operations[i].Payload["user_id"]; ok {
			operations[i].Payload["user_id"] = newUserIDStr
		}
	}

	return s.ProcessSync(ctx, newUserID, operations)
}

func (s *syncService) processSupermarketOperation(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	switch op.Action {
	case dto.SyncOpInsert:
		return s.handleSupermarketInsert(ctx, userID, op)
	case dto.SyncOpUpdate:
		return s.handleSupermarketUpdate(ctx, userID, op)
	case dto.SyncOpDelete:
		return nil, s.handleSupermarketDelete(ctx, userID, op)
	default:
		return nil, fmt.Errorf("acción desconocida para supermercados: %s", op.Action)
	}
}

func (s *syncService) handleSupermarketInsert(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	name, ok := op.Payload["name"].(string)
	if !ok || name == "" {
		return nil, fmt.Errorf("nombre de supermercado requerido")
	}

	isCustom := false
	if v, ok := op.Payload["isCustom"].(bool); ok {
		isCustom = v
	}

	supermarket := models.NewSupermarket(name, isCustom, nil, userID)
	supermarket.ID = uuid.New()

	if err := s.supermarketRepo.Create(ctx, supermarket); err != nil {
		return nil, fmt.Errorf("error al crear supermercado: %w", err)
	}

	return map[string]any{
		"id": supermarket.ID.String(),
	}, nil
}

func (s *syncService) handleSupermarketUpdate(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	idStr, ok := op.Payload["id"].(string)
	if !ok {
		return nil, fmt.Errorf("ID de supermercado requerido")
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, fmt.Errorf("ID de supermercado inválido")
	}

	existing, err := s.supermarketRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("supermercado no encontrado: %w", err)
	}

	if existing.UserID != userID {
		return nil, fmt.Errorf("no autorizado para modificar este supermercado")
	}

	if name, ok := op.Payload["name"].(string); ok && name != "" {
		existing.Name = name
	}

	if err := s.supermarketRepo.Update(ctx, existing); err != nil {
		return nil, fmt.Errorf("error al actualizar supermercado: %w", err)
	}

	return nil, nil
}

func (s *syncService) handleSupermarketDelete(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) error {
	idStr, ok := op.Payload["id"].(string)
	if !ok {
		return fmt.Errorf("ID de supermercado requerido")
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		return fmt.Errorf("ID de supermercado inválido")
	}

	return s.supermarketRepo.Delete(ctx, id)
}

func (s *syncService) processProductOperation(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	switch op.Action {
	case dto.SyncOpInsert:
		return s.handleProductInsert(ctx, userID, op)
	case dto.SyncOpUpdate:
		return s.handleProductUpdate(ctx, userID, op)
	case dto.SyncOpDelete:
		return nil, s.handleProductDelete(ctx, userID, op)
	default:
		return nil, fmt.Errorf("acción desconocida para productos: %s", op.Action)
	}
}

func (s *syncService) handleProductInsert(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	name, ok := op.Payload["name"].(string)
	if !ok || name == "" {
		return nil, fmt.Errorf("nombre de producto requerido")
	}

	supermarketIDStr, ok := op.Payload["supermarketId"].(string)
	if !ok {
		return nil, fmt.Errorf("ID de supermercado requerido")
	}

	supermarketID, err := uuid.Parse(supermarketIDStr)
	if err != nil {
		return nil, fmt.Errorf("ID de supermercado inválido")
	}

	product := models.NewProduct(
		supermarketID,
		userID,
		name,
		nil,
		false,
		0,
		0,
		0,
		nil,
	)
	product.ID = uuid.New()

	if barcode, ok := op.Payload["barcode"].(string); ok {
		product.Barcode = &barcode
	}
	if isWeightBased, ok := op.Payload["isWeightBased"].(bool); ok {
		product.IsWeightBased = isWeightBased
	}
	if priceUsd, ok := op.Payload["priceUsd"].(float64); ok {
		product.PriceUsd = int64(priceUsd)
	}
	if priceBs, ok := op.Payload["priceBs"].(float64); ok {
		product.PriceBolivares = int64(priceBs)
	}
	if priceBcv, ok := op.Payload["priceBcv"].(float64); ok {
		product.PriceBcv = int64(priceBcv)
	}

	if err := s.productRepo.Create(ctx, product); err != nil {
		return nil, fmt.Errorf("error al crear producto: %w", err)
	}

	return map[string]any{
		"id": product.ID.String(),
	}, nil
}

func (s *syncService) handleProductUpdate(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	idStr, ok := op.Payload["id"].(string)
	if !ok {
		return nil, fmt.Errorf("ID de producto requerido")
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, fmt.Errorf("ID de producto inválido")
	}

	existing, err := s.productRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("producto no encontrado: %w", err)
	}

	if existing.UserID != userID {
		return nil, fmt.Errorf("no autorizado para modificar este producto")
	}

	if name, ok := op.Payload["name"].(string); ok && name != "" {
		existing.Name = name
	}
	if priceUsd, ok := op.Payload["priceUsd"].(float64); ok {
		existing.PriceUsd = int64(priceUsd)
	}
	if priceBs, ok := op.Payload["priceBs"].(float64); ok {
		existing.PriceBolivares = int64(priceBs)
	}

	if err := s.productRepo.Update(ctx, existing); err != nil {
		return nil, fmt.Errorf("error al actualizar producto: %w", err)
	}

	return nil, nil
}

func (s *syncService) handleProductDelete(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) error {
	idStr, ok := op.Payload["id"].(string)
	if !ok {
		return fmt.Errorf("ID de producto requerido")
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		return fmt.Errorf("ID de producto inválido")
	}

	return s.productRepo.Delete(ctx, id)
}

func (s *syncService) processCartOperation(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	switch op.Action {
	case dto.SyncOpInsert:
		return s.handleCartInsert(ctx, userID, op)
	case dto.SyncOpUpdate:
		return s.handleCartUpdate(ctx, userID, op)
	case dto.SyncOpDelete:
		return nil, s.handleCartDelete(ctx, userID, op)
	default:
		return nil, fmt.Errorf("acción desconocida para carritos: %s", op.Action)
	}
}

func (s *syncService) handleCartInsert(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	var supermarketID uuid.UUID

	if supermarketIDStr, ok := op.Payload["supermarketId"].(string); ok && supermarketIDStr != "" {
		var err error
		supermarketID, err = uuid.Parse(supermarketIDStr)
		if err != nil {
			return nil, fmt.Errorf("ID de supermercado inválido")
		}

		_, err = s.supermarketRepo.FindByID(ctx, supermarketID)
		if err != nil {
			supermarketID = uuid.New()
			customSupermarket := models.NewSupermarket(
				"Supermercado",
				true,
				nil,
				userID,
			)
			customSupermarket.ID = supermarketID
			if err := s.supermarketRepo.Create(ctx, customSupermarket); err != nil {
				return nil, fmt.Errorf("error al crear supermercado temporal: %w", err)
			}
		}
	} else if newSupermarket, ok := op.Payload["newSupermarket"].(map[string]any); ok {
		name, _ := newSupermarket["name"].(string)
		if name == "" {
			name = "Supermercado"
		}
		supermarketID = uuid.New()
		customSupermarket := models.NewSupermarket(name, true, nil, userID)
		customSupermarket.ID = supermarketID
		if err := s.supermarketRepo.Create(ctx, customSupermarket); err != nil {
			return nil, fmt.Errorf("error al crear supermercado: %w", err)
		}
	} else {
		return nil, fmt.Errorf("ID de supermercado requerido")
	}

	budgetBs := int64(0)
	budgetUsd := int64(0)

	if v, ok := op.Payload["budgetBs"].(float64); ok {
		budgetBs = int64(v)
	}
	if v, ok := op.Payload["budgetUsd"].(float64); ok {
		budgetUsd = int64(v)
	}

	cart := models.NewCart(userID, supermarketID, true, budgetBs, budgetUsd)
	cart.ID = uuid.New()

	if err := s.cartRepo.Create(ctx, cart); err != nil {
		return nil, fmt.Errorf("error al crear carrito: %w", err)
	}

	return map[string]any{
		"id":              cart.ID.String(),
		"supermarketId":   supermarketID.String(),
		"supermarketName": "",
	}, nil
}

func (s *syncService) handleCartUpdate(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	idStr, ok := op.Payload["id"].(string)
	if !ok {
		return nil, fmt.Errorf("ID de carrito requerido")
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, fmt.Errorf("ID de carrito inválido")
	}

	if checkout, ok := op.Payload["checkout"].(bool); ok && checkout {
		cart, err := s.cartRepo.FindByID(ctx, id)
		if err != nil {
			if errors.Is(err, apperrors.ErrNotFound) {
				return nil, fmt.Errorf("carrito no encontrado")
			}
			return nil, fmt.Errorf("error al buscar carrito: %w", err)
		}

		if cart.UserID != userID {
			return nil, fmt.Errorf("no autorizado")
		}

		cart.IsActive = false
		now := time.Now()
		cart.UpdatedAt = now

		if err := s.cartRepo.Update(ctx, cart); err != nil {
			return nil, fmt.Errorf("error al completar carrito: %w", err)
		}
		return nil, nil
	}

	existing, err := s.cartRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, fmt.Errorf("carrito no encontrado")
		}
		return nil, fmt.Errorf("error al buscar carrito: %w", err)
	}

	if existing.UserID != userID {
		return nil, fmt.Errorf("no autorizado para modificar este carrito")
	}

	if isActive, ok := op.Payload["isActive"].(bool); ok {
		existing.IsActive = isActive
	}
	if budgetBs, ok := op.Payload["budgetBs"].(float64); ok {
		existing.BudgetBs = int64(budgetBs)
	}
	if budgetUsd, ok := op.Payload["budgetUsd"].(float64); ok {
		existing.BudgetUsd = int64(budgetUsd)
	}

	if err := s.cartRepo.Update(ctx, existing); err != nil {
		return nil, fmt.Errorf("error al actualizar carrito: %w", err)
	}

	return nil, nil
}

func (s *syncService) handleCartDelete(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) error {
	idStr, ok := op.Payload["id"].(string)
	if !ok {
		return fmt.Errorf("ID de carrito requerido")
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		return fmt.Errorf("ID de carrito inválido")
	}

	return s.cartRepo.Delete(ctx, id)
}

func (s *syncService) processCartProductOperation(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	switch op.Action {
	case dto.SyncOpInsert:
		return s.handleCartProductInsert(ctx, userID, op)
	case dto.SyncOpUpdate:
		return s.handleCartProductUpdate(ctx, userID, op)
	case dto.SyncOpDelete:
		return nil, s.handleCartProductDelete(ctx, userID, op)
	default:
		return nil, fmt.Errorf("acción desconocida para productos de carrito: %s", op.Action)
	}
}

func (s *syncService) handleCartProductInsert(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	cartIDStr, ok := op.Payload["cartId"].(string)
	if !ok || cartIDStr == "" {
		return nil, fmt.Errorf("ID de carrito requerido")
	}

	cartID, err := uuid.Parse(cartIDStr)
	if err != nil {
		return nil, fmt.Errorf("ID de carrito inválido")
	}

	name, ok := op.Payload["name"].(string)
	if !ok || name == "" {
		return nil, fmt.Errorf("nombre de producto requerido")
	}

	supermarketIDStr, ok := op.Payload["supermarketId"].(string)
	if !ok {
		return nil, fmt.Errorf("ID de supermercado requerido")
	}

	supermarketID, err := uuid.Parse(supermarketIDStr)
	if err != nil {
		return nil, fmt.Errorf("ID de supermercado inválido")
	}

	priceUsd := int64(0)
	priceBs := int64(0)
	priceBcv := int64(0)

	if v, ok := op.Payload["priceUsd"].(float64); ok {
		priceUsd = int64(v)
	}
	if v, ok := op.Payload["priceBs"].(float64); ok {
		priceBs = int64(v)
	}
	if v, ok := op.Payload["priceBcv"].(float64); ok {
		priceBcv = int64(v)
	}

	product := models.NewProduct(
		supermarketID,
		userID,
		name,
		nil,
		false,
		priceUsd,
		priceBs,
		priceBcv,
		nil,
	)
	product.ID = uuid.New()

	if barcode, ok := op.Payload["barcode"].(string); ok && barcode != "" {
		product.Barcode = &barcode
	}
	if isWeightBased, ok := op.Payload["isWeightBased"].(bool); ok {
		product.IsWeightBased = isWeightBased
	}
	if imageUrl, ok := op.Payload["imageUrl"].(string); ok && imageUrl != "" {
		url := imageUrl
		product.ImageUrl = &url
	}

	if err := s.productRepo.Create(ctx, product); err != nil {
		return nil, fmt.Errorf("error al crear producto: %w", err)
	}

	isManualEntry := true
	if v, ok := op.Payload["isManualEntry"].(bool); ok {
		isManualEntry = v
	}

	cartProduct := models.NewCartProduct(cartID, product.ID, 1, isManualEntry)
	cartProduct.ID = uuid.New()

	if qty, ok := op.Payload["quantity"].(float64); ok {
		cartProduct.Quantity = int(qty)
	}

	if err := s.cartProductRepo.Create(ctx, cartProduct); err != nil {
		return nil, fmt.Errorf("error al agregar producto al carrito: %w", err)
	}

	return map[string]any{
		"id":        cartProduct.ID.String(),
		"productId": product.ID.String(),
	}, nil
}

func (s *syncService) handleCartProductUpdate(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (map[string]any, error) {
	idStr, ok := op.Payload["id"].(string)
	if !ok {
		return nil, fmt.Errorf("ID de producto de carrito requerido")
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, fmt.Errorf("ID de producto de carrito inválido")
	}

	existing, err := s.cartProductRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, fmt.Errorf("producto de carrito no encontrado")
		}
		return nil, fmt.Errorf("error al buscar producto: %w", err)
	}

	if quantity, ok := op.Payload["quantity"].(float64); ok {
		existing.Quantity = int(quantity)
	}

	if err := s.cartProductRepo.Update(ctx, existing); err != nil {
		return nil, fmt.Errorf("error al actualizar producto: %w", err)
	}

	return nil, nil
}

func (s *syncService) handleCartProductDelete(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) error {
	idStr, ok := op.Payload["id"].(string)
	if !ok {
		return fmt.Errorf("ID de producto de carrito requerido")
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		return fmt.Errorf("ID de producto de carrito inválido")
	}

	return s.cartProductRepo.Delete(ctx, id)
}

func (s *syncService) processUserOperation(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (bool, string) {
	opUserID, ok := op.Payload["id"].(string)
	if !ok {
		return false, "ID de usuario inválido"
	}

	parsedUserID, err := uuid.Parse(opUserID)
	if err != nil {
		return false, "formato de ID de usuario inválido"
	}

	if parsedUserID != userID {
		return false, "no autorizado"
	}

	switch op.Action {
	case dto.SyncOpInsert:
		return false, "registro de usuario no permitido via sync"
	case dto.SyncOpUpdate:
		user, err := s.userRepo.FindByID(ctx, parsedUserID)
		if err != nil {
			return false, err.Error()
		}

		if email, ok := op.Payload["email"].(string); ok {
			user.Email = email
		}
		if isPremium, ok := op.Payload["isPremium"].(bool); ok {
			user.IsPremium = isPremium
		}
		if isAnonymous, ok := op.Payload["isAnonymous"].(bool); ok {
			user.IsAnonymous = isAnonymous
		}

		if err := s.userRepo.Update(ctx, user); err != nil {
			return false, err.Error()
		}
		return true, ""
	case dto.SyncOpDelete:
		if err := s.userRepo.Delete(ctx, parsedUserID); err != nil {
			return false, err.Error()
		}
		return true, ""
	default:
		return false, "acción desconocida"
	}
}
