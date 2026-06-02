package models

import "github.com/edorguez/bolos-ya/pkg/models"

type BCVRate struct {
	models.BaseModel
	UsdRate int64 `gorm:"not null;type:bigint"`
	EurRate int64 `gorm:"not null;type:bigint"`
}
