import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import type { PaymentResponse } from '../../../types/payment'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { paymentModalContent } from '../../../constants/admin/content'

const detailSx = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  color: 'var(--color-graphite)',
  '& dt': {
    fontWeight: 600,
    color: 'var(--color-charcoal-primary)',
    marginBottom: '0.25rem',
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  '& dd': {
    margin: '0 0 1rem',
    fontSize: '0.9375rem',
    color: 'var(--color-graphite)',
  },
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

function formatAmount(bs: number): string {
  return `Bs. ${bs.toLocaleString('es-VE')}`
}

function monthsLabel(n: number): string {
  return `${n} ${n === 1 ? 'mes' : 'meses'}`
}

export function PaymentDetailModal({ open, payment, onClose, onApprove, onReject }: PaymentDetailModalProps) {
  if (!payment) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 'var(--radius-cardslarge, 24px)',
            padding: '0.5rem',
            boxShadow: 'var(--shadow-subtle)',
          },
        },
      }}
    >
      <DialogTitle sx={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--color-charcoal-primary)',
        padding: '1.5rem 1.5rem 0.5rem',
      }}>
        {paymentModalContent.detailTitle}
      </DialogTitle>

      <DialogContent sx={{ ...detailSx, padding: '0.5rem 1.5rem 1rem' }}>
        <dl>
          <dt>ID</dt>
          <dd>{payment.id.slice(0, 8)}</dd>

          <dt>Usuario</dt>
          <dd>{payment.user.email}</dd>

          <dt>Estado</dt>
          <dd><PaymentStatusBadge paymentStatus={payment.paymentStatus} /></dd>

          <dt>Monto</dt>
          <dd>{formatAmount(payment.amountBs)}</dd>

          <dt>Meses Pagados</dt>
          <dd>{monthsLabel(payment.numberOfMonths)}</dd>

          <dt>Número de Referencia</dt>
          <dd>{payment.referenceNumber}</dd>

          <dt>Banco</dt>
          <dd>{payment.bankName}</dd>

          <dt>Cédula</dt>
          <dd>{payment.identification}</dd>

          <dt>Fecha de Pago</dt>
          <dd>{formatDate(payment.paidAt)}</dd>

          <dt>Descuento</dt>
          <dd>{payment.isDiscount ? 'Sí' : 'No'}</dd>

          {payment.approvedAt && (
            <>
              <dt>Aprobado el</dt>
              <dd>{formatDate(payment.approvedAt)}</dd>
            </>
          )}

          {payment.rejectedAt && (
            <>
              <dt>Rechazado el</dt>
              <dd>{formatDate(payment.rejectedAt)}</dd>
              {payment.rejectionReason && (
                <>
                  <dt>Motivo de Rechazo</dt>
                  <dd>{payment.rejectionReason.reason}</dd>
                </>
              )}
              {payment.rejectionMessage && (
                <>
                  <dt>Mensaje Adicional</dt>
                  <dd>{payment.rejectionMessage}</dd>
                </>
              )}
            </>
          )}
        </dl>
      </DialogContent>

      <DialogActions sx={{ padding: '0.5rem 1.5rem 1.5rem', gap: '0.75rem' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onApprove}
          startIcon={<span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>}
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: 'var(--radius-buttonspill, 32px)',
            padding: '0.625rem 1rem',
            backgroundColor: 'var(--color-meadow-green)',
            '&:hover': { backgroundColor: '#059669' },
          }}
        >
          {paymentModalContent.approveButton}
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={onReject}
          startIcon={<span className="material-symbols-outlined" style={{ fontSize: 20 }}>cancel</span>}
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: 'var(--radius-buttonspill, 32px)',
            padding: '0.625rem 1rem',
            backgroundColor: 'var(--color-coral-red)',
            '&:hover': { backgroundColor: '#dc2626' },
          }}
        >
          {paymentModalContent.rejectButton}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
