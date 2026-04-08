package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

type ProductRepository interface {
	Create(ctx context.Context, product *models.Product) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error)
	FindAllByIDs(ctx context.Context, ids []uuid.UUID) ([]*models.Product, error)
	FindByName(ctx context.Context, name string) ([]*models.Product, error)
	FindByBarcode(ctx context.Context, barcode string) (*models.Product, error)
	Update(ctx context.Context, product *models.Product) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

// Create inserts a new product into the database
func (r *productRepository) Create(ctx context.Context, product *models.Product) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(product).Error
}

// FindByID retrieves a product by ID
func (r *productRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
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

// FindAllByIDs retrieves a list of product by IDs
func (r *productRepository) FindAllByIDs(ctx context.Context, ids []uuid.UUID) ([]*models.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if len(ids) == 0 {
		return nil, errors.ErrInvalidParams
	}

	var products []models.Product
	if err := r.db.WithContext(ctx).Where("id IN ?", ids).Find(&products).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Product, len(products))
	for i := range products {
		result[i] = &products[i]
	}
	return result, nil
}

// FindByName retrieves products by name (partial match)
func (r *productRepository) FindByName(ctx context.Context, name string) ([]*models.Product, error) {
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
func (r *productRepository) FindByBarcode(ctx context.Context, barcode string) (*models.Product, error) {
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
func (r *productRepository) Update(ctx context.Context, product *models.Product) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(product).Error
}

// Delete soft deletes a product by ID
func (r *productRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.Product{}, "id = ?", id).Error
}
