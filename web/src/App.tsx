import { Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './components/home/HomePage'
import { LoginPage } from './components/auth/LoginPage'
import { AdminLayout } from './components/admin/AdminLayout'
import { PaymentsPage } from './components/admin/payments/PaymentsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/payments" replace />} />
        <Route path="payments" element={<PaymentsPage />} />
      </Route>
    </Routes>
  )
}

export default App
