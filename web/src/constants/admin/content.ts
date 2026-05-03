export interface Payment {
  id: string
  date: string
  months: string
  email: string
  amountBs: string
  reference: string
}

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

export const mockPayments: Payment[] = [
  { id: '#1024', date: '24 Oct, 14:30', months: 'Octubre, Noviembre', email: 'admin@central.com', amountBs: 'Bs. 4,500', reference: 'REF-9928-ABC' },
  { id: '#1025', date: '24 Oct, 11:15', months: 'Octubre', email: 'kiosko@elsol.com', amountBs: 'Bs. 850', reference: 'REF-4412-XYZ' },
  { id: '#1026', date: '23 Oct, 16:45', months: 'Septiembre, Octubre, Noviembre', email: 'gerencia@market.ve', amountBs: 'Bs. 12,000', reference: 'REF-7731-LMN' },
  { id: '#1027', date: '23 Oct, 09:20', months: 'Octubre', email: 'pagos@bodegon.com', amountBs: 'Bs. 2,100', reference: 'REF-1120-PQR' },
  { id: '#1028', date: '22 Oct, 18:05', months: 'Anual (2024)', email: 'finanzas@hyper.ve', amountBs: 'Bs. 45,000', reference: 'REF-8890-DEF' },
  { id: '#1029', date: '22 Oct, 10:30', months: 'Noviembre, Diciembre', email: 'admin@central.com', amountBs: 'Bs. 6,300', reference: 'REF-5543-GHI' },
  { id: '#1030', date: '21 Oct, 15:50', months: 'Octubre, Noviembre, Diciembre', email: 'ventas@abarrotes.ve', amountBs: 'Bs. 18,750', reference: 'REF-3321-JKL' },
]

export const tableColumns = [
  { id: 'id', label: 'ID' },
  { id: 'date', label: 'Fecha' },
  { id: 'months', label: 'Meses Pagados' },
  { id: 'email', label: 'Email Usuario' },
  { id: 'amountBs', label: 'Monto BS' },
  { id: 'reference', label: 'N. Referencia' },
]
