package models

import "github.com/edorguez/merki/pkg/models"

type BCVRate struct {
	models.BaseModel
	UsdRate int64 `gorm:"not null;type:bigint"`
	EurRate int64 `gorm:"not null;type:bigint"`
}
