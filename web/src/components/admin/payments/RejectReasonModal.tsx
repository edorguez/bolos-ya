import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import type { RejectionReason } from '../../../types/payment'
import { paymentModalContent } from '../../../constants/admin/content'

interface RejectReasonModalProps {
  open: boolean
  reasons: RejectionReason[]
  onClose: () => void
  onConfirm: (reasonId: string, message: string) => void
}

export function RejectReasonModal({ open, reasons, onClose, onConfirm }: RejectReasonModalProps) {
  const [reasonId, setReasonId] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ reason?: string; message?: string }>({})

  useEffect(() => {
    if (open) {
      setReasonId('')
      setMessage('')
      setErrors({})
    }
  }, [open])

  function handleReasonChange(e: SelectChangeEvent<string>) {
    setReasonId(e.target.value)
    if (e.target.value) setErrors((prev) => ({ ...prev, reason: undefined }))
  }

  function handleMessageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val.length <= 200) setMessage(val)
    if (val.length <= 200) setErrors((prev) => ({ ...prev, message: undefined }))
  }

  function handleConfirm() {
    const newErrors: { reason?: string; message?: string } = {}

    if (!reasonId) {
      newErrors.reason = 'Seleccione un motivo de rechazo'
    }

    if (message.length > 200) {
      newErrors.message = `El mensaje no debe exceder los 200 caracteres (${message.length}/200)`
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onConfirm(reasonId, message)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ position: 'relative' }}>
        {paymentModalContent.rejectTitle}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <span className="material-symbols-outlined">close</span>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ '&.MuiDialogContent-root': { padding: '1.25rem 1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' } }}>
        <FormControl fullWidth error={!!errors.reason}  >
          <InputLabel id="reject-reason-label">
            {paymentModalContent.rejectReasonLabel}
          </InputLabel>
          <Select
            labelId="reject-reason-label"
            value={reasonId}
            label={paymentModalContent.rejectReasonLabel}
            onChange={handleReasonChange}
            sx={{
              '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-coral-red)' },
            }}
          >
            {reasons.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.reason}
              </MenuItem>
            ))}
          </Select>
          {errors.reason && (
            <FormHelperText sx={{ color: 'var(--color-coral-red)' }}>{errors.reason}</FormHelperText>
          )}
        </FormControl>

        <TextField
          label={paymentModalContent.rejectMessageLabel}
          placeholder={paymentModalContent.rejectMessagePlaceholder}
          multiline
          rows={3}
          value={message}
          onChange={handleMessageChange}
          error={!!errors.message}
          helperText={errors.message || `${message.length}/200`}
          fullWidth
          slotProps={{
            htmlInput: { maxLength: 200 },
          }}
          sx={{
            '& .MuiFormHelperText-root': {
              color: errors.message ? 'var(--color-coral-red)' : 'var(--color-ash)',
              marginLeft: 0,
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-coral-red)' },
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          fullWidth
          onClick={handleConfirm}
          sx={{
            backgroundColor: 'var(--color-coral-red)',
            '&:hover': { backgroundColor: '#dc2626' },
          }}
        >
          {paymentModalContent.rejectConfirmYes}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
        >
          {paymentModalContent.rejectConfirmNo}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
