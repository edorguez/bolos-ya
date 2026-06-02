package models

import "github.com/edorguez/bolos-ya/pkg/models"

type BCVRate struct {
	models.BaseModel
	RateDate string `gorm:"uniqueIndex:idx_bcv_rates_rate_date;not null;type:date"`
	UsdRate  int64  `gorm:"not null;type:bigint"`
	EurRate  int64  `gorm:"not null;type:bigint"`
}
