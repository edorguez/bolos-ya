export const sidebarContent = {
  title: 'Portal Admin',
  subtitle: 'Gesti\u00f3n',
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
  approveConfirmTitle: 'Confirmar Aprobaci\u00f3n',
  approveConfirmMessage: '\u00bfEst\u00e1 seguro de aprobar este pago? Esta acci\u00f3n confirmar\u00e1 que el pago ha sido verificado correctamente.',
  approveConfirmYes: 'S\u00ed, Aprobar',
  approveConfirmNo: 'Cancelar',
  rejectTitle: 'Rechazar Pago',
  rejectReasonLabel: 'Motivo de Rechazo',
  rejectReasonPlaceholder: 'Seleccione un motivo',
  rejectMessageLabel: 'Mensaje Adicional',
  rejectMessagePlaceholder: 'Explique el motivo del rechazo (opcional)',
  rejectConfirmYes: 'S\u00ed, Rechazar',
  rejectConfirmNo: 'Cancelar',
  toastApproved: 'Pago aprobado exitosamente',
  toastRejected: 'Pago rechazado',
}
