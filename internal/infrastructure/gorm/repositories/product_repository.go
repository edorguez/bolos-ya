package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	"github.com/edorguez/bolos-ya/internal/infrastructure/gorm/models"
	"github.com/edorguez/bolos-ya/internal/pkg/errors"
)

// ProductRepository implements domain.ProductRepository using GORM
type ProductRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new ProductRepository
func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// Create inserts a new product into the database
func (r *ProductRepository) Create(ctx context.Context, product *domain.Product) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.ProductModel
	model.FromDomain(product)

	return r.db.WithContext(ctx).Create(&model).Error
}

// FindByID retrieves a product by ID
func (r *ProductRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.ProductModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return model.ToDomain(), nil
}

// FindByName retrieves products by name (partial match)
func (r *ProductRepository) FindByName(ctx context.Context, name string) ([]*domain.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var modelList []models.ProductModel
	if err := r.db.WithContext(ctx).Where("name ILIKE ?", "%"+name+"%").Find(&modelList).Error; err != nil {
		return nil, err
	}

	result := make([]*domain.Product, len(modelList))
	for i, model := range modelList {
		result[i] = model.ToDomain()
	}
	return result, nil
}

// FindByBarcode retrieves a product by barcode
func (r *ProductRepository) FindByBarcode(ctx context.Context, barcode string) (*domain.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.ProductModel
	if err := r.db.WithContext(ctx).First(&model, "barcode = ?", barcode).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return model.ToDomain(), nil
}

// Update updates an existing product
func (r *ProductRepository) Update(ctx context.Context, product *domain.Product) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.ProductModel
	model.FromDomain(product)

	return r.db.WithContext(ctx).Save(&model).Error
}

// Delete soft deletes a product by ID
func (r *ProductRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.ProductModel{}, "id = ?", id).Error
}
