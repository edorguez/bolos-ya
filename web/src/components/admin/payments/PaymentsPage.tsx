import { useState, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
} from '@mui/material'
import { toast } from 'sonner'
import { usePayments } from '../../../hooks/usePayments'
import { paymentsContent, PAYMENT_COLUMNS } from '../../../constants/admin/content'
import { APPROVED_STATUS_ID, REJECTED_STATUS_ID } from '../../../constants/admin/paymentStatus'
import type { PaymentResponse, RejectionReason } from '../../../types/payment'
import { updatePaymentStatus, getRejectionReasons } from '../../../services/paymentService'
import { useAuth } from '../../../hooks/auth/useAuth'
import { formatAmount } from '../../../utils/format'
import { MaterialIcon } from '../../shared/MaterialIcon'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { PaymentDetailModal } from './PaymentDetailModal'
import { ApproveConfirmModal } from './ApproveConfirmModal'
import { RejectReasonModal } from './RejectReasonModal'
import styles from './PaymentsPage.module.scss'

const cellSx = {
  whiteSpace: 'nowrap' as const,
}

const highlightCellSx = {
  ...cellSx,
  fontWeight: 600,
  fontSize: '0.8rem',
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

function monthsLabel(n: number): string {
  return `${n} ${n === 1 ? 'mes' : 'meses'}`
}

type ModalView = 'detail' | 'approve' | 'reject' | null

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
          <TableCell sx={cellSx}><div className={`${styles.skeleton} ${styles.skeletonStatus}`} /></TableCell>
          <TableCell sx={cellSx}><div className={`${styles.skeleton} ${styles.skeletonAction}`} /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function PaymentsPage() {
  const { token, userId: adminUserId } = useAuth()
  const {
    payments, loading, error, total, page, pageSize, sortBy, sortDir,
    setPage, setPageSize, setSort, refetch,
  } = usePayments(token, adminUserId)
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null)
  const [modalView, setModalView] = useState<ModalView>(null)
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([])

  const openDetail = useCallback((payment: PaymentResponse) => {
    setSelectedPayment(payment)
    setModalView('detail')
  }, [])

  const closeAll = useCallback(() => {
    setModalView(null)
    setSelectedPayment(null)
  }, [])

  const handleApproveClick = useCallback(() => {
    setModalView('approve')
  }, [])

  const handleRejectClick = useCallback(async () => {
    if (!token || !adminUserId) return
    try {
      const reasons = await getRejectionReasons(token, adminUserId)
      setRejectionReasons(reasons)
    } catch {
      toast.error('Error al cargar motivos de rechazo')
      return
    }
    setModalView('reject')
  }, [token, adminUserId])

  const handleConfirmApprove = useCallback(async () => {
    if (!token || !adminUserId || !selectedPayment) return
    try {
      await updatePaymentStatus(token, adminUserId, selectedPayment.id, { statusId: APPROVED_STATUS_ID })
      toast.success('Pago aprobado exitosamente')
      setModalView(null)
      setSelectedPayment(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al aprobar pago')
    }
  }, [token, adminUserId, selectedPayment, refetch])

  const handleConfirmReject = useCallback(async (reasonId: string, message: string) => {
    if (!token || !adminUserId || !selectedPayment) return
    try {
      await updatePaymentStatus(token, adminUserId, selectedPayment.id, {
        statusId: REJECTED_STATUS_ID,
        rejectionReasonId: reasonId,
        rejectionMessage: message || null,
      })
      toast.success('Pago rechazado')
      setModalView(null)
      setSelectedPayment(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al rechazar pago')
    }
  }, [token, adminUserId, selectedPayment, refetch])

  const handleSort = useCallback((colId: string) => {
    if (sortBy === colId && sortDir === 'desc') {
      setSort('', 'desc')
    } else if (sortBy === colId && sortDir === 'asc') {
      setSort(colId, 'desc')
    } else {
      setSort(colId, 'asc')
    }
  }, [sortBy, sortDir, setSort])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <h2 className={styles.title}>{paymentsContent.title}</h2>
          <p className={styles.description}>{paymentsContent.description}</p>
        </div>
        <button className={styles.refreshBtn} onClick={refetch}>
          <MaterialIcon name="refresh" style={{ fontSize: 18 }} />
          Actualizar
        </button>
      </header>

      <div className={styles.tableWrap}>
        {error ? (
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>
              <MaterialIcon name="error" style={{ fontSize: 24 }} />
            </span>
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
                    <TableCell key={col.id}>
                      {col.sortable ? (
                        <TableSortLabel
                          active={sortBy !== '' && sortBy === col.id}
                          direction={sortBy === col.id ? sortDir : 'asc'}
                          onClick={() => handleSort(col.id)}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <SkeletonRows />
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={PAYMENT_COLUMNS.length} align="center" sx={{ py: 6 }}>
                      <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>
                          <MaterialIcon name="payments" style={{ fontSize: 24 }} />
                        </span>
                        No hay pagos registrados
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((row: PaymentResponse) => (
                    <TableRow key={row.id}>
                      <TableCell sx={highlightCellSx}>{row.id.slice(0, 8)}</TableCell>
                      <TableCell sx={cellSx}>{formatDate(row.paidAt)}</TableCell>
                      <TableCell sx={cellSx}>{monthsLabel(row.numberOfMonths)}</TableCell>
                      <TableCell sx={cellSx}>{row.user.email}</TableCell>
                      <TableCell sx={highlightCellSx}>{formatAmount(row.amountBs)}</TableCell>
                      <TableCell sx={cellSx}>{row.referenceNumber}</TableCell>
                      <TableCell sx={cellSx}>
                        <PaymentStatusBadge paymentStatus={row.paymentStatus} />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openDetail(row)}
                          title="Ver detalle"
                        >
                          <MaterialIcon name="visibility" style={{ fontSize: 22 }} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
            />
          </TableContainer>
        )}
      </div>

      <PaymentDetailModal
        open={modalView === 'detail' && !!selectedPayment}
        payment={selectedPayment}
        onClose={closeAll}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
      />

      <ApproveConfirmModal
        open={modalView === 'approve'}
        onClose={closeAll}
        onConfirm={handleConfirmApprove}
      />

      <RejectReasonModal
        open={modalView === 'reject'}
        reasons={rejectionReasons}
        onClose={closeAll}
        onConfirm={handleConfirmReject}
      />
    </div>
  )
}
