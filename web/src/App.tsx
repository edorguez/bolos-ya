import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HomePage } from './components/home/HomePage'
import { ErrorBoundary } from './components/shared/ErrorBoundary'

const PrivacyPage = lazy(() => import('./components/privacy/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('./components/terms/TermsPage').then(m => ({ default: m.TermsPage })))
const ContactPage = lazy(() => import('./components/contact/ContactPage').then(m => ({ default: m.ContactPage })))
const LoginPage = lazy(() => import('./components/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const PaymentsPage = lazy(() => import('./components/admin/payments/PaymentsPage').then(m => ({ default: m.PaymentsPage })))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      color: 'var(--color-ash)',
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.875rem',
    }}>
      Cargando...
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<ErrorBoundary><AdminLayout /></ErrorBoundary>}>
          <Route index element={<Navigate to="/admin/payments" replace />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>
      </Routes>
    </Suspense>
    </>
  )
}

export default App
