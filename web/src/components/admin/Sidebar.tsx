import { useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { sidebarContent } from '../../constants/admin/content'
import { brandAssets } from '../../constants/home/content'
import { MaterialIcon } from '../shared/MaterialIcon'
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
        <img src={brandAssets.logo} alt={sidebarContent.title} width="73" height="28" className={styles.logo} />
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
            <MaterialIcon name={item.icon} style={{ fontSize: 24 }} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <MaterialIcon name={sidebarContent.logout.icon} style={{ fontSize: 24 }} />
          <span>{sidebarContent.logout.label}</span>
        </button>
      </div>
    </nav>
  )
}
