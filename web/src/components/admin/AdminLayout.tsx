import { useState, useCallback } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from '../../hooks/auth/useAuth'
import { HeaderBar } from './HeaderBar'
import { Sidebar } from './Sidebar'
import styles from './AdminLayout.module.scss'

export function AdminLayout() {
  const { isAuthenticated, loading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleToggle = useCallback(() => setSidebarOpen((v) => !v), [])
  const handleClose = useCallback(() => setSidebarOpen(false), [])

  if (loading) {
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
        Verificando sesión...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />
  }

  return (
    <div className={styles.layout}>
      {sidebarOpen && <div className={styles.backdrop} onClick={handleClose} />}
      <Sidebar onLogout={logout} isOpen={sidebarOpen} onClose={handleClose} />
      <main className={styles.content}>
        <HeaderBar onToggle={handleToggle} />
        <Toaster position="top-right" richColors />
        <Outlet />
      </main>
    </div>
  )
}
