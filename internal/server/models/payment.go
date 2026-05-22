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
	AmountUsd       int64     `gorm:"type:bigint;not null"`
	PriceBcv        int64     `gorm:"type:bigint;not null"`
	Identification  string    `gorm:"type:varchar(20);not null"`
	IsDiscount      bool      `gorm:"not null;default:false"`
	PaidAt          time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
	IsConfirmed     bool      `gorm:"not null;default:false"`
	User            User      `gorm:"foreignKey:UserID"`
}

func NewPayment(
	userID uuid.UUID,
	numberOfMonths int,
	referenceNumber, bankName string,
	amountBs, amountUsd, priceBcv int64,
	identification string,
	isDiscount bool,
	paidAt time.Time,
) *Payment {
	return &Payment{
		UserID:          userID,
		NumberOfMonths:  numberOfMonths,
		ReferenceNumber: referenceNumber,
		BankName:        bankName,
		AmountBs:        amountBs,
		AmountUsd:       amountUsd,
		PriceBcv:        priceBcv,
		Identification:  identification,
		IsDiscount:      isDiscount,
		PaidAt:          paidAt,
		IsConfirmed:     false,
	}
}
