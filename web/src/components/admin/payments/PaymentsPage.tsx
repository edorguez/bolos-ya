import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { usePayments } from '../../../hooks/usePayments'
import { paymentsContent, PAYMENT_COLUMNS } from '../../../constants/admin/content'
import type { PaymentResponse } from '../../../types/payment'
import styles from './PaymentsPage.module.scss'

const cellSx = {
  fontFamily: 'Inter, sans-serif',
  color: 'var(--color-graphite)',
  fontSize: '0.875rem',
  padding: '1.25rem 1.5rem',
  borderBottom: 'none',
  whiteSpace: 'nowrap' as const,
}

const headCellSx = {
  ...cellSx,
  fontWeight: 600,
  fontSize: '0.75rem',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  color: 'var(--color-ash)',
}

const idCellSx = {
  ...cellSx,
  fontWeight: 600,
  fontSize: '1rem',
  color: 'var(--color-charcoal-primary)',
}

const amountCellSx = {
  ...cellSx,
  fontWeight: 600,
  fontSize: '1rem',
  color: 'var(--color-charcoal-primary)',
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

function ConfirmedCell({ value }: { value: boolean }) {
  const icon = value ? 'check_circle' : 'cancel'
  const label = value ? 'Sí' : 'No'
  return (
    <span className={`${styles.confirmed} ${value ? styles.confirmedYes : styles.confirmedNo}`}>
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
      {label}
    </span>
  )
}

function SkeletonRows() {
  const skeletons = Array.from({ length: 5 })
  return (
    <>
      {skeletons.map((_, i) => (
        <TableRow key={i}>
          <TableCell sx={cellSx}><div className={`${styles.skeleton} ${styles.skeletonId}`} /></TableCell>
          <TableCell sx={cellSx}><div className={`${styles.skeleton} ${styles.skeletonDate}`} /></TableCell>
          <TableCell sx={cellSx}><div className={`${styles.skeleton} ${styles.skeletonMonths}`} /></TableCell>
          <TableCell sx={cellSx}><div className={`${styles.skeleton} ${styles.skeletonEmail}`} /></TableCell>
          <TableCell sx={cellSx}><div className={`${styles.skeleton} ${styles.skeletonAmount}`} /></TableCell>
          <TableCell sx={cellSx}><div className={`${styles.skeleton} ${styles.skeletonRef}`} /></TableCell>
          <TableCell sx={cellSx}><div className={`${styles.skeleton} ${styles.skeletonConfirmed}`} /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function PaymentsPage() {
  const { payments, loading, error, refetch } = usePayments()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{paymentsContent.title}</h2>
          <p className={styles.description}>{paymentsContent.description}</p>
        </div>
        <button className={styles.exportBtn}>
          {paymentsContent.exportLabel}
        </button>
      </header>

      <div className={styles.tableWrap}>
        {error ? (
          <div className={styles.errorState}>
            <span>{error}</span>
            <button className={styles.retryBtn} onClick={refetch}>
              Reintentar
            </button>
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {PAYMENT_COLUMNS.map((col) => (
                    <TableCell key={col.id} sx={headCellSx}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <SkeletonRows />
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={PAYMENT_COLUMNS.length} align="center" sx={{ ...cellSx, py: 6 }}>
                      <div className={styles.emptyState}>
                        No hay pagos registrados
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((row: PaymentResponse) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:hover': { backgroundColor: 'var(--color-parchment-card)' },
                        cursor: 'pointer',
                        borderRadius: '1rem',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell sx={idCellSx}>{row.id.slice(0, 8)}</TableCell>
                      <TableCell sx={cellSx}>{formatDate(row.paidAt)}</TableCell>
                      <TableCell sx={cellSx}>{monthsLabel(row.numberOfMonths)}</TableCell>
                      <TableCell sx={cellSx}>{row.user.email}</TableCell>
                      <TableCell sx={amountCellSx}>{formatAmount(row.amountBs)}</TableCell>
                      <TableCell sx={cellSx}>{row.referenceNumber}</TableCell>
                      <TableCell sx={cellSx}>
                        <ConfirmedCell value={row.isConfirmed} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  )
}
