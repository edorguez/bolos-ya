import type { PaymentStatus } from '../../../types/payment'

const PENDING_ID = 'a1111111-1111-4a11-9a11-111111111111'
const APPROVED_ID = 'a2222222-2222-4a22-9a22-222222222222'
const REJECTED_ID = 'a3333333-3333-4a33-9a33-333333333333'

const config: Record<string, { color: string; bg: string; label: string }> = {
  [PENDING_ID]: { color: '#92400e', bg: '#fef3c7', label: 'Pendiente' },
  [APPROVED_ID]: { color: '#166534', bg: '#dcfce7', label: 'Aprobado' },
  [REJECTED_ID]: { color: '#991b1b', bg: '#fee2e2', label: 'Rechazado' },
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
