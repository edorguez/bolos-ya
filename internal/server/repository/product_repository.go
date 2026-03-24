package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

// GormProductRepository implements ProductRepository using GORM
type GormProductRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new ProductRepository
func NewProductRepository(db *gorm.DB) *GormProductRepository {
	return &GormProductRepository{db: db}
}

// Create inserts a new product into the database
func (r *GormProductRepository) Create(ctx context.Context, product *models.Product) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(product).Error
}

// FindByID retrieves a product by ID
func (r *GormProductRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var product models.Product
	if err := r.db.WithContext(ctx).First(&product, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &product, nil
}

// FindByName retrieves products by name (partial match)
func (r *GormProductRepository) FindByName(ctx context.Context, name string) ([]*models.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var productList []models.Product
	if err := r.db.WithContext(ctx).Where("name ILIKE ?", "%"+name+"%").Find(&productList).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Product, len(productList))
	for i, product := range productList {
		result[i] = &product
	}
	return result, nil
}

// FindByBarcode retrieves a product by barcode
func (r *GormProductRepository) FindByBarcode(ctx context.Context, barcode string) (*models.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var product models.Product
	if err := r.db.WithContext(ctx).First(&product, "barcode = ?", barcode).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &product, nil
}

// Update updates an existing product
func (r *GormProductRepository) Update(ctx context.Context, product *models.Product) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(product).Error
}

// Delete soft deletes a product by ID
func (r *GormProductRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.Product{}, "id = ?", id).Error
}
