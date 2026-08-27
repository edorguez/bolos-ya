export const sidebarContent = {
  title: 'Merki',
  nav: [
    { label: 'Pagos', icon: 'payments', to: '/admin/payments' },
  ],
  logout: { label: 'Salir', icon: 'logout' },
}

export const paymentsContent = {
  title: 'Historial de Pagos',
  description: 'Revisa y aprueba los pagos de suscripción premium.',
}

export const PAYMENT_COLUMNS = [
  { id: 'id', label: 'ID', sortable: false },
  { id: 'paidAt', label: 'Fecha', sortable: true },
  { id: 'numberOfMonths', label: 'Meses Pagados', sortable: true },
  { id: 'email', label: 'Email Usuario', sortable: true },
  { id: 'amountBs', label: 'Monto BS', sortable: true },
  { id: 'referenceNumber', label: 'N. Referencia', sortable: true },
  { id: 'status', label: 'Estado', sortable: true },
  { id: 'actions', label: '', sortable: false },
]

export const paymentModalContent = {
  detailTitle: 'Detalle del Pago',
  approveButton: 'Aprobar Pago',
  rejectButton: 'Rechazar Pago',
  approveConfirmTitle: 'Confirmar Aprobación',
  approveConfirmMessage: 'Esta acción confirmará que el pago ha sido verificado correctamente.',
  approveConfirmYes: 'Sí, Aprobar',
  approveConfirmNo: 'Cancelar',
  rejectTitle: 'Rechazar Pago',
  rejectReasonLabel: 'Motivo de Rechazo',
  rejectReasonPlaceholder: 'Seleccione un motivo',
  rejectMessageLabel: 'Mensaje Adicional',
  rejectMessagePlaceholder: 'Explique el motivo del rechazo (opcional)',
  rejectConfirmYes: 'Sí, Rechazar',
  rejectConfirmNo: 'Cancelar',
  toastApproved: 'Pago aprobado exitosamente',
  toastRejected: 'Pago rechazado',
}
