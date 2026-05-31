import React from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material'
import type { PaymentResponse } from '../../../types/payment'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { paymentModalContent } from '../../../constants/admin/content'
import { PENDING_STATUS_ID, APPROVED_STATUS_ID, REJECTED_STATUS_ID } from '../../../constants/admin/paymentStatus'
import { formatAmount } from '../../../utils/format'

const cellSx = {
  fontSize: '0.75rem',
  color: 'var(--color-graphite)',
  padding: '0.5rem 0.75rem',
}

const labelSx = {
  ...cellSx,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: 'var(--color-charcoal-primary)',
}

interface PaymentDetailModalProps {
  open: boolean
  payment: PaymentResponse | null
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).replace('.', '')
}

function monthsLabel(n: number): string {
  return `${n} ${n === 1 ? 'mes' : 'meses'}`
}

export function PaymentDetailModal({ open, payment, onClose, onApprove, onReject }: PaymentDetailModalProps) {
  if (!payment) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ position: 'relative' }}>
        {paymentModalContent.detailTitle}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <span className="material-symbols-outlined">close</span>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '0.25rem 0 0.75rem' }}>
        {(() => {
          const rows: { label: string; value: React.ReactNode }[] = [
            { label: 'ID', value: payment.id.slice(0, 8) },
            { label: 'Usuario', value: payment.user.email },
            { label: 'Estado', value: <PaymentStatusBadge paymentStatus={payment.paymentStatus} /> },
            { label: 'Monto', value: formatAmount(payment.amountBs) },
            { label: 'Meses Pagados', value: monthsLabel(payment.numberOfMonths) },
            { label: 'Número de Referencia', value: payment.referenceNumber },
            { label: 'Banco', value: payment.bankName },
            { label: 'Cédula', value: payment.identification },
            { label: 'Fecha de Pago', value: formatDate(payment.paidAt) },
            { label: 'Descuento', value: payment.isDiscount ? 'Sí' : 'No' },
          ]

          if (payment.approvedAt) {
            rows.push({ label: 'Aprobado el', value: formatDate(payment.approvedAt) })
          }

          if (payment.rejectedAt) {
            rows.push({ label: 'Rechazado el', value: formatDate(payment.rejectedAt) })
            if (payment.rejectionReason) {
              rows.push({ label: 'Motivo de Rechazo', value: payment.rejectionReason.reason })
            }
            if (payment.rejectionMessage) {
              rows.push({ label: 'Mensaje Adicional', value: payment.rejectionMessage })
            }
          }

          return (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {rows.map((row, i) => (
                <React.Fragment key={row.label}>
                  <Box sx={{
                    ...labelSx,
                    bgcolor: i % 2 === 0 ? 'var(--color-parchment-card)' : 'transparent',
                  }}>
                    {row.label}
                  </Box>
                  <Box sx={{
                    ...cellSx,
                    bgcolor: i % 2 === 0 ? 'var(--color-parchment-card)' : 'transparent',
                  }}>
                    {row.value}
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          )
        })()}
      </DialogContent>

      <DialogActions>
        {(payment.paymentStatus.id === PENDING_STATUS_ID || payment.paymentStatus.id === REJECTED_STATUS_ID) && (
          <Button
            variant="contained"
            fullWidth
            onClick={onApprove}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>}
            sx={{
              backgroundColor: 'var(--color-meadow-green)',
              '&:hover': { backgroundColor: '#059669' },
            }}
          >
            {paymentModalContent.approveButton}
          </Button>
        )}
        {(payment.paymentStatus.id === PENDING_STATUS_ID || payment.paymentStatus.id === APPROVED_STATUS_ID) && (
          <Button
            variant="contained"
            fullWidth
            onClick={onReject}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>cancel</span>}
            sx={{
              backgroundColor: 'var(--color-coral-red)',
              '&:hover': { backgroundColor: '#dc2626' },
            }}
          >
            {paymentModalContent.rejectButton}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
