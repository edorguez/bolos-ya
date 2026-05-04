package models

import (
	"time"

	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/pkg/models"
)

type Payment struct {
	models.BaseModel
	UserID          uuid.UUID `gorm:"type:uuid;not null"`
	NumberOfMonths  int       `gorm:"not null"`
	ReferenceNumber string    `gorm:"type:varchar(50);not null"`
	BankName        string    `gorm:"type:varchar(80);not null"`
	AmountBs        int64     `gorm:"type:bigint;not null"`
	PriceBcv        int64     `gorm:"type:bigint;not null"`
	IsDiscount      bool      `gorm:"not null;default:false"`
	PaidAt          time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
	IsConfirmed     bool      `gorm:"not null;default:false"`
	User            User      `gorm:"foreignKey:UserID"`
}

func NewPayment(
	userID uuid.UUID,
	numberOfMonths int,
	referenceNumber, bankName string,
	amountBs, priceBcv int64,
	isDiscount bool,
	paidAt time.Time,
) *Payment {
	return &Payment{
		UserID:          userID,
		NumberOfMonths:  numberOfMonths,
		ReferenceNumber: referenceNumber,
		BankName:        bankName,
		AmountBs:        amountBs,
		PriceBcv:        priceBcv,
		IsDiscount:      isDiscount,
		PaidAt:          paidAt,
		IsConfirmed:     false,
	}
}
