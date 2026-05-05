import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { mockPayments, tableColumns, paymentsContent } from '../../constants/admin/content'
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
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '0.75rem',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  color: 'var(--color-ash)',
}

const idCellSx = {
  ...cellSx,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '1rem',
  color: 'var(--color-charcoal-primary)',
}

const amountCellSx = {
  ...cellSx,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '1rem',
  color: 'var(--color-charcoal-primary)',
}

const refCellSx = {
  ...cellSx,
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
}

export function PaymentsPage() {
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {tableColumns.map((col) => (
                  <TableCell key={col.id} sx={headCellSx}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockPayments.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:hover': { backgroundColor: 'var(--color-parchment-card)' },
                    cursor: 'pointer',
                    borderRadius: '1rem',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell sx={idCellSx}>{row.id}</TableCell>
                  <TableCell sx={cellSx}>{row.date}</TableCell>
                  <TableCell sx={cellSx}>{row.months}</TableCell>
                  <TableCell sx={cellSx}>{row.email}</TableCell>
                  <TableCell sx={amountCellSx}>{row.amountBs}</TableCell>
                  <TableCell sx={refCellSx}>{row.reference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  )
}
