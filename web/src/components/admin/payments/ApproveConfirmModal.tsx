import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { paymentModalContent } from '../../../constants/admin/content'

interface ApproveConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ApproveConfirmModal({ open, onClose, onConfirm }: ApproveConfirmModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
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
        fontSize: '1.125rem',
        fontWeight: 600,
        color: 'var(--color-charcoal-primary)',
        padding: '1.5rem 1.5rem 0.25rem',
      }}>
        {paymentModalContent.approveConfirmTitle}
      </DialogTitle>

      <DialogContent sx={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.9375rem',
        color: 'var(--color-graphite)',
        padding: '0.5rem 1.5rem',
      }}>
        {paymentModalContent.approveConfirmMessage}
      </DialogContent>

      <DialogActions sx={{ padding: '0.5rem 1.5rem 1.5rem', gap: '0.75rem' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onConfirm}
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
          {paymentModalContent.approveConfirmYes}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: 'var(--radius-buttonspill, 32px)',
            padding: '0.625rem 1rem',
            color: 'var(--color-graphite)',
            borderColor: 'var(--color-stone-surface)',
            '&:hover': { borderColor: 'var(--color-fog)', backgroundColor: 'var(--color-parchment-card)' },
          }}
        >
          {paymentModalContent.approveConfirmNo}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
