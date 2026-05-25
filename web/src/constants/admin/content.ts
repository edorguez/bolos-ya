export const sidebarContent = {
  title: 'Portal Admin',
  subtitle: 'Gestión Supermercado',
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
  { id: 'isConfirmed', label: 'Confirmado' },
]
