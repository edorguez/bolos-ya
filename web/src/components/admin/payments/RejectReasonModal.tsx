import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
        {paymentModalContent.rejectTitle}
      </DialogTitle>

      <DialogContent sx={{ padding: '0.5rem 1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormControl fullWidth error={!!errors.reason}>
          <InputLabel id="reject-reason-label" sx={{ fontFamily: 'Inter, sans-serif' }}>
            {paymentModalContent.rejectReasonLabel}
          </InputLabel>
          <Select
            labelId="reject-reason-label"
            value={reasonId}
            label={paymentModalContent.rejectReasonLabel}
            onChange={handleReasonChange}
            sx={{
              fontFamily: 'Inter, sans-serif',
              borderRadius: 'var(--radius-inputs, 10px)',
              '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-coral-red)' },
            }}
          >
            {reasons.map((r) => (
              <MenuItem key={r.id} value={r.id} sx={{ fontFamily: 'Inter, sans-serif' }}>
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
            '& .MuiOutlinedInput-root': {
              fontFamily: 'Inter, sans-serif',
              borderRadius: 'var(--radius-inputs, 10px)',
            },
            '& .MuiFormHelperText-root': {
              fontFamily: 'Inter, sans-serif',
              color: errors.message ? 'var(--color-coral-red)' : 'var(--color-ash)',
              marginLeft: 0,
            },
            '& .MuiInputLabel-root': { fontFamily: 'Inter, sans-serif' },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-coral-red)' },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ padding: '0.5rem 1.5rem 1.5rem', gap: '0.75rem' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleConfirm}
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: 'var(--radius-buttonspill, 32px)',
            padding: '0.625rem 1rem',
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
          {paymentModalContent.rejectConfirmNo}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
