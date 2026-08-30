import React from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
} from '@mui/material'
import type { PaymentResponse } from '../../../types/payment'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { paymentModalContent } from '../../../constants/admin/content'
import { PENDING_STATUS_ID, APPROVED_STATUS_ID, REJECTED_STATUS_ID } from '../../../constants/admin/paymentStatus'
import { formatAmount } from '../../../utils/format'
import { MaterialIcon } from '../../shared/MaterialIcon'

const labelSx = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: 'var(--color-ash)',
  padding: '0.625rem 0.25rem 0.25rem',
}

const valueSx = {
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--color-charcoal-primary)',
  padding: '0.25rem 0.25rem 0.625rem',
  wordBreak: 'break-word' as const,
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

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'ID', value: payment.id.slice(0, 8) },
    { label: 'Usuario', value: payment.user.email },
    { label: 'Estado', value: <PaymentStatusBadge paymentStatus={payment.paymentStatus} /> },
    { label: 'Monto', value: formatAmount(payment.amountBs) },
    { label: 'Meses Pagados', value: monthsLabel(payment.numberOfMonths) },
    { label: 'N. Referencia', value: payment.referenceNumber },
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {paymentModalContent.detailTitle}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <MaterialIcon name="close" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '0.5rem 0.25rem 0.75rem' }}>
        <Box>
          {rows.map((row, i) => (
            <React.Fragment key={row.label}>
              <Box sx={labelSx}>{row.label}</Box>
              <Box sx={valueSx}>{row.value}</Box>
              {i < rows.length - 1 && <Divider sx={{ borderColor: 'var(--color-stone-surface)' }} />}
            </React.Fragment>
          ))}
        </Box>
      </DialogContent>

      {(payment.paymentStatus.id === PENDING_STATUS_ID ||
        payment.paymentStatus.id === REJECTED_STATUS_ID ||
        payment.paymentStatus.id === APPROVED_STATUS_ID) && (
        <DialogActions>
          {(payment.paymentStatus.id === PENDING_STATUS_ID || payment.paymentStatus.id === REJECTED_STATUS_ID) && (
            <Button
              variant="contained"
              fullWidth
              onClick={onApprove}
              startIcon={<MaterialIcon name="check_circle" style={{ fontSize: 18 }} />}
            >
              {paymentModalContent.approveButton}
            </Button>
          )}
          {(payment.paymentStatus.id === PENDING_STATUS_ID || payment.paymentStatus.id === APPROVED_STATUS_ID) && (
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={onReject}
              startIcon={<MaterialIcon name="cancel" style={{ fontSize: 18 }} />}
            >
              {paymentModalContent.rejectButton}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}
