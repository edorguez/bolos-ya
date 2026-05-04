import { useState, useCallback } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
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
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className={styles.layout}>
      {sidebarOpen && <div className={styles.backdrop} onClick={handleClose} />}
      <Sidebar onLogout={logout} isOpen={sidebarOpen} onClose={handleClose} />
      <main className={styles.content}>
        <HeaderBar onToggle={handleToggle} />
        <Outlet />
      </main>
    </div>
  )
}
