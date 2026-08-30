import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material'
import { paymentModalContent } from '../../../constants/admin/content'
import { MaterialIcon } from '../../shared/MaterialIcon'

interface ApproveConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ApproveConfirmModal({ open, onClose, onConfirm }: ApproveConfirmModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {paymentModalContent.approveConfirmTitle}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <MaterialIcon name="close" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '0.5rem 1.25rem 1rem' }}>
        {paymentModalContent.approveConfirmMessage}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" fullWidth onClick={onConfirm}>
          {paymentModalContent.approveConfirmYes}
        </Button>
        <Button variant="outlined" fullWidth onClick={onClose}>
          {paymentModalContent.approveConfirmNo}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
