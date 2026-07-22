import type { PaymentStatus } from '../../../types/payment'
import { PENDING_STATUS_ID, APPROVED_STATUS_ID, REJECTED_STATUS_ID } from '../../../constants/admin/paymentStatus'

const config: Record<string, { color: string; bg: string; label: string }> = {
  [PENDING_STATUS_ID]: { color: '#92400e', bg: '#fef3c7', label: 'Pendiente' },
  [APPROVED_STATUS_ID]: { color: '#166534', bg: '#dcfce7', label: 'Aprobado' },
  [REJECTED_STATUS_ID]: { color: '#991b1b', bg: '#fee2e2', label: 'Rechazado' },
}

export function PaymentStatusBadge({ paymentStatus }: { paymentStatus: PaymentStatus }) {
  const cfg = config[paymentStatus.id] ?? { color: '#474645', bg: '#f2f0ed', label: paymentStatus.name }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '32px',
        fontSize: '0.75rem',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        color: cfg.color,
        backgroundColor: cfg.bg,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: cfg.color,
          display: 'inline-block',
        }}
      />
      {cfg.label}
    </span>
  )
}
