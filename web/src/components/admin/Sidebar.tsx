import { useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { sidebarContent } from '../../constants/admin/content'
import styles from './Sidebar.module.scss'

interface SidebarProps {
  onLogout: () => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ onLogout, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()

  const handleLogout = useCallback(() => {
    onLogout()
    navigate('/login')
  }, [onLogout, navigate])

  const handleNav = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <nav className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>{sidebarContent.title}</h1>
        <p className={styles.brandSub}>{sidebarContent.subtitle}</p>
      </div>

      <div className={styles.nav}>
        {sidebarContent.nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={handleNav}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ''}`
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            {sidebarContent.logout.icon}
          </span>
          <span>{sidebarContent.logout.label}</span>
        </button>
      </div>
    </nav>
  )
}
