export const sidebarContent = {
  title: 'Portal Admin',
  subtitle: 'Gestión',
  nav: [
    { label: 'Pagos', icon: 'payments', to: '/admin/payments' },
  ],
  logout: { label: 'Salir', icon: 'logout' },
}

export const paymentsContent = {
  title: 'Historial de Pagos',
  description: 'Gestione transacciones y liquidaciones recientes.',
  exportLabel: 'Exportar Reporte',
}

export const PAYMENT_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'paidAt', label: 'Fecha' },
  { id: 'numberOfMonths', label: 'Meses Pagados' },
  { id: 'email', label: 'Email Usuario' },
  { id: 'amountBs', label: 'Monto BS' },
  { id: 'referenceNumber', label: 'N. Referencia' },
  { id: 'status', label: 'Estado' },
  { id: 'actions', label: '' },
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
