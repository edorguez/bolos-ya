import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material'
import { paymentModalContent } from '../../../constants/admin/content'

interface ApproveConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ApproveConfirmModal({ open, onClose, onConfirm }: ApproveConfirmModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ position: 'relative' }}>
        {paymentModalContent.approveConfirmTitle}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <span className="material-symbols-outlined">close</span>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '0.5rem 1.25rem' }}>
        {paymentModalContent.approveConfirmMessage}
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          fullWidth
          onClick={onConfirm}
          sx={{
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
        >
          {paymentModalContent.approveConfirmNo}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
