import type { PaymentStatus } from '../../../types/payment'
import { PENDING_STATUS_ID, APPROVED_STATUS_ID, REJECTED_STATUS_ID } from '../../../constants/admin/paymentStatus'

const config: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  [PENDING_STATUS_ID]: { color: '#7c3e12', bg: '#fbe8d6', dot: '#f4a261', label: 'Pendiente' },
  [APPROVED_STATUS_ID]: { color: '#147a3d', bg: '#e6f6ec', dot: '#00ca48', label: 'Aprobado' },
  [REJECTED_STATUS_ID]: { color: '#b91c1c', bg: '#fee2e2', dot: '#ff2b3a', label: 'Rechazado' },
}

export function PaymentStatusBadge({ paymentStatus }: { paymentStatus: PaymentStatus }) {
  const cfg = config[paymentStatus.id] ?? { color: '#474645', bg: '#f2f0ed', dot: '#a7a7a7', label: paymentStatus.name }

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
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '-0.1px',
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
          backgroundColor: cfg.dot,
          display: 'inline-block',
        }}
      />
      {cfg.label}
    </span>
  )
}
