import { sidebarContent } from '../../constants/admin/content'
import { brandAssets } from '../../constants/home/content'
import { MaterialIcon } from '../shared/MaterialIcon'
import styles from './HeaderBar.module.scss'

interface HeaderBarProps {
  onToggle: () => void
}

export function HeaderBar({ onToggle }: HeaderBarProps) {
  return (
    <div className={styles.bar}>
      <button className={styles.hamburger} onClick={onToggle} aria-label="Toggle menu">
        <MaterialIcon name="menu" />
      </button>
      <img src={brandAssets.logo} alt={sidebarContent.title} width="73" height="28" className={styles.logo} />
    </div>
  )
}
