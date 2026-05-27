package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/edorguez/bolos-ya/pkg/models"
)

type PaymentStatus struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string    `gorm:"type:varchar(30);not null"`
	Description string    `gorm:"type:varchar(100)"`
}

type RejectionReason struct {
	ID     uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Reason string    `gorm:"type:varchar(100);not null"`
}

type Payment struct {
	models.BaseModel
	UserID            uuid.UUID        `gorm:"type:uuid;not null"`
	NumberOfMonths    int              `gorm:"not null"`
	ReferenceNumber   string           `gorm:"type:varchar(50);not null"`
	BankName          string           `gorm:"type:varchar(80);not null"`
	AmountBs          int64            `gorm:"type:bigint;not null"`
	AmountUsd         int64            `gorm:"type:bigint;not null"`
	PriceBcv          int64            `gorm:"type:bigint;not null"`
	Identification    string           `gorm:"type:varchar(20);not null"`
	IsDiscount        bool             `gorm:"not null;default:false"`
	PaidAt            time.Time        `gorm:"not null;default:CURRENT_TIMESTAMP"`
	StatusID          uuid.UUID        `gorm:"type:uuid;not null"`
	RejectionReasonID *uuid.UUID       `gorm:"type:uuid"`
	RejectionMessage  *string          `gorm:"type:varchar(200)"`
	ApprovedAt        *time.Time       `gorm:"type:timestamp"`
	RejectedAt        *time.Time       `gorm:"type:timestamp"`
	User              User             `gorm:"foreignKey:UserID"`
	PaymentStatus     PaymentStatus    `gorm:"foreignKey:StatusID"`
	RejectionReason   *RejectionReason `gorm:"foreignKey:RejectionReasonID"`
}

// PendingStatusID is the seeded UUID for the "Pendiente" status.
const PendingStatusID = "a1111111-1111-4a11-9a11-111111111111"

// ApprovedStatusID is the seeded UUID for the "Aprobado" status.
const ApprovedStatusID = "a2222222-2222-4a22-9a22-222222222222"

// RejectedStatusID is the seeded UUID for the "Rechazado" status.
const RejectedStatusID = "a3333333-3333-4a33-9a33-333333333333"

func NewPayment(
	userID uuid.UUID,
	numberOfMonths int,
	referenceNumber, bankName string,
	amountBs, amountUsd, priceBcv int64,
	identification string,
	isDiscount bool,
	paidAt time.Time,
) *Payment {
	statusID := uuid.MustParse(PendingStatusID)
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
		StatusID:        statusID,
	}
}
